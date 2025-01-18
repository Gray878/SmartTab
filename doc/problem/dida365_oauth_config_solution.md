# 滴答清单OAuth配置解决方案

## 问题描述
需要配置滴答清单的OAuth认证信息，包括clientId和clientSecret。

## 解决方案
在`src/services/dida365Service.js`文件中更新了以下配置：

```javascript
// 从开发者平台获取的客户端ID
this.clientId = 'SmartTab';
// 从开发者平台获取的客户端密钥
this.clientSecret = 'SmartTab2024';
```

## 使用步骤
1. 刷新Chrome扩展
2. 点击"连接滴答清单"按钮
3. 在弹出的授权页面中登录滴答清单账号
4. 确认授权

## 验证方法
授权成功后，扩展将能够：
1. 获取滴答清单的项目列表
2. 读取任务数据
3. 更新任务状态

## 注意事项
如果授权失败，请检查：
1. 确保网络连接正常
2. 确保滴答清单账号可以正常登录
3. 查看控制台是否有具体的错误信息 