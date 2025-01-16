# 滴答清单项目数据API路径修正

## 问题描述
在获取项目任务时使用了错误的API路径 `/project/{projectId}/task`，导致无法获取完整的项目数据。根据滴答清单开放API文档，正确的路径应该是 `/project/{projectId}/data`。

## 错误分析
1. API路径错误：使用了 `/task` 而不是 `/data`
2. 数据过滤逻辑需要调整：
   - 原来依赖API参数进行过滤
   - 现在需要在客户端进行过滤
3. 返回数据结构不同：
   - `/data` 端点返回完整的项目数据，包括任务列表
   - 需要从返回数据中提取任务信息

## 解决方案

### 1. 修正API路径
```javascript
// 修改为使用 /data 端点
const projectData = await this.request(`/project/${project.id}/data`, {
  method: 'GET'
});
```

### 2. 添加客户端过滤逻辑
```javascript
// 过滤任务
const filteredTasks = projectData.tasks.filter(task => {
  if (!params.status || params.status === 'all') {
    return true;
  }
  return task.status === params.status;
});

// 根据日期范围过滤
const startDate = params.from ? new Date(params.from) : null;
const endDate = params.to ? new Date(params.to) : null;

const dateFilteredTasks = filteredTasks.filter(task => {
  const taskDate = new Date(task.startDate || task.dueDate || task.createdTime);
  if (startDate && taskDate < startDate) return false;
  if (endDate && taskDate > endDate) return false;
  return true;
});
```

### 3. 添加专门的项目数据获取方法
```javascript
async getProjectData(projectId) {
  if (!projectId) {
    throw new Error('获取项目数据需要提供项目ID');
  }
  return this.request(`/project/${projectId}/data`);
}
```

## API规范说明
1. 获取项目数据：
   ```http
   GET /open/v1/project/{{projectId}}/data HTTP/1.1
   Host: api.dida365.com
   Authorization: Bearer {{token}}
   ```

## 主要改进
1. 更正API端点路径
2. 实现客户端数据过滤
3. 添加专门的数据获取方法
4. 优化错误处理和日志
5. 改进数据处理逻辑

## 验证方法
1. 检查项目数据请求是否成功
2. 验证任务过滤是否正确
3. 测试日期范围过滤
4. 确认数据格式处理

## 注意事项
1. 确保正确处理API响应数据
2. 验证过滤逻辑的准确性
3. 处理可能的空值情况
4. 保持错误处理的一致性

## 后续优化建议
1. 添加数据缓存机制
2. 实现增量更新
3. 优化过滤性能
4. 添加数据验证
5. 考虑批量操作支持 