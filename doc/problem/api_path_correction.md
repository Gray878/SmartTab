# 滴答清单API路径错误修复

## 问题描述
在登录刷新后，控制台报错显示API请求失败(404 Not Found)。原因是使用了错误的API路径(`/api/v2`)，而滴答清单开放API的正确路径应该是(`/open/v1`)。

## 错误分析
1. API基础路径错误：使用了 `/api/v2` 而不是 `/open/v1`
2. 任务相关API的端点结构不正确：没有包含必要的项目ID
3. 请求参数格式与开放API要求不符

## 解决方案

### 1. 修正基础URL
```javascript
constructor() {
  this.baseUrl = 'https://api.dida365.com/open/v1';  // 更新为正确的API路径
  // ...
}
```

### 2. 调整任务列表获取逻辑
```javascript
async getTasks(params = {}) {
  // 首先获取项目列表
  const projects = await this.request('/project/all');
  let allTasks = [];
  
  // 遍历所有项目获取任务
  for (const project of projects) {
    try {
      const projectTasks = await this.request(`/project/${project.id}/task`, {
        method: 'GET',
        params: {
          from: params.startDate || new Date().toISOString(),
          to: params.endDate || '',
          status: params.status || 'all',
          ...params
        }
      });
      allTasks = allTasks.concat(projectTasks);
    } catch (error) {
      console.error(`获取项目 ${project.id} 的任务失败:`, error);
    }
  }
  
  return allTasks;
}
```

### 3. 更新任务操作API
```javascript
// 创建任务
async createTask(task) {
  const projects = await this.request('/project/all');
  const defaultProject = projects[0];
  
  return this.request(`/project/${task.projectId || defaultProject.id}/task`, {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
}

// 更新任务
async updateTask(taskId, updates, projectId) {
  if (!projectId) {
    throw new Error('更新任务需要提供项目ID');
  }
  return this.request(`/project/${projectId}/task/${taskId}`, {
    method: 'POST',
    body: JSON.stringify(updates)
  });
}
```

## 主要改动
1. 基础路径修改
2. 添加项目ID相关逻辑
3. 调整请求参数格式
4. 更新API端点结构
5. 添加错误处理

## 验证方法
1. 检查网络请求是否返回200状态码
2. 验证任务列表是否正确显示
3. 测试任务的创建、更新和删除操作

## 注意事项
1. 所有任务操作都需要项目ID
2. 注意处理项目列表为空的情况
3. 添加适当的错误提示
4. 确保日期格式符合API要求

## 后续优化建议
1. 添加项目缓存机制
2. 实现批量操作接口
3. 优化错误处理逻辑
4. 添加请求重试机制 