# 滴答清单Scope参数编码问题

## 问题描述
授权URL返回错误：
```
error=invalid_scope
error_description=Invalid scope: tasks%253Aread%2520tasks%253Awrite
```

## 错误分析
1. scope参数被重复编码
2. URL.searchParams.append自动进行了一次编码
3. 我们手动又进行了一次encodeURIComponent编码

## 解决方案

### 1. 移除手动编码
```javascript
// 修改前
const scopes = encodeURIComponent('tasks:read tasks:write');
authUrl.searchParams.append('scope', scopes);

// 修改后
authUrl.searchParams.append('scope', 'tasks:read tasks:write');
```

### 2. 使用URLSearchParams自动编码
```javascript
const authUrl = new URL('https://dida365.com/oauth/authorize');
authUrl.searchParams.append('client_id', this.clientId);
authUrl.searchParams.append('redirect_uri', this.redirectUri);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('scope', 'tasks:read tasks:write');
```

### 3. 添加错误处理
```javascript
// 检查错误响应
const responseUrl = new URL(redirectUrl);
const error = responseUrl.searchParams.get('error');
const error_description = responseUrl.searchParams.get('error_description');
if (error) {
  throw new Error(`授权失败: ${error} - ${error_description}`);
}
```

## 验证方法
1. 检查生成的授权URL中的scope参数
2. 确认scope参数格式：`tasks:read tasks:write`
3. 验证授权服务器的响应

## 调试技巧
1. 打印完整的授权URL：
```javascript
console.log('授权URL:', authUrl.toString());
```

2. 检查URL参数编码：
```javascript
console.log('Scope参数:', authUrl.searchParams.get('scope'));
```

3. 监控授权响应：
```javascript
console.log('授权响应:', response);
console.log('错误信息:', error, error_description);
```

## 注意事项
1. 不要手动编码URL参数
2. 使用URLSearchParams处理参数
3. 正确处理错误响应
4. 保持scope格式一致

## 相关文档
- [URLSearchParams API](https://developer.mozilla.org/docs/Web/API/URLSearchParams)
- [OAuth 2.0 Scope](https://tools.ietf.org/html/rfc6749#section-3.3)
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/) 