# 滴答清单重定向URL注册错误

## 问题描述
访问授权URL时报错：
```
OAuth Error
error="invalid_request"
error_description="At least one redirect_uri must be registered with the client."
```

## 错误分析
1. 错误表明客户端(client_id)没有注册任何重定向URL
2. 这是OAuth2.0安全机制的要求
3. 需要在滴答清单开发者平台注册有效的重定向URL

## 解决步骤

### 1. 获取当前扩展的重定向URL
```javascript
// 在Chrome控制台执行
console.log('扩展ID:', chrome.runtime.id);
console.log('重定向URL:', `https://${chrome.runtime.id}.chromiumapp.org/`);
```

### 2. 滴答清单开发者平台配置
1. 登录滴答清单开发者平台：https://dida365.com/oauth/apps
2. 找到你的应用（client_id: v06ClDCHAU96m7QJqc）
3. 添加以下重定向URL：
   - `https://*.chromiumapp.org/*` （通配符方式）
   - 或具体的URL：`https://[你的扩展ID].chromiumapp.org/`

### 3. 验证配置
```javascript
// 在dida365Service.js中添加验证代码
async function verifyRedirectUri() {
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  const testUrl = `https://dida365.com/oauth/authorize?` +
    `client_id=${this.clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=tasks:read`;

  try {
    const response = await fetch(testUrl);
    console.log('重定向URL验证结果:', response.status);
    return response.ok;
  } catch (error) {
    console.error('重定向URL验证失败:', error);
    return false;
  }
}
```

### 4. 更新manifest.json
确保manifest.json包含必要的权限：
```json
{
  "permissions": [
    "identity"
  ],
  "host_permissions": [
    "https://dida365.com/*",
    "https://*.chromiumapp.org/*"
  ]
}
```

## 验证方法
1. 在开发者平台添加重定向URL后
2. 重新加载扩展
3. 尝试授权流程
4. 检查网络请求中的重定向URL是否匹配

## 注意事项
1. 重定向URL必须完全匹配
2. 使用HTTPS协议
3. 域名必须是chromiumapp.org
4. 确保扩展ID正确

## 调试技巧
1. 使用console.log输出实际使用的重定向URL
2. 检查开发者平台的配置
3. 验证URL的格式和编码
4. 确保没有多余的斜杠或参数

## 预防措施
1. 在开发阶段就注册重定向URL
2. 使用通配符URL以适应不同的扩展ID
3. 保存重定向URL的配置记录
4. 定期验证URL的有效性

## 相关文档
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [OAuth 2.0 重定向URI](https://tools.ietf.org/html/rfc6749#section-3.1.2) 