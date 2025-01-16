# Chrome Identity API 访问错误问题

## 问题描述
控制台报错：
```
Error: Chrome Identity API 不可用
at redirectUrl (dida365Service.js:28:18)
at new Promise (<anonymous>)
at Dida365Service.authorize (dida365Service.js:26:33)
```

## 原因分析
1. manifest.json 权限配置不完整
2. 扩展未正确打包或安装
3. 扩展ID不匹配
4. 浏览器策略限制

## 解决方案

### 1. 检查manifest.json配置
确保manifest.json包含以下必要配置：
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
    "https://*.chromiumapp.org/*",
    "https://api.dida365.com/*"
  ]
}
```

### 2. 扩展安装步骤
1. 打开Chrome扩展管理页面 (chrome://extensions/)
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择扩展目录

### 3. 验证扩展ID
1. 检查当前扩展ID是否与OAuth配置匹配
2. 确保重定向URL使用正确的扩展ID
3. 验证manifest.json中的key值是否正确

### 4. 浏览器配置
1. 确保Chrome版本支持Identity API
2. 检查浏览器策略设置
3. 尝试在隐私模式下测试

## 验证步骤
1. 重新加载扩展
2. 打开控制台，观察错误信息
3. 尝试授权流程
4. 检查网络请求

## 预防措施
1. 在开发时进行API可用性检查
2. 添加友好的错误提示
3. 实现降级方案
4. 保持详细的错误日志

## 相关API文档
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [OAuth2 配置](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/) 