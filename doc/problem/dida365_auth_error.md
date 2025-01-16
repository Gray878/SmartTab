# 滴答清单授权按钮报错问题

## 问题描述
点击"连接滴答清单"按钮后报错：
```
开始滴答清单授权
todo.js:501 尝试登录
todo.js:507 登录失败: TypeError: this.didaService.authorize is not a function
```

## 原因分析
1. `dida365Service.js` 中缺少 `authorize` 方法
2. 导出方式不正确，使用了默认导出单例
3. 缺少必要的 Chrome 扩展权限
4. 缺少 OAuth2 相关配置

## 解决方案

### 1. 修改 dida365Service.js
```javascript
export class Dida365Service {
  constructor() {
    this.baseUrl = 'https://api.dida365.com/api/v2';
    this.token = null;
    this.clientId = 'YOUR_CLIENT_ID';
    this.redirectUri = chrome.identity.getRedirectURL();
  }

  async authorize() {
    // 实现授权逻辑
    const authUrl = `https://dida365.com/oauth/authorize?...`;
    const authCode = await chrome.identity.launchWebAuthFlow({...});
    const tokenData = await fetch('https://dida365.com/oauth/token', {...});
    await chrome.storage.local.set({ dida365_token: this.token });
  }
}
```

### 2. 修改 todo.js 的导入
```javascript
import { Dida365Service } from './services/dida365Service.js';

class TodoManager {
  constructor() {
    this.didaService = new Dida365Service();
  }
}
```

### 3. 更新 manifest.json
```json
{
  "permissions": [
    "identity"
  ],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID",
    "scopes": ["tasks:read", "tasks:write"]
  }
}
```

## 后续步骤
1. 在滴答清单开发者平台注册应用
2. 获取 client_id 并替换配置中的 YOUR_CLIENT_ID
3. 设置正确的重定向 URI：`https://<extension-id>.chromiumapp.org/`
4. 重新加载扩展以使更改生效

## 验证方法
1. 打开 Chrome 开发者工具
2. 切换到 Console 面板
3. 点击"连接滴答清单"按钮
4. 确认没有 TypeError 错误
5. 检查授权流程是否正常进行

## 相关文档
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [滴答清单 OAuth2.0 文档](https://www.dida365.com/api/oauth2) 