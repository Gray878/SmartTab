# 滴答清单授权URL问题分析

## 当前URL分析
```
https://dida365.com/oauth/authorize?
client_id=v06ClDCHAU96m7QJqc&
redirect_uri=https%3A%2F%2Felmmpnjkpagcdpgihceinhdjhddhnmaf.chromiumapp.org%2F&
response_type=code&
scope=tasks:read tasks:write
```

## 问题点分析
1. 扩展ID问题：
   - 当前ID: elmmpnjkpagcdpgihceinhdjhddhnmaf
   - 这个ID可能与manifest.json中的key不匹配

2. URL编码问题：
   - scope参数中的空格可能导致问题
   - 应该对scope进行URL编码

3. 重定向URI问题：
   - 使用了固定的扩展ID
   - 应该使用chrome.identity.getRedirectURL()动态获取

## 解决方案

### 1. 修改dida365Service.js中的授权URL构建
```javascript
class Dida365Service {
  constructor() {
    // 动态获取重定向URL
    this.redirectUri = chrome.identity.getRedirectURL();
    this.clientId = 'v06ClDCHAU96m7QJqc';
  }

  async authorize() {
    try {
      // 正确编码scope参数
      const scopes = encodeURIComponent('tasks:read tasks:write');
      
      const authUrl = `https://dida365.com/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `response_type=code&` +
        `scope=${scopes}`;

      console.log('授权URL:', authUrl);

      // 其他代码...
    } catch (error) {
      console.error('授权URL构建失败:', error);
      throw error;
    }
  }
}
```

### 2. 更新manifest.json配置
```json
{
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv8+LmA7QqQ==",
  "oauth2": {
    "client_id": "v06ClDCHAU96m7QJqc",
    "scopes": [
      "tasks:read",
      "tasks:write"
    ]
  }
}
```

### 3. 验证步骤
1. 检查manifest.json中的key是否正确
2. 验证生成的扩展ID是否与预期匹配
3. 确认重定向URL是否正确注册在滴答清单开发者平台

### 4. 调试方法
```javascript
// 在authorize方法开始时添加调试信息
console.log('扩展ID:', chrome.runtime.id);
console.log('重定向URL:', this.redirectUri);
console.log('客户端ID:', this.clientId);
```

## 临时解决方案
如果chrome.identity API确实不可用，可以尝试以下降级方案：

```javascript
class Dida365Service {
  constructor() {
    this.redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
    // 如果无法获取runtime.id，使用固定值
    if (!chrome.runtime.id) {
      this.redirectUri = 'https://elmmpnjkpagcdpgihceinhdjhddhnmaf.chromiumapp.org/';
    }
  }
}
```

## 注意事项
1. 确保滴答清单开发者平台已注册所有可能的重定向URL
2. 检查Chrome扩展的权限是否正确
3. 验证OAuth配置是否完整
4. 添加详细的错误日志

## 后续优化建议
1. 添加URL有效性检查
2. 实现授权重试机制
3. 改进错误提示
4. 添加用户友好的错误处理界面 