# 滴答清单访问令牌交换问题

## 问题描述
用户完成授权后，获取到授权码，但在交换访问令牌时失败，导致重新弹出登录窗口。

## 错误分析
1. 授权流程正常完成，成功获取授权码
2. 交换访问令牌的请求可能存在问题：
   - 缺少必要的参数
   - 请求格式不正确
   - 端点URL可能不正确

## 解决方案

### 1. 修改令牌交换请求
```javascript
// 使用授权码交换访问令牌
const tokenResponse = await fetch('https://dida365.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'  // 修改Content-Type
  },
  body: new URLSearchParams({  // 使用表单格式
    client_id: this.clientId,
    client_secret: this.clientSecret,  // 如果需要
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: this.redirectUri
  }).toString()
});
```

### 2. 添加详细的错误处理
```javascript
if (!tokenResponse.ok) {
  const errorData = await tokenResponse.json().catch(() => null);
  throw new Error(
    `Token exchange failed: ${tokenResponse.status} - ${
      errorData ? JSON.stringify(errorData) : 'Unknown error'
    }`
  );
}
```

### 3. 完整的令牌交换流程
```javascript
async exchangeCodeForToken(code) {
  try {
    console.log('开始交换访问令牌，授权码:', code);
    
    const tokenUrl = 'https://dida365.com/oauth/token';
    const params = new URLSearchParams({
      client_id: this.clientId,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri
    });

    console.log('令牌交换请求参数:', params.toString());

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('令牌交换失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`令牌交换失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('令牌交换成功');
    return data.access_token;
  } catch (error) {
    console.error('令牌交换过程出错:', error);
    throw error;
  }
}
```

### 4. 更新授权流程
```javascript
async authorize() {
  try {
    // ... 前面的代码保持不变 ...

    const code = responseUrl.searchParams.get('code');
    if (!code) {
      throw new Error('未获取到授权码');
    }

    console.log('获取到授权码，开始交换访问令牌');
    
    // 使用单独的方法处理令牌交换
    this.token = await this.exchangeCodeForToken(code);
    
    // 保存令牌到本地存储
    await chrome.storage.local.set({ dida365_token: this.token });
    
    // 验证令牌
    await this.validateToken();
    
    return true;
  } catch (error) {
    console.error('授权失败:', error);
    throw error;
  }
}
```

## 调试步骤
1. 检查网络请求：
   - 确认令牌交换请求的格式
   - 验证所有必需参数
   - 检查响应状态和内容

2. 添加日志：
```javascript
console.log('授权码:', code);
console.log('请求参数:', params.toString());
console.log('响应状态:', response.status);
```

3. 验证令牌：
```javascript
async validateToken() {
  try {
    const response = await this.request('/user/profile');
    return true;
  } catch (error) {
    console.error('令牌验证失败:', error);
    return false;
  }
}
```

## 注意事项
1. Content-Type必须正确
2. 参数格式必须符合要求
3. 所有必需参数都要包含
4. 正确处理错误响应

## 相关文档
- [OAuth 2.0 令牌交换](https://tools.ietf.org/html/rfc6749#section-4.1.3)
- [HTTP状态码](https://developer.mozilla.org/docs/Web/HTTP/Status)
- [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API) 