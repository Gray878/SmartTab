const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const AUTH_TIMEOUT = 30000;

// 不需要重试的错误类型
const NON_RETRYABLE_ERRORS = [
  'OAuth配置无效',
  '重定向URL无效',
  '未获取到授权码',
  '令牌验证失败',
  'invalid_scope',
  'invalid_request',
  'access_denied'
];

// 检查是否需要重试
function shouldRetry(error) {
  // 检查是否是已知的不需要重试的错误
  for (const nonRetryError of NON_RETRYABLE_ERRORS) {
    if (error.message.includes(nonRetryError)) {
      return false;
    }
  }
  
  // 检查是否是网络错误或超时错误
  return error.message.includes('timeout') || 
         error.message.includes('network') ||
         error.message.includes('failed to fetch');
}

// 验证OAuth配置
async function validateAuthConfig() {
  try {
    // 只验证必要的配置
    const configValid = 
      this.clientId &&
      this.redirectUri &&
      this.redirectUri.startsWith('https://') &&
      this.redirectUri.includes('.chromiumapp.org');

    console.log('OAuth配置验证:', {
      clientId: !!this.clientId,
      redirectUri: this.redirectUri,
      valid: configValid
    });

    return configValid;
  } catch (error) {
    console.error('配置验证失败:', error);
    return false;
  }
}

// 验证重定向URL格式
function validateRedirectUrl(url) {
  try {
    const redirectUrl = new URL(url);
    const valid = 
      redirectUrl.protocol === 'https:' &&
      redirectUrl.hostname.endsWith('.chromiumapp.org') &&
      redirectUrl.pathname === '/';
      
    console.log('重定向URL验证:', {
      url,
      valid,
      protocol: redirectUrl.protocol,
      hostname: redirectUrl.hostname,
      pathname: redirectUrl.pathname
    });
    
    return valid;
  } catch (error) {
    console.error('重定向URL无效:', error);
    return false;
  }
}

export class Dida365Service {
  constructor() {
    this.apiBase = 'https://api.dida365.com/api/v2';
    this.clientId = 'SmartTab';
    this.redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
    this.accessToken = null;
  }

  // 获取项目列表
  async getProjects() {
    try {
      const response = await fetch(`${this.apiBase}/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`获取项目列表失败: ${response.status}`);
      }

      const projects = await response.json();
      return projects;
    } catch (error) {
      console.error('获取项目列表时出错:', error);
      throw error;
    }
  }

  // 获取项目数据（包括任务）
  async getProjectData(projectId) {
    try {
      const response = await fetch(`${this.apiBase}/project/${projectId}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`获取项目数据失败: ${response.status}`);
      }

      const tasks = await response.json();
      return { tasks };
    } catch (error) {
      console.error('获取项目数据时出错:', error);
      throw error;
    }
  }

  // 更新任务状态
  async updateTaskStatus(taskId, status) {
    try {
      // 首先获取任务所属的项目ID和任务详情
      const projects = await this.getProjects();
      let projectId = null;
      let taskData = null;
      
      // 遍历项目查找任务
      for (const project of projects) {
        try {
          const projectData = await this.getProjectData(project.id);
          const task = projectData.tasks.find(t => t.id === taskId);
          if (task) {
            projectId = project.id;
            taskData = task;
            break;
          }
        } catch (error) {
          console.warn(`检查项目 ${project.id} 时出错:`, error);
        }
      }

      if (!projectId || !taskData) {
        throw new Error('找不到任务所属的项目');
      }

      // 转换状态为数字: 'completed' -> 2, 'normal' -> 0
      const statusCode = status === 'completed' ? 2 : 0;

      // 使用官方API更新任务
      const response = await fetch(`https://api.dida365.com/open/v1/task/${taskId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: taskId,
          projectId: projectId,
          status: statusCode,
          title: taskData.title,
          content: taskData.content || '',
          desc: taskData.desc || '',
          priority: taskData.priority || 0,
          dueDate: taskData.dueDate || null,
          isAllDay: taskData.isAllDay || false,
          reminders: taskData.reminders || [],
          repeatFlag: taskData.repeatFlag || null,
          exDate: taskData.exDate || [],
          completedTime: statusCode === 2 ? new Date().toISOString() : null,
          tags: taskData.tags || []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`更新任务状态失败: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('更新任务状态时出错:', error);
      throw error;
    }
  }

  // 检查登录状态
  async checkLoginStatus() {
    try {
      if (!this.accessToken) {
        const token = await this.getStoredToken();
        if (!token) {
          return false;
        }
        this.accessToken = token;
      }

      // 验证token是否有效
      const response = await fetch(`${this.apiBase}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Device': 'Chrome Extension',
          'X-Platform': 'web'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('检查登录状态时出错:', error);
      return false;
    }
  }

  // 获取存储的token
  async getStoredToken() {
    try {
      const result = await chrome.storage.local.get(['dida365_token']);
      return result.dida365_token;
    } catch (error) {
      console.error('获取存储的token时出错:', error);
      return null;
    }
  }

  // 存储token
  async storeToken(token) {
    try {
      await chrome.storage.local.set({
        dida365_token: token
      });
    } catch (error) {
      console.error('存储token时出错:', error);
      throw error;
    }
  }

  // 授权方法
  async authorize() {
    try {
      // 验证基本配置
      if (!await validateAuthConfig.call(this)) {
        throw new Error('OAuth配置无效');
      }

      // 验证重定向URL
      if (!validateRedirectUrl(this.redirectUri)) {
        throw new Error('重定向URL无效');
      }

      const state = Math.random().toString(36).substring(7);
      const authUrl = `https://dida365.com/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `scope=tasks:read tasks:write&` +
        `response_type=code&` +
        `state=${state}`;

      const responseUrl = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('授权请求超时'));
        }, AUTH_TIMEOUT);

        chrome.identity.launchWebAuthFlow({
          url: authUrl,
          interactive: true
        }, (redirectUrl) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(redirectUrl);
        });
      });

      const url = new URL(responseUrl);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');

      if (returnedState !== state) {
        throw new Error('状态不匹配，可能存在安全风险');
      }

      if (!code) {
        throw new Error('未获取到授权码');
      }

      // 获取访问令牌
      const tokenResponse = await fetch('https://dida365.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Device': 'Chrome Extension',
          'X-Platform': 'web'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          code: code,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`获取访问令牌失败: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      this.accessToken = tokenData.access_token;
      await this.storeToken(this.accessToken);

      return true;
    } catch (error) {
      console.error('授权过程出错:', error);
      
      // 检查是否需要重试
      if (shouldRetry(error) && this.authRetryCount < this.maxAuthRetries) {
        this.authRetryCount++;
        console.log(`授权重试 (${this.authRetryCount}/${this.maxAuthRetries})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.authorize();
      }
      
      throw error;
    }
  }
} 