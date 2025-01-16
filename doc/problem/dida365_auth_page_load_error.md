# 滴答清单授权页面加载失败问题

## 问题描述
控制台报错：
```
Authorization page could not be loaded.
```

## 错误分析
1. 授权URL可以成功构建，但页面无法加载
2. 错误发生在 `chrome.identity.launchWebAuthFlow` 阶段
3. 扩展ID已正确生成：bnjkhjnkcbhhaimonieabpmfepemaaca

## 可能的原因
1. 滴答清单服务器访问限制
2. 重定向URL未在滴答清单开发者平台注册
3. CSP (Content Security Policy) 限制
4. 网络连接问题

## 解决方案

### 1. 验证授权端点
```javascript
// 在授权前添加端点验证
async function validateAuthEndpoint() {
  try {
    const response = await fetch('https://dida365.com/oauth/authorize', {
      method: 'HEAD'
    });
    return response.ok;
  } catch (error) {
    console.error('授权端点不可用:', error);
    return false;
  }
}
```

### 2. 修改授权流程
```javascript
async authorize() {
  try {
    // 验证端点可用性
    if (!await validateAuthEndpoint()) {
      throw new Error('授权服务不可用，请稍后重试');
    }

    // 构建授权URL
    const scopes = encodeURIComponent('tasks:read tasks:write');
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = new URL('https://dida365.com/oauth/authorize');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('state', state);

    console.log('授权URL:', authUrl.toString());

    // 添加超时处理
    const authPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('授权请求超时'));
      }, 30000); // 30秒超时

      chrome.identity.launchWebAuthFlow({
        url: authUrl.toString(),
        interactive: true
      }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(response);
      });
    });

    const response = await authPromise;
    // 处理响应...
  } catch (error) {
    console.error('授权失败:', error);
    throw error;
  }
}
```

### 3. 更新manifest.json配置
```json
{
  "permissions": [
    "identity"
  ],
  "host_permissions": [
    "https://dida365.com/*",
    "https://*.chromiumapp.org/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self' https://dida365.com https://api.dida365.com;"
  }
}
```

### 4. 添加错误恢复机制
```javascript
class Dida365Service {
  constructor() {
    this.authRetryCount = 0;
    this.maxAuthRetries = 3;
  }

  async authorizeWithRetry() {
    try {
      return await this.authorize();
    } catch (error) {
      if (this.authRetryCount < this.maxAuthRetries) {
        this.authRetryCount++;
        console.log(`授权重试 (${this.authRetryCount}/${this.maxAuthRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.authorizeWithRetry();
      }
      throw error;
    }
  }
}
```

## 调试步骤
1. 检查网络连接
2. 验证授权URL是否可访问
3. 确认重定向URL已在开发者平台注册
4. 检查CSP配置
5. 查看Chrome扩展日志

## 临时解决方案
如果问题持续存在，可以尝试：
1. 使用备用授权端点
2. 实现备用登录方式
3. 添加离线模式支持

## 后续优化建议
1. 添加网络状态检测
2. 实现优雅的降级处理
3. 改进错误提示界面
4. 添加自动重试机制
5. 实现详细的错误日志 