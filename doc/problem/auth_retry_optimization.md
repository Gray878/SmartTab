# 授权重试逻辑优化

## 问题描述
在授权失败时，系统会无条件进行重试，导致某些明确的错误（如用户取消授权、配置错误等）也会重复尝试，造成不必要的网络请求和用户困扰。

## 错误分析
1. 原有重试逻辑过于简单，只考虑重试次数
2. 没有区分不同类型的错误
3. 某些错误重试也无法解决

## 解决方案

### 1. 定义不可重试的错误类型
```javascript
const NON_RETRYABLE_ERRORS = [
  'OAuth配置无效',
  '重定向URL无效',
  '未获取到授权码',
  '令牌验证失败',
  'invalid_scope',
  'invalid_request',
  'access_denied'
];
```

### 2. 添加错误判断逻辑
```javascript
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
```

### 3. 优化重试流程
```javascript
try {
  // 授权逻辑...
} catch (error) {
  console.error('授权失败:', error);
  
  // 检查是否需要重试
  if (shouldRetry(error) && this.authRetryCount < this.maxAuthRetries) {
    this.authRetryCount++;
    console.log(`授权重试 (${this.authRetryCount}/${this.maxAuthRetries})`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return this.authorize();
  }
  
  // 重置重试计数
  this.authRetryCount = 0;
  throw error;
}
```

## 优化效果
1. 避免无意义的重试
2. 提升用户体验
3. 减少不必要的网络请求
4. 更清晰的错误处理

## 重试场景

### 需要重试的情况
1. 网络超时
2. 连接失败
3. 服务器临时错误

### 不需要重试的情况
1. 配置错误
2. 用户取消授权
3. 权限不足
4. 参数错误

## 调试方法
1. 检查错误类型：
```javascript
console.log('错误类型:', error.message);
console.log('是否需要重试:', shouldRetry(error));
```

2. 监控重试次数：
```javascript
console.log(`当前重试次数: ${this.authRetryCount}/${this.maxAuthRetries}`);
```

## 注意事项
1. 及时重置重试计数
2. 正确识别错误类型
3. 避免过度重试
4. 提供清晰的错误提示

## 后续优化建议
1. 添加错误分类机制
2. 实现指数退避重试
3. 优化错误提示信息
4. 添加用户反馈机制 