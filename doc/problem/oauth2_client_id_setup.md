# Chrome扩展配置OAuth2客户端ID指南

## 问题描述
需要在 Chrome 开发者控制台配置 OAuth2 客户端 ID，以便滴答清单 API 认证能够正常工作。

## 解决步骤

1. 访问 Chrome 开发者控制台
   - 打开 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目

2. 启用 OAuth2 API
   - 在左侧菜单中选择 "API和服务" > "库"
   - 搜索并启用 "Chrome Identity API"
   - 搜索并启用 "OAuth2 API"

3. 配置 OAuth2 同意屏幕
   - 转到 "API和服务" > "OAuth 同意屏幕"
   - 选择用户类型（建议选择"外部"）
   - 填写应用名称、支持邮箱等必要信息
   - 添加所需的作用域（scope）：
     * `tasks:read`
     * `tasks:write`

4. 创建 OAuth2 客户端 ID
   - 转到 "API和服务" > "凭据"
   - 点击 "创建凭据" > "OAuth 客户端 ID"
   - 应用类型选择 "Chrome 应用"
   - 填写应用名称
   - 添加应用 ID（从 manifest.json 中获取）
   - 添加重定向 URI：`https://${YOUR_EXTENSION_ID}.chromiumapp.org/`

5. 更新扩展配置
   - 复制生成的客户端 ID
   - 更新 manifest.json 中的 OAuth2 配置：
   ```json
   {
     "oauth2": {
       "client_id": "YOUR_CLIENT_ID",
       "scopes": [
         "tasks:read",
         "tasks:write"
       ]
     }
   }
   ```

6. 配置重定向 URL
   - 在滴答清单开发者平台添加重定向 URL：
   `https://${YOUR_EXTENSION_ID}.chromiumapp.org/`

## 注意事项
1. 确保扩展 ID 保持一致
   - 可以在 manifest.json 中设置固定的扩展 ID
   - 或者从已安装的扩展中获取 ID

2. 权限检查
   - manifest.json 必须包含 "identity" 权限
   - 确保添加了必要的 host permissions

3. 安全考虑
   - 不要在代码中硬编码客户端密钥
   - 使用环境变量或配置文件存储敏感信息
   - 在生产环境中使用 HTTPS

4. 测试验证
   - 在开发环境中完整测试 OAuth 流程
   - 确保错误处理机制正常工作
   - 验证 token 刷新功能

## 常见问题
1. "Invalid Redirect URI" 错误
   - 检查重定向 URI 是否正确配置
   - 确保使用了正确的扩展 ID

2. "OAuth2 not authorized" 错误
   - 检查客户端 ID 是否正确
   - 验证 manifest.json 中的权限配置

3. Token 刷新失败
   - 确保正确处理 401 错误
   - 实现适当的重试机制

## 相关文档
- [Chrome Identity API 文档](https://developer.chrome.com/docs/extensions/reference/identity/)
- [OAuth2 配置指南](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)
- [滴答清单 API 文档](https://www.dida365.com/api/) 