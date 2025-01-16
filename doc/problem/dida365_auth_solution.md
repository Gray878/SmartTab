# 滴答清单认证方案调整

## 问题描述
滴答清单没有提供直接的用户名密码登录接口，需要使用 OAuth2.0 认证流程。

## 解决方案
1. 使用滴答清单的 OAuth2.0 认证流程：
   - 用户点击"连接滴答清单"按钮
   - 跳转到滴答清单的授权页面
   - 用户在滴答清单官方页面完成登录
   - 获取授权码并交换访问令牌

2. 修改认证流程代码：
```javascript
class Dida365Service {
  constructor() {
    this.baseUrl = 'https://api.dida365.com/api/v2';
    this.token = null;
    this.clientId = 'YOUR_CLIENT_ID'; // 从滴答清单开发者平台获取
    this.redirectUri = chrome.identity.getRedirectURL();
  }

  async authorize() {
    const authUrl = `https://dida365.com/oauth/authorize?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `response_type=code&` +
      `scope=tasks:read tasks:write`;

    try {
      const authCode = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
          url: authUrl,
          interactive: true
        }, (redirectUrl) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          const code = new URL(redirectUrl).searchParams.get('code');
          resolve(code);
        });
      });

      // 使用授权码交换访问令牌
      const tokenResponse = await fetch('https://dida365.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.clientId,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        })
      });

      const tokenData = await tokenResponse.json();
      this.token = tokenData.access_token;
      await chrome.storage.local.set({ dida365_token: this.token });
      return true;
    } catch (error) {
      console.error('授权失败:', error);
      throw error;
    }
  }
}
```

3. 修改登录界面：
```html
<div id="dida365-login" class="dida365-login">
  <h3>连接滴答清单</h3>
  <p class="login-desc">使用滴答清单账号登录，同步你的待办事项</p>
  <button id="connect-dida365" class="connect-button">
    <img src="dida365-logo.svg" alt="滴答清单">
    连接滴答清单
  </button>
  <div class="login-links">
    <a href="https://www.dida365.com/signup" target="_blank">注册账号</a>
  </div>
</div>
```

4. 更新样式：
```css
.dida365-login {
  text-align: center;
  padding: 2.5rem;
}

.login-desc {
  color: #666;
  margin-bottom: 1.5rem;
}

.connect-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.connect-button img {
  width: 24px;
  height: 24px;
}
```

## 注意事项
1. 需要在滴答清单开发者平台注册应用
2. 配置正确的重定向 URI
3. 添加必要的权限：
   ```json
   {
     "permissions": [
       "identity"
     ],
     "oauth2": {
       "client_id": "${YOUR_CLIENT_ID}",
       "scopes": ["tasks:read", "tasks:write"]
     }
   }
   ```

## 相关文档
- [滴答清单 OAuth2.0 文档](https://www.dida365.com/api/oauth2)
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/) 