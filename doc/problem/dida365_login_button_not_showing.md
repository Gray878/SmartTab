# 滴答清单登录按钮不显示问题

## 问题描述
滴答清单的登录按钮在页面上没有显示出来。

## 原因分析
1. CSS样式中缺少必要的显示/隐藏控制
2. 登录表单的基础样式不完整
3. 按钮和图标的样式缺失

## 解决方案

### 1. 添加登录表单基础样式
```css
.dida365-login {
  display: none;
  position: relative;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.dida365-login.show {
  display: block;
}
```

### 2. 添加标题和描述样式
```css
.dida365-login h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.login-desc {
  color: #64748b;
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
```

### 3. 添加按钮样式
```css
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
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.25);
}

.connect-button:hover {
  background: #357abd;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}
```

### 4. 添加图标和链接样式
```css
.dida-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.login-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

.login-links a {
  color: #4a90e2;
  text-decoration: none;
  transition: color 0.2s;
}

.login-links a:hover {
  color: #357abd;
  text-decoration: underline;
}
```

## 验证方法
1. 检查页面是否正确显示登录表单
2. 验证按钮样式是否正确
3. 确认图标是否正确加载
4. 测试悬停效果
5. 验证响应式布局

## 注意事项
1. 确保图片路径正确（`../images/dida365-logo.svg`）
2. 检查 CSS 类名是否与 HTML 结构匹配
3. 确保 JavaScript 中的 `show` 类添加/移除逻辑正确
4. 注意按钮禁用状态的样式处理

## 相关文件
- `src/styles.css`
- `src/index.html`
- `src/todo.js` 