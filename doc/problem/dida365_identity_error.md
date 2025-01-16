# 滴答清单身份验证错误问题

## 问题描述
控制台报错：
```
dida365Service.js:9 Uncaught TypeError: Cannot read properties of undefined (reading 'getRedirectURL')
    at new Dida365Service (dida365Service.js:9:40)
    at new TodoManager (todo.js:8:24)
```

## 原因分析
1. `chrome.identity.getRedirectURL()` 无法访问
2. 缺少必要的权限配置
3. 重定向URL的生成方式不正确
4. 缺少扩展密钥配置

## 解决方案

### 1. 修改重定向URL的获取方式
```javascript
export class Dida365Service {
  constructor() {
    this.baseUrl = 'https://api.dida365.com/api/v2';
    this.token = null;
    this.clientId = 'v06ClDCHAU96m7QJqc';
    // 使用扩展ID构建重定向URL
    this.redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
    this.checkLoginStatus();
  }
}
```

### 2. 更新manifest.json配置
```json
{
  "permissions": [
    "identity"
  ],
  "oauth2": {
    "client_id": "v06ClDCHAU96m7QJqc",
    "scopes": ["tasks:read", "tasks:write"]
  },
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv8+LmA7QqQ==",
  "host_permissions": [
    "https://*.chromiumapp.org/*"
  ]
}
```

### 3. 添加错误处理
```javascript
try {
  this.redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
} catch (error) {
  console.error('获取重定向URL失败:', error);
  this.redirectUri = 'https://localhost/oauth/callback';
}
```

## 验证方法
1. 检查控制台是否还有相关错误
2. 验证OAuth2授权流程是否正常
3. 确认重定向URL是否正确生成
4. 测试完整的登录流程

## 注意事项
1. 确保扩展ID保持一致性
2. 在滴答清单开发者平台配置正确的重定向URL
3. 使用正确的client_id
4. 保持扩展密钥的安全性
5. 添加适当的错误处理机制

## 相关文档
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [OAuth 2.0 for Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)
- [滴答清单 OAuth2.0 文档](https://www.dida365.com/api/oauth2)

## 后续优化建议
1. 添加重试机制
2. 优化错误提示
3. 实现令牌刷新
4. 添加登录状态持久化
5. 改进安全性措施 