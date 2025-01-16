# 令牌交换时浏览器认证弹窗问题

## 问题描述
在OAuth授权流程中，当进行授权码换取访问令牌的请求时，浏览器会弹出基本认证(Basic Authentication)对话框，中断了正常的登录流程。这个认证框是浏览器自带的，会影响用户体验。

## 原因分析
1. 服务器在令牌交换请求返回401状态码时，响应头中包含了 `WWW-Authenticate` 字段
2. 浏览器检测到这个响应头，自动弹出内置的认证对话框
3. 这种行为会打断OAuth的正常流程，造成用户困惑

## 解决方案

### 1. 添加AJAX请求头
```javascript
headers: {
  'Content-Type': 'application/x-www-form-urlencoded',
  'X-Requested-With': 'XMLHttpRequest'  // 标识这是AJAX请求
}
```

### 2. 禁用认证信息
```javascript
credentials: 'omit'  // 阻止发送认证信息
```

### 3. 完整的请求配置
```javascript
const response = await fetch(tokenUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'omit',
  body: params.toString()
});
```

## 技术说明
1. `X-Requested-With: XMLHttpRequest`
   - 标识请求为AJAX请求
   - 服务器通常会避免对AJAX请求返回认证提示
   - 是一种广泛使用的最佳实践

2. `credentials: 'omit'`
   - 阻止浏览器发送任何认证信息
   - 防止触发浏览器的认证机制
   - 适用于不需要Cookie或HTTP认证的请求

## 效果
1. 避免浏览器弹出认证对话框
2. 保持OAuth流程的连续性
3. 改善用户体验

## 注意事项
1. 确保服务器正确处理带有 `X-Requested-With` 头的请求
2. 监控令牌交换失败的情况
3. 提供清晰的错误提示

## 后续建议
1. 添加请求超时处理
2. 实现更友好的错误提示
3. 考虑添加重试机制
4. 完善错误日志记录 