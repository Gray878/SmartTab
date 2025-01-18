# 浮动球功能代码清理

## 问题描述
浮动球功能已被移除，但在代码中仍存在相关的残留代码：
1. `script.js` 中存在浮动球设置相关的代码
2. 包括设置checkbox的事件监听和chrome storage操作

## 需要清理的代码
```javascript
const enableFloatingBallCheckbox = document.getElementById('enable-floating-ball');
  
// 确保元素存在
if (enableFloatingBallCheckbox) {
  // 加载设置
  chrome.storage.sync.get(['enableFloatingBall'], function (result) {
    enableFloatingBallCheckbox.checked = result.enableFloatingBall !== false;
  });

  // 保存设置
  enableFloatingBallCheckbox.addEventListener('change', function() {
    const isEnabled = this.checked;
    chrome.runtime.sendMessage({action: 'updateFloatingBallSetting', enabled: isEnabled}, function(response) {
      if (response && response.success) {
        console.log('浮动球设置更新成功');
      } else {
        console.error('浮动球设置更新失败');
      }
    });
  });
} else {
  console.log('浮动球设置元素未找到，可能是正常的');
}
```

## 清理建议
1. 删除所有与浮动球相关的代码
2. 检查 HTML 文件中是否还存在相关的元素
3. 检查 background.js 中是否有相关的消息处理代码
4. 检查 storage 中是否需要清理相关的设置数据

## 清理步骤
1. 从 script.js 中删除上述代码块
2. 检查并删除 HTML 中的 `enable-floating-ball` 元素
3. 检查并删除 background.js 中的 `updateFloatingBallSetting` 消息处理
4. 考虑添加代码清理 chrome.storage.sync 中的 `enableFloatingBall` 设置

## 注意事项
- 确保删除代码时不影响其他功能
- 保持代码结构的完整性
- 在删除存储数据时要考虑兼容性 