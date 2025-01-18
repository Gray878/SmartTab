# 浮动球功能代码清理指南

## 已完成的清理
1. 已从 background.js 中删除了 updateFloatingBallSetting 消息处理代码

## 待清理的内容

### 1. script.js 中需要删除的代码
位置1（约1461-1473行）:
```javascript
const enableFloatingBallCheckbox = document.getElementById('enable-floating-ball');
  
if (enableFloatingBallCheckbox) {
  chrome.storage.sync.get(['enableFloatingBall'], function (result) {
    enableFloatingBallCheckbox.checked = result.enableFloatingBall !== false;
  });

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

位置2（约3562-3586行）:
```javascript
function initFloatingBallSettings() {
  const enableFloatingBallCheckbox = document.getElementById('enable-floating-ball');
  if (!enableFloatingBallCheckbox) {
    console.log('浮动球设置元素未找到，可能是正常的');
    return;
  }
  
  chrome.storage.sync.get(['enableFloatingBall'], function (result) {
    if (enableFloatingBallCheckbox && document.body.contains(enableFloatingBallCheckbox)) {
      enableFloatingBallCheckbox.checked = result.enableFloatingBall !== false;
    }
  });
  
  if (document.body.contains(enableFloatingBallCheckbox)) {
    enableFloatingBallCheckbox.addEventListener('change', function() {
      const isEnabled = this.checked;
      chrome.runtime.sendMessage({
        action: 'updateFloatingBallSetting',
        enabled: isEnabled
      });
    });
  }
}
```

### 2. messages.json 中需要删除的翻译
在以下文件中删除浮动球相关的翻译项：
- _locales/zh_CN/messages.json
- _locales/zh_TW/messages.json
- _locales/zh_HK/messages.json
- _locales/en/messages.json
- _locales/ja/messages.json
- _locales/ko/messages.json
- _locales/fr/messages.json
- _locales/es/messages.json
- _locales/de/messages.json

需要删除的翻译键：
- floatingBallTab
- floatingBallSettingsTitle
- floatingBallDescription
- enableFloatingBall

### 3. 清理步骤
1. 使用文本编辑器的查找替换功能，删除 script.js 中的两处代码块
2. 从所有语言的 messages.json 文件中删除浮动球相关的翻译项
3. 检查 HTML 文件中是否还有浮动球相关的元素
4. 运行扩展，确保没有相关的控制台错误
5. 考虑添加代码清理 chrome.storage.sync 中的 enableFloatingBall 设置

### 4. 验证步骤
1. 确保删除代码后扩展仍能正常运行
2. 检查控制台中是否还有浮动球相关的错误
3. 验证设置页面是否正常显示
4. 确认所有功能都能正常工作

### 5. 注意事项
- 删除代码时要注意保持代码结构的完整性
- 确保不会影响到其他功能
- 建议在编辑器中使用版本控制，以便需要时可以恢复
- 删除代码后要进行完整的功能测试 