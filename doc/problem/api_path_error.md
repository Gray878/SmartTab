# 滴答清单API路径错误问题

## 问题描述
在将API从v2迁移到v1版本时，出现以下错误：
1. `GET https://api.dida365.com/open/v1/user/profile net::ERR_ABORTED 404 (Not Found)`
2. `Error: Authorization page could not be loaded.`

## 问题原因
1. 滴答清单的API分为三类，每类使用不同的基础路径：
   - 授权API：使用 `https://dida365.com`
   - Open API：使用 `https://api.dida365.com/open/v1`
   - 数据API：使用 `https://api.dida365.com/api/v2`

2. 在迁移过程中，错误地将所有API统一使用了Open API的路径，导致：
   - 授权请求发送到了错误的地址
   - 用户配置相关的API调用失败

## 解决方案
1. 在 `dida365Service.js` 中区分三种API路径：
   ```javascript
   constructor() {
     // 数据API基础路径
     this.apiBase = 'https://api.dida365.com/api/v2';
     // 授权API基础路径
     this.authBase = 'https://dida365.com';
     // Open API基础路径
     this.openApiBase = 'https://api.dida365.com/open/v1';
   }
   ```

2. 根据API类型使用对应的基础路径：
   - 授权相关：使用 `this.authBase`
   - 任务管理：使用 `this.openApiBase`
   - 用户配置：使用 `this.apiBase`

3. 移除了可能影响授权流程的重试机制

## 预防措施
1. 在进行API迁移时，仔细阅读API文档
2. 区分不同类型的API端点
3. 为不同类型的API创建专门的配置
4. 添加API调用日志，方便调试

## 相关文件
- src/services/dida365Service.js 