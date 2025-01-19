# 右键空白区域弹出设置菜单功能

## 问题描述
需要将原有的点击设置按钮弹出设置框的方式改为右键点击空白区域弹出设置菜单。

## 实现方案
1. 移除原有的设置按钮
2. 添加空白区域右键菜单功能
3. 在右键菜单中添加设置选项

### 具体修改
1. 样式修改：
```css
/* 添加空白区域右键菜单样式 */
.blank-context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 200px;
  display: none;
}

.blank-context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #333;
  font-size: 14px;
}
```

2. JavaScript功能实现：
```javascript
function setupContextMenus() {
  // 创建空白区域右键菜单
  function createBlankContextMenu() {
    const menu = document.createElement('div');
    menu.className = 'blank-context-menu';
    // 添加设置菜单项...
  }

  // 监听右键点击事件
  document.addEventListener('contextmenu', function(event) {
    // 处理右键菜单显示逻辑...
  });

  // 点击其他区域关闭菜单
  document.addEventListener('click', function() {
    blankContextMenu.style.display = 'none';
  });
}
```

## 改进效果
1. 界面更加简洁：
   - 移除了顶部的设置按钮
   - 减少了视觉元素的干扰

2. 操作更加便捷：
   - 在任意空白处右键即可打开设置
   - 符合用户的使用习惯
   - 与系统右键菜单的交互方式一致

3. 功能完整性：
   - 保留了所有原有的设置功能
   - 添加了更现代的交互方式
   - 提供了更好的用户体验

## 注意事项
1. 确保右键菜单不会超出视窗范围
2. 避免与书签卡片的右键菜单冲突
3. 保持设置面板的功能完整性
4. 提供清晰的视觉反馈 