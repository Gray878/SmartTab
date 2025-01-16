# 验证滴答清单授权URL和重定向URL

## 验证授权URL

### 1. 直接访问测试
1. 打开浏览器隐私窗口
2. 访问授权URL：
```
https://dida365.com/oauth/authorize?
client_id=v06ClDCHAU96m7QJqc&
response_type=code&
scope=tasks:read tasks:write
```
预期结果：
- 应该看到滴答清单的授权页面
- 如果显示404或其他错误，说明URL有问题

### 2. 使用Fetch API测试
```javascript
// 添加到dida365Service.js
async function testAuthEndpoint() {
  try {
    // 测试OPTIONS请求
    const optionsResponse = await fetch('https://dida365.com/oauth/authorize', {
      method: 'OPTIONS'
    });
    console.log('OPTIONS响应:', optionsResponse.status);
    
    // 测试GET请求
    const getResponse = await fetch('https://dida365.com/oauth/authorize');
    console.log('GET响应:', getResponse.status);
    
    return optionsResponse.ok || getResponse.ok;
  } catch (error) {
    console.error('测试授权端点失败:', error);
    return false;
  }
}
```

### 3. 检查网络请求
1. 打开Chrome开发者工具
2. 切换到Network标签
3. 尝试授权流程
4. 观察对应的网络请求：
   - 状态码
   - 响应头
   - CORS配置

## 验证重定向URL

### 1. 获取当前重定向URL
```javascript
// 添加到dida365Service.js
function getRedirectUrls() {
  // 获取所有可能的重定向URL
  const urls = [
    `https://${chrome.runtime.id}.chromiumapp.org/`,
    chrome.identity.getRedirectURL(),
    chrome.identity.getRedirectURL('oauth2')
  ];
  
  console.log('可能的重定向URLs:', urls);
  return urls;
}
```

### 2. 检查开发者平台配置
1. 登录滴答清单开发者平台
2. 找到OAuth应用配置
3. 确认以下URL是否已注册：
   - `https://*.chromiumapp.org/*`
   - `https://[你的扩展ID].chromiumapp.org/*`

### 3. 测试重定向URL格式
```javascript
// 添加到dida365Service.js
function validateRedirectUrl(url) {
  try {
    const redirectUrl = new URL(url);
    const valid = 
      redirectUrl.protocol === 'https:' &&
      redirectUrl.hostname.endsWith('.chromiumapp.org') &&
      redirectUrl.pathname === '/';
      
    console.log('重定向URL验证:', {
      url,
      valid,
      protocol: redirectUrl.protocol,
      hostname: redirectUrl.hostname,
      pathname: redirectUrl.pathname
    });
    
    return valid;
  } catch (error) {
    console.error('重定向URL无效:', error);
    return false;
  }
}
```

## 完整的验证流程

### 1. 添加验证函数
```javascript
class Dida365Service {
  async validateUrls() {
    // 验证授权URL
    console.log('开始验证授权URL...');
    const authEndpointValid = await testAuthEndpoint();
    console.log('授权URL验证结果:', authEndpointValid);

    // 获取并验证重定向URL
    console.log('开始验证重定向URL...');
    const redirectUrls = getRedirectUrls();
    const validRedirectUrls = redirectUrls.filter(validateRedirectUrl);
    console.log('有效的重定向URL:', validRedirectUrls);

    return {
      authEndpointValid,
      validRedirectUrls,
      allValid: authEndpointValid && validRedirectUrls.length > 0
    };
  }
}
```

### 2. 在授权前进行验证
```javascript
async authorize() {
  try {
    // 首先验证URLs
    const validation = await this.validateUrls();
    if (!validation.allValid) {
      throw new Error('URL验证失败，请检查配置');
    }
    
    // 继续授权流程...
  } catch (error) {
    console.error('授权验证失败:', error);
    throw error;
  }
}
```

## 常见问题解决

### 1. 授权URL不可访问
- 检查网络连接
- 验证client_id是否正确
- 确认API端点是否更改

### 2. 重定向URL未注册
- 在开发者平台添加通配符URL
- 添加具体的扩展ID URL
- 检查URL格式是否正确

### 3. CORS错误
- 确认manifest.json中的权限配置
- 检查CSP设置
- 验证请求头设置

## 调试建议
1. 使用Chrome开发者工具监控网络请求
2. 检查控制台错误信息
3. 验证所有URL的格式
4. 确保所有必要的权限都已配置

## 后续优化
1. 添加自动URL验证机制
2. 实现URL健康检查
3. 添加用户友好的错误提示
4. 实现备用授权方案 