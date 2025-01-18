# 快速创建任务功能无法工作

## 问题描述
在快速创建任务输入框中输入任务标题并按回车键时，没有任何反应。

## 问题原因
1. 获取项目ID的方式错误：使用了不存在的 `this.selectedProjectId` 属性
2. 服务实例名称错误：使用了错误的 `this.dida365Service` 而不是 `this.didaService`
3. 消息提示方法错误：使用了不存在的 `showMessage` 方法

## 解决方案
1. 修改获取项目ID的方式：
   ```javascript
   const activeProject = document.querySelector('.project-item.active');
   if (!activeProject) {
     this.showErrorMessage('请先选择一个项目');
     return;
   }
   const projectId = activeProject.dataset.projectId;
   ```

2. 修正服务实例名称：
   ```javascript
   await this.didaService.createTask(task);
   ```

3. 使用正确的消息提示方法：
   ```javascript
   this.showErrorMessage('错误消息');
   this.showSuccessMessage('成功消息');
   ```

## 验证方法
1. 选择一个项目
2. 在快速创建任务输入框中输入任务标题
3. 按回车键
4. 验证任务是否成功创建并显示在任务列表中

## 预防措施
1. 在开发新功能时，确保所有使用的属性和方法都已经定义
2. 保持服务实例名称的一致性
3. 统一错误处理和消息提示方法的命名 