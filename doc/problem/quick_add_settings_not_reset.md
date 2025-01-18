# 快速创建任务后设置面板未重置

## 问题描述
在使用快速创建任务功能时，任务创建成功后设置面板没有自动收起，设置字段的值也没有重置。

## 问题原因
在任务创建成功后，代码只清空了任务标题输入框，没有处理设置面板的状态和其他设置字段的值。

## 解决方案
在任务创建成功后，添加以下操作：

1. 清空所有设置字段：
```javascript
document.querySelector('#quick-add-priority').value = '0';
document.querySelector('#quick-add-due-date').value = '';
document.querySelector('#quick-add-tags').value = '';
```

2. 收起设置面板：
```javascript
this.taskSettingsPanel.style.display = 'none';
this.taskSettingsPanel.classList.remove('show');
```

## 验证方法
1. 打开设置面板并设置一些值
2. 创建一个任务
3. 验证：
   - 设置面板是否自动收起
   - 所有设置字段是否已重置为默认值

## 预防措施
1. 在实现表单提交功能时，记得同时考虑表单重置的需求
2. 保持用户界面的清洁，避免残留上次操作的数据
3. 在完成主要功能后，检查相关UI元素是否需要重置 