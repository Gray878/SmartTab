# 待办事项登录窗口显示问题

## 问题描述
在未登录状态下刷新页面时，待办事项区域没有显示登录窗口。这是因为初始化逻辑中，代码先隐藏了登录表单，然后才检查登录状态，导致即使用户未登录，登录表单也被隐藏了。

## 问题影响
1. 用户无法看到登录窗口
2. 无法连接滴答清单账号
3. 影响用户体验

## 解决方案
修改了 `todo.js` 中的初始化逻辑：

1. 调整初始化顺序：
   - 先检查登录状态
   - 根据状态显示相应的界面

2. 优化界面切换逻辑：
   ```javascript
   async init() {
     try {
       const isLoggedIn = await this.didaService.checkLoginStatus();
       
       if (isLoggedIn) {
         // 已登录：显示待办事项内容
         if (this.todoContent) {
           this.todoContent.style.visibility = 'visible';
           this.todoContent.style.display = 'flex';
         }
         if (this.loginForm) {
           this.loginForm.style.visibility = 'hidden';
           this.loginForm.style.display = 'none';
         }
         await this.loadProjects();
       } else {
         // 未登录：显示登录表单
         if (this.todoContent) {
           this.todoContent.style.visibility = 'hidden';
           this.todoContent.style.display = 'none';
         }
         this.showLoginForm();
       }
     } catch (error) {
       console.error('初始化失败:', error);
       this.showLoginForm();
     }
   }
   ```

3. 确保登录表单可见性：
   ```javascript
   showLoginForm() {
     if (!this.loginForm) return;
     
     this.loginForm.style.visibility = 'visible';
     this.loginForm.style.display = 'block';
     requestAnimationFrame(() => {
       this.loginForm.classList.add('show');
     });
   }
   ```

## 验证方法
1. 清除浏览器缓存和扩展数据
2. 刷新页面
3. 确认未登录状态下可以看到登录窗口
4. 测试登录功能是否正常工作

## 预防措施
1. 在修改显示/隐藏逻辑时，确保先进行状态检查
2. 使用 visibility 和 display 属性配合，确保元素状态正确
3. 添加适当的错误处理和日志记录 