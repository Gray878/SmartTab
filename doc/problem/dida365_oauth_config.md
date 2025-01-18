# 滴答清单OAuth授权配置问题

## 问题描述
点击"连接滴答清单"按钮时报错：`Error: Authorization page could not be loaded.`
这是因为OAuth配置不完整，缺少必要的参数和正确的客户端凭据。

## 错误详情
```
OAuth配置验证: {clientId: true, redirectUri: 'https://bnjkhjnkcbhhaimonieabpmfepemaaca.chromiumapp.org/', valid: true}
重定向URL验证: {url: 'https://bnjkhjnkcbhhaimonieabpmfepemaaca.chromiumapp.org/', valid: true, protocol: 'https:', hostname: 'bnjkhjnkcbhhaimonieabpmfepemaaca.chromiumapp.org', pathname: '/'}
授权过程出错: Error: Authorization page could not be loaded.
```

## 问题原因
1. 使用了硬编码的测试 client_id ('SmartTab')
2. 缺少 client_secret
3. OAuth授权URL缺少必要的参数
4. 令牌请求缺少正确的认证头

## 解决方案

### 1. 完善OAuth配置
```javascript
constructor() {
  this.clientId = 'YOUR_CLIENT_ID';        // 从开发者平台获取
  this.clientSecret = 'YOUR_CLIENT_SECRET'; // 从开发者平台获取
  this.redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
}
```

### 2. 优化授权URL
```javascript
const authUrl = `${this.authBase}/oauth/authorize?` +
  `client_id=${encodeURIComponent(this.clientId)}&` +
  `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
  `scope=${encodeURIComponent('tasks:read tasks:write')}&` +
  `response_type=code&` +
  `state=${encodeURIComponent(state)}&` +
  `prompt=login&` +
  `access_type=offline`;
```

### 3. 添加正确的认证头
```javascript
const tokenResponse = await fetch(`${this.authBase}/oauth/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`),
    'X-Device': 'Chrome Extension',
    'X-Platform': 'web'
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: this.redirectUri,
    client_id: this.clientId,
    client_secret: this.clientSecret
  })
});
```

## 后续步骤
1. 在滴答清单开发者平台注册应用
2. 获取正确的 client_id 和 client_secret
3. 更新代码中的凭据
4. 测试授权流程

## 注意事项
1. 不要在代码中硬编码真实的 client_secret
2. 使用环境变量或配置文件存储敏感信息
3. 确保重定向URI与开发者平台注册的一致
4. 正确处理令牌刷新和错误重试 