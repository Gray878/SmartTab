# 编辑任务面板优先级样式不一致问题

## 问题描述
编辑任务面板中的优先级选择器使用的是下拉框形式，而快速创建任务面板中使用的是按钮组形式，导致用户体验不一致。

## 问题原因
1. 在更新快速创建任务面板时，将优先级选择器改为了按钮组形式
2. 但编辑任务面板中的HTML结构未同步更新，仍然保留着旧的下拉框形式
3. 导致两个面板的优先级选择器样式和交互方式不一致

## 解决方案
1. 将编辑任务面板中的优先级下拉框替换为按钮组
2. 使用与快速创建任务面板相同的HTML结构和样式
3. 添加 `input-wrapper` 类来保持布局一致性
4. 使用 `setPriorityButtonState` 方法来设置初始优先级状态

## 代码修改
```html
<!-- 修改前 -->
<div class="form-group">
  <label for="edit-task-priority">优先级</label>
  <select id="edit-task-priority">
    <option value="0">普通</option>
    <option value="1">低</option>
    <option value="3">中</option>
    <option value="5">高</option>
  </select>
</div>

<!-- 修改后 -->
<div class="form-group">
  <label>优先级</label>
  <div class="input-wrapper">
    <div class="priority-buttons">
      <button class="priority-button" data-priority="0" title="普通优先级">
        <span class="material-icons">radio_button_unchecked</span>
        普通
      </button>
      <!-- ... 其他优先级按钮 ... -->
    </div>
  </div>
</div>
```

## 验证方法
1. 创建新任务并检查优先级按钮组的样式
2. 编辑已有任务并确认优先级按钮组的样式与创建任务时一致
3. 测试优先级选择功能在两个面板中的行为是否一致
4. 确认优先级状态能正确保存和显示

## 预防措施
1. 在更新UI组件时，确保所有使用该组件的地方都同步更新
2. 保持相同功能的UI组件使用统一的HTML结构和样式
3. 使用统一的方法处理组件的状态和交互
4. 在重构时全面检查所有相关的UI组件