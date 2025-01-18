# 优先级按钮组空值错误问题

## 问题描述
在创建任务时出现错误：`TypeError: Cannot set properties of null (setting 'value')`。这是因为代码尝试访问已经不存在的优先级下拉框元素。

## 问题原因
1. 界面已经从下拉框方式改为按钮组方式选择优先级
2. 但 `createQuickTask` 方法中仍在使用旧的下拉框选择器
3. 导致在清空表单时尝试设置不存在元素的值而报错

## 解决方案
1. 移除对旧优先级下拉框的引用
2. 使用 `getSelectedPriority` 方法获取按钮组中选中的优先级值
3. 使用 `setPriorityButtonState` 方法重置优先级按钮状态
4. 移除不必要的 `parseInt` 转换

## 代码修改
```javascript
// 修改前
const priority = document.querySelector('#quick-add-priority')?.value || 0;
document.querySelector('#quick-add-priority').value = '0';

// 修改后
const priority = this.getSelectedPriority(this.taskSettingsPanel);
this.setPriorityButtonState(this.taskSettingsPanel, 0);
```

## 验证方法
1. 创建新任务并选择不同优先级
2. 确认任务创建成功后优先级按钮组被正确重置
3. 检查控制台是否不再出现相关错误

## 预防措施
1. 在修改UI元素时，确保同步更新所有相关的JavaScript代码
2. 使用类型安全的方法访问DOM元素
3. 在重构时全面检查受影响的功能点
4. 添加适当的错误处理和空值检查 