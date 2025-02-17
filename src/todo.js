import { Dida365Service } from './services/dida365Service.js';

// 待办事项管理
class TodoManager {
  constructor() {
    // 等待DOM加载完成后再初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    this.didaService = new Dida365Service();
    this.initializeElements();
    this.setupEventListeners();
    
    // 快速创建任务相关元素
    this.quickAddTask = document.querySelector('.quick-add-task');
    this.quickAddInput = document.querySelector('#quick-add-input');
    this.quickAddSettings = document.querySelector('#quick-add-settings');
    this.taskSettingsPanel = document.querySelector('.task-settings-panel');
    
    // 初始化快速创建任务功能
    this.initQuickAddTask();
    this.initPriorityButtons();

    // 最后初始化待办事项区域
    requestAnimationFrame(() => {
      this.init();
    });

    // 添加项目管理相关的事件监听
    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) {
      addProjectBtn.addEventListener('click', () => this.createProject());
    }

    // 为项目列表添加右键菜单
    const projectList = document.getElementById('project-list');
    if (projectList) {
      projectList.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const projectItem = e.target.closest('.project-item');
        if (!projectItem) return;

        const projectId = projectItem.dataset.projectId;
        this.showProjectContextMenu(e, projectId);
      });
    }
  }

  initializeElements() {
    this.loginForm = document.getElementById('dida365-login');
    this.todoContent = document.querySelector('.todo-content');
    this.projectList = document.getElementById('project-list');
    this.todoList = document.getElementById('todo-list');
    this.currentProjectName = document.getElementById('current-project-name');
    this.todoEmpty = document.getElementById('todo-empty');
    
    if (!this.loginForm) {
      console.error('登录表单元素未找到');
      return;
    }
  }

  async init() {
    try {
      // 检查登录状态
      const isLoggedIn = await this.didaService.checkLoginStatus();
      
      if (isLoggedIn) {
        // 如果已登录，显示待办事项内容
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
        // 如果未登录，显示登录表单
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

  async showTodoContent() {
    if (this.loginForm) {
      this.loginForm.style.visibility = 'hidden';
      this.loginForm.style.display = 'none';
    }
    if (this.todoContent) {
      this.todoContent.style.visibility = 'visible';
      this.todoContent.style.display = 'flex';
    }
    await this.loadProjects();
  }

  showLoginForm() {
    if (!this.loginForm) return;
    
    // 显示登录表单
    this.loginForm.style.visibility = 'visible';
    this.loginForm.style.display = 'block';
    // 使用requestAnimationFrame确保display更改已生效
    requestAnimationFrame(() => {
      this.loginForm.classList.add('show');
    });

    const connectButton = document.getElementById('connect-dida365');
    if (!connectButton) {
      console.error('连接按钮未找到');
      return;
    }

    // 克隆并替换按钮以移除旧的事件监听器
    const newConnectButton = connectButton.cloneNode(true);
    connectButton.parentNode.replaceChild(newConnectButton, connectButton);

    newConnectButton.addEventListener('click', async () => {
      try {
        newConnectButton.disabled = true;
        newConnectButton.textContent = '正在连接...';
        
        await this.didaService.authorize();
        
        // 隐藏登录表单
        this.loginForm.classList.remove('show');
        setTimeout(async () => {
          this.loginForm.style.display = 'none';
          await this.showTodoContent();
        }, 300);
      } catch (error) {
        console.error('授权失败:', error);
        newConnectButton.textContent = '连接失败，请重试';
      } finally {
        newConnectButton.disabled = false;
      }
    });
  }

  async loadProjects() {
    try {
      const projects = await this.didaService.getProjects();
      await this.renderProjects(projects);
    } catch (error) {
      console.error('加载项目列表失败:', error);
      if (this.projectList) {
        this.projectList.innerHTML = '<div class="error">加载项目失败</div>';
      }
    }
  }

  async renderProjects(projects) {
    if (!this.projectList) return;
    
    this.projectList.innerHTML = '';
    
    projects.forEach(project => {
      const projectElement = document.createElement('div');
      projectElement.className = 'project-item';
      projectElement.dataset.projectId = project.id;
      
      // 创建项目图标
      const iconHtml = project.kind === 'FOLDER' ? 
        '<span class="material-icons project-icon">folder</span>' :
        '<span class="material-icons project-icon">list</span>';
      
      projectElement.innerHTML = `
        ${iconHtml}
        <span class="project-name">${project.name}</span>
        <span class="project-count">0</span>
      `;
      
      // 添加点击事件，切换到该项目
      projectElement.addEventListener('click', () => {
        this.selectProject(project.id);
      });
      
      this.projectList.appendChild(projectElement);
    });

    // 更新所有项目的任务计数
    for (const project of projects) {
      try {
        const projectData = await this.didaService.getProjectData(project.id);
        const activeTasks = (projectData.tasks || []).filter(task => task.status !== 2);
        this.updateTaskCount(project.id, activeTasks.length);
      } catch (error) {
        console.error(`获取项目 ${project.id} 的任务数量失败:`, error);
      }
    }

    // 如果有项目，默认选中第一个
    if (projects.length > 0) {
      const firstProject = projects[0];
      await this.selectProject(firstProject.id);
    }
  }

  async loadProjectTasks(projectId) {
    try {
      const projectData = await this.didaService.getProjectData(projectId);
      const tasks = projectData.tasks || [];
      
      // 分离进行中和已完成的任务
      const activeTasks = tasks.filter(task => task.status !== 2);
      const completedTasks = tasks.filter(task => task.status === 2);
      
      // 更新项目列表中的任务计数
      this.updateTaskCount(projectId, activeTasks.length);
      
      // 更新当前项目标题中的任务计数
      if (this.currentProjectName) {
        const taskCount = this.currentProjectName.querySelector('.task-count');
        if (taskCount) {
          taskCount.textContent = `${activeTasks.length} 个任务`;
        }
      }

      // 更新进行中和已完成任务的计数
      const activeCount = document.querySelector('.active-count');
      const completedCount = document.querySelector('.completed-count');
      
      if (activeCount) {
        activeCount.textContent = activeTasks.length;
      }
      if (completedCount) {
        completedCount.textContent = completedTasks.length;
      }
      
      // 渲染任务列表
      this.renderTasks(activeTasks, 'todo-list');
      this.renderTasks(completedTasks, 'completed-list', true);
    } catch (error) {
      this.showErrorMessage('加载任务失败: ' + error.message);
    }
  }

  renderTasks(tasks, containerId, isCompleted = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (tasks.length === 0) {
      container.innerHTML = `<div class="no-tasks">${isCompleted ? '暂无已完成任务' : '暂无进行中任务'}</div>`;
      return;
    }

    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = `todo-item${task.status === 2 ? ' completed-task' : ''} priority-${task.priority || 0}`;
      taskElement.dataset.taskId = task.id;

      // 创建优先级指示器
      const priorityClass = task.priority === 0 ? 'low' : task.priority === 1 ? 'medium' : 'high';
      
      // 格式化日期显示
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // 判断是否是今天
        if (date.toDateString() === today.toDateString()) {
          return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
        }
        // 判断是否是明天
        if (date.toDateString() === tomorrow.toDateString()) {
          return `明天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
        }
        // 其他日期
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      // 渲染标签
      const renderTags = (tags) => {
        if (!tags || tags.length === 0) return '';
        
        let tagsHtml = '<div class="tags">';
        
        // 如果只有一个标签且长度超过限制，显示省略
        if (tags.length === 1) {
          const tag = tags[0];
          const color = getTagColor(tag);
          const displayText = tag.length > 5 ? `${tag.substring(0, 5)}...` : tag;
          tagsHtml += `<span style="background: ${color}" title="${tag}">${displayText}</span>`;
        }
        // 如果有多个标签，最多显示2个，其余显示省略数
        else if (tags.length > 2) {
          // 显示前两个标签
          tags.slice(0, 2).forEach(tag => {
            const color = getTagColor(tag);
            const displayText = tag.length > 5 ? `${tag.substring(0, 5)}...` : tag;
            tagsHtml += `<span style="background: ${color}" title="${tag}">${displayText}</span>`;
          });
          
          // 添加带悬浮提示的计数器
          const remainingTags = tags.slice(2);
          tagsHtml += `
            <span class="tags-counter">
              +${remainingTags.length}
              <div class="tags-tooltip">
                ${remainingTags.map(tag => {
                  const color = getTagColor(tag);
                  return `<span class="tag-item" style="background: ${color}">${tag}</span>`;
                }).join('')}
              </div>
            </span>
          `;
        }
        // 如果只有1-2个标签，全部显示
        else {
          tags.forEach(tag => {
            const color = getTagColor(tag);
            const displayText = tag.length > 5 ? `${tag.substring(0, 5)}...` : tag;
            tagsHtml += `<span style="background: ${color}" title="${tag}">${displayText}</span>`;
          });
        }
        
        tagsHtml += '</div>';
        return tagsHtml;
      };

      // 获取标签颜色
      const getTagColor = (tag) => {
        const colors = [
          '#4a90e2', // 蓝色
          '#67c23a', // 绿色
          '#e6a23c', // 橙色
          '#f56c6c', // 红色
          '#9c27b0'  // 紫色
        ];
        
        // 使用标签文本的哈希值来确定颜色
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
          hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
      };

      // 检查任务是否过期
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 2;

      taskElement.innerHTML = `
        <div class="priority-indicator priority-${priorityClass}"></div>
        <input type="checkbox" ${task.status === 2 ? 'checked' : ''}>
        <div class="todo-item-content">
          <div class="todo-item-title">${task.title}</div>
          <div class="todo-item-meta">
            ${task.dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">${formatDate(task.dueDate)}</span>` : ''}
            ${task.tags && task.tags.length > 0 ? renderTags(task.tags) : ''}
          </div>
        </div>
        <div class="todo-item-actions">
          <button class="icon-button edit-task" title="编辑">
            <span class="material-icons">edit</span>
          </button>
          <button class="icon-button delete-task" title="删除">
            <span class="material-icons">delete</span>
          </button>
        </div>
      `;

      // 添加任务状态切换事件
      const checkbox = taskElement.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        this.updateTaskStatus(task.id, checkbox.checked ? 2 : 0);
      });

      // 添加编辑按钮事件
      const editButton = taskElement.querySelector('.edit-task');
      editButton.addEventListener('click', (e) => {
        // 如果点击的是复选框，则不触发编辑
        if (e.target.type === 'checkbox') return;
        
        // 如果点击的是删除按钮，则不触发编辑
        if (e.target.closest('.delete-task')) return;
        
        this.editTask(taskElement, task);
      });

      // 添加删除按钮事件
      const deleteButton = taskElement.querySelector('.delete-task');
      deleteButton.addEventListener('click', () => {
        this.deleteTask(task.id, task.title);
      });

      container.appendChild(taskElement);
    });
  }

  async updateTaskStatus(taskId, status) {
    try {
      const checkbox = document.querySelector(`[data-task-id="${taskId}"] input[type="checkbox"]`);
      const originalStatus = checkbox.checked;
      
      // 获取当前任务所属的项目ID
      const projects = await this.didaService.getProjects();
      let projectId = null;
      let taskData = null;
      
      // 遍历项目查找任务
      for (const project of projects) {
        const projectData = await this.didaService.getProjectData(project.id);
        const task = projectData.tasks.find(t => t.id === taskId);
        if (task) {
          projectId = project.id;
          taskData = { ...task }; // 创建任务数据的副本
          break;
        }
      }

      if (!projectId || !taskData) {
        throw new Error('找不到任务所属的项目');
      }
      
      // 立即更新UI状态，提供即时反馈
      if (checkbox) {
        checkbox.checked = status === 2;
      }

      try {
        // 如果任务已完成，则将状态改为进行中
        if (taskData.status === 2 && !checkbox.checked) {
          // 更新任务状态为进行中
          const updatedTask = {
            id: taskData.id,
            projectId: taskData.projectId,
            title: taskData.title,
            content: taskData.content || '',
            desc: taskData.desc || '',
            priority: taskData.priority || 0,
            status: 0, // 明确设置状态为进行中
            dueDate: taskData.dueDate || null,
            isAllDay: taskData.isAllDay || false,
            reminders: taskData.reminders || [],
            repeatFlag: taskData.repeatFlag || null,
            exDate: taskData.exDate || [],
            completedTime: null,
            tags: taskData.tags || []
          };
          await this.didaService.updateTask(updatedTask);
        } else {
          // 更新任务状态为已完成
          await this.didaService.updateTaskStatus(projectId, taskId, status);
        }
        
        // 更新成功后刷新任务列表
        const currentProjectId = document.querySelector('.project-item.active')?.dataset.projectId;
        if (currentProjectId) {
          await this.loadProjectTasks(currentProjectId);
        }
      } catch (error) {
        console.error('更新任务状态失败:', error);
        
        // 发生错误时恢复原始状态
        if (checkbox) {
          checkbox.checked = originalStatus;
        }
        
        // 显示错误提示
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
          const errorToast = document.createElement('div');
          errorToast.className = 'error-toast';
          errorToast.textContent = error.message || '更新失败，请重试';
          taskElement.appendChild(errorToast);
          setTimeout(() => errorToast.remove(), 3000);
        }
      }
    } catch (error) {
      console.error('处理任务状态更新失败:', error);
    }
  }

  // 添加任务编辑相关方法
  async editTask(taskElement, task) {
    // 创建编辑表单
    const editForm = document.createElement('div');
    editForm.className = 'task-edit-form';
    
    editForm.innerHTML = `
      <div class="edit-main">
        <input type="text" class="task-title-input" value="${task.title}" placeholder="任务标题">
        <textarea class="task-content-input" placeholder="添加备注...">${task.content || ''}</textarea>
      </div>
      <div class="edit-settings">
        <div class="setting-group">
          <label>优先级</label>
          <div class="priority-buttons">
            <button type="button" class="priority-button ${task.priority === 0 ? 'selected' : ''}" data-priority="0">
              <span class="material-icons">radio_button_${task.priority === 0 ? 'checked' : 'unchecked'}</span>
              普通
            </button>
            <button type="button" class="priority-button ${task.priority === 1 ? 'selected' : ''}" data-priority="1">
              <span class="material-icons">radio_button_${task.priority === 1 ? 'checked' : 'unchecked'}</span>
              低
            </button>
            <button type="button" class="priority-button ${task.priority === 3 ? 'selected' : ''}" data-priority="3">
              <span class="material-icons">radio_button_${task.priority === 3 ? 'checked' : 'unchecked'}</span>
              中
            </button>
            <button type="button" class="priority-button ${task.priority === 5 ? 'selected' : ''}" data-priority="5">
              <span class="material-icons">radio_button_${task.priority === 5 ? 'checked' : 'unchecked'}</span>
              高
            </button>
          </div>
        </div>
        <div class="setting-group">
          <label>截止日期</label>
          <input type="datetime-local" class="due-date-input" value="${task.dueDate ? task.dueDate.slice(0, 16) : ''}">
        </div>
        <div class="setting-group">
          <label>标签</label>
          <input type="text" class="tags-input" value="${(task.tags || []).join(', ')}" placeholder="用英文逗号分隔多个标签">
        </div>
      </div>
      <div class="edit-actions">
        <button class="save-button">保存</button>
        <button class="cancel-button">取消</button>
      </div>
    `;

    // 替换原任务元素为编辑表单
    taskElement.style.display = 'none';
    taskElement.parentNode.insertBefore(editForm, taskElement);

    // 添加点击空白处关闭编辑框的处理
    const handleClickOutside = (e) => {
      // 如果点击的不是编辑表单内的元素，则关闭编辑框
      if (!editForm.contains(e.target)) {
        // 移除事件监听器
        document.removeEventListener('mousedown', handleClickOutside);
        // 恢复原任务显示
        taskElement.style.display = '';
        // 移除编辑表单
        editForm.remove();
      }
    };

    // 延迟添加事件监听器，避免立即触发
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    // 阻止编辑表单内的点击事件冒泡
    editForm.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });

    // 设置优先级按钮事件
    const priorityButtons = editForm.querySelectorAll('.priority-button');
    priorityButtons.forEach(button => {
      button.addEventListener('click', () => {
        priorityButtons.forEach(btn => {
          btn.classList.remove('selected');
          btn.querySelector('.material-icons').textContent = 'radio_button_unchecked';
        });
        button.classList.add('selected');
        button.querySelector('.material-icons').textContent = 'radio_button_checked';
      });
    });

    // 保存按钮事件
    editForm.querySelector('.save-button').addEventListener('click', async () => {
      // 移除点击空白处关闭的事件监听器
      document.removeEventListener('mousedown', handleClickOutside);

      const updatedTask = {
        ...task,
        title: editForm.querySelector('.task-title-input').value.trim(),
        content: editForm.querySelector('.task-content-input').value.trim(),
        priority: parseInt(editForm.querySelector('.priority-button.selected').dataset.priority),
        dueDate: editForm.querySelector('.due-date-input').value,
        tags: editForm.querySelector('.tags-input').value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag)
      };

      try {
        await this.didaService.updateTask(updatedTask);
        await this.loadProjectTasks(task.projectId);
        this.showSuccessMessage('任务更新成功');
      } catch (error) {
        this.showErrorMessage('更新任务失败: ' + error.message);
      } finally {
        editForm.remove();
        taskElement.style.display = '';
      }
    });

    // 取消按钮事件
    editForm.querySelector('.cancel-button').addEventListener('click', () => {
      // 移除点击空白处关闭的事件监听器
      document.removeEventListener('mousedown', handleClickOutside);
      editForm.remove();
      taskElement.style.display = '';
    });

    // 自动聚焦标题输入框
    editForm.querySelector('.task-title-input').focus();
  }

  // 删除任务
  async deleteTask(taskId, taskTitle) {
    try {
      // 获取当前任务所属的项目ID
      const projects = await this.didaService.getProjects();
      let projectId = null;
      
      // 遍历项目查找任务
      for (const project of projects) {
        const projectData = await this.didaService.getProjectData(project.id);
        if (projectData.tasks.find(t => t.id === taskId)) {
          projectId = project.id;
          break;
        }
      }

      if (!projectId) {
        throw new Error('找不到任务所属的项目');
      }

      // 显示确认对话框
      if (!confirm(`确定要删除任务 "${taskTitle}" 吗？`)) {
        return;
      }

      // 调用API删除任务
      const success = await this.didaService.deleteTask(projectId, taskId);
      
      if (success) {
        // 从UI中移除任务元素
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
          taskElement.remove();
        }

        // 刷新任务列表以更新统计信息
        await this.refreshTaskList();

        // 显示成功消息
        this.showSuccessMessage('任务删除成功');
      }
    } catch (error) {
      console.error('删除任务时出错:', error);
      this.showErrorMessage('删除任务失败: ' + error.message);
    }
  }

  // 刷新任务列表
  async refreshTaskList() {
    const currentProjectId = document.querySelector('.project-item.active')?.dataset.projectId;
    if (currentProjectId) {
      await this.loadProjectTasks(currentProjectId);
    }
  }

  // 显示成功消息
  showSuccessMessage(message) {
    const successToast = document.createElement('div');
    successToast.className = 'success-toast';
    successToast.textContent = message;
    document.body.appendChild(successToast);
    
    // 3秒后自动移除
    setTimeout(() => {
      successToast.classList.add('fade-out');
      setTimeout(() => successToast.remove(), 300);
    }, 3000);
  }

  // 显示错误消息
  showErrorMessage(message) {
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.textContent = message;
    document.body.appendChild(errorToast);
    
    // 3秒后自动移除
    setTimeout(() => {
      errorToast.classList.add('fade-out');
      setTimeout(() => errorToast.remove(), 300);
    }, 3000);
  }

  setupEventListeners() {
    // 移除添加按钮的事件监听

    // 设置标签页切换
    const tabButtons = document.querySelectorAll('.settings-tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 移除所有标签页和按钮的激活状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.settings-tab-content').forEach(content => {
          content.classList.remove('active');
        });

        // 激活当前标签页和按钮
        button.classList.add('active');
        const tabId = button.dataset.tab;
        document.getElementById(`${tabId}-settings`).classList.add('active');
      });
    });
  }

  // 初始化快速创建任务功能
  initQuickAddTask() {
    // 显示快速创建任务输入框
    this.quickAddTask.style.display = 'block';
    
    // 监听输入框回车事件
    this.quickAddInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter' && this.quickAddInput.value.trim()) {
        await this.createQuickTask();
      }
    });
    
    // 监听设置按钮点击事件
    this.quickAddSettings.addEventListener('click', () => {
      this.toggleSettingsPanel();
    });

    // 监听保存按钮点击事件
    const saveButton = document.querySelector('#save-quick-task');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        await this.createQuickTask();
      });
    }

    // 监听取消按钮点击事件
    const cancelButton = document.querySelector('#cancel-quick-task');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        // 清空所有字段
        this.quickAddInput.value = '';
        this.setPriorityButtonState(this.taskSettingsPanel, 0);
        document.querySelector('#quick-add-due-date').value = '';
        document.querySelector('#quick-add-tags').value = '';
        
        // 收起设置面板
        this.taskSettingsPanel.style.display = 'none';
        this.taskSettingsPanel.classList.remove('show');
      });
    }
  }
  
  // 切换设置面板显示状态
  toggleSettingsPanel() {
    const isHidden = this.taskSettingsPanel.style.display === 'none';
    this.taskSettingsPanel.style.display = isHidden ? 'block' : 'none';
    this.taskSettingsPanel.classList.toggle('show');
  }
  
  // 创建快速任务
  async createQuickTask() {
    try {
      const title = this.quickAddInput.value.trim();
      if (!title) return;
      
      // 获取当前选中的项目ID
      const activeProject = document.querySelector('.project-item.active');
      if (!activeProject) {
        this.showErrorMessage('请先选择一个项目');
        return;
      }
      const projectId = activeProject.dataset.projectId;
      
      // 获取设置面板中的值
      const priority = this.getSelectedPriority(this.taskSettingsPanel);
      const dueDateInput = document.querySelector('#quick-add-due-date')?.value;
      const tags = document.querySelector('#quick-add-tags')?.value || '';
      
      // 格式化日期为API要求的格式 "yyyy-MM-dd'T'HH:mm:ssZ"
      let dueDate = null;
      if (dueDateInput) {
        const date = new Date(dueDateInput);
        dueDate = date.toISOString().replace(/\.\d{3}Z$/, '+0000');
      }
      
      // 创建任务对象
      const task = {
        projectId,
        title,
        content: '',
        priority,
        status: 0,
        dueDate,
        isAllDay: true,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };
      
      // 调用API创建任务
      await this.didaService.createTask(task);
      
      // 清空输入框和设置字段
      this.quickAddInput.value = '';
      document.querySelector('#quick-add-due-date').value = '';
      document.querySelector('#quick-add-tags').value = '';
      
      // 重置优先级按钮状态
      this.setPriorityButtonState(this.taskSettingsPanel, 0);
      
      // 收起设置面板
      this.taskSettingsPanel.style.display = 'none';
      this.taskSettingsPanel.classList.remove('show');
      
      // 刷新任务列表
      await this.refreshTaskList();
      
      // 显示成功消息
      this.showSuccessMessage('任务创建成功');
      
    } catch (error) {
      console.error('创建任务失败:', error);
      this.showErrorMessage('创建任务失败: ' + error.message);
    }
  }

  // 初始化优先级按钮
  initPriorityButtons() {
    // 快速添加任务的优先级按钮
    const quickAddPriorityButtons = document.querySelectorAll('.quick-add-task .priority-button');
    quickAddPriorityButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 移除其他按钮的选中状态
        quickAddPriorityButtons.forEach(btn => btn.classList.remove('selected'));
        // 添加当前按钮的选中状态
        button.classList.add('selected');
        // 更新图标
        this.updatePriorityButtonIcon(button);
      });
    });

    // 编辑任务的优先级按钮
    const editPriorityButtons = document.querySelectorAll('.task-edit-panel .priority-button');
    editPriorityButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 移除其他按钮的选中状态
        editPriorityButtons.forEach(btn => btn.classList.remove('selected'));
        // 添加当前按钮的选中状态
        button.classList.add('selected');
        // 更新图标
        this.updatePriorityButtonIcon(button);
      });
    });
  }

  // 更新优先级按钮图标
  updatePriorityButtonIcon(button) {
    const icon = button.querySelector('.material-icons');
    // 更新所有按钮的图标为未选中状态
    const allIcons = button.parentElement.querySelectorAll('.material-icons');
    allIcons.forEach(icon => icon.textContent = 'radio_button_unchecked');
    // 更新当前按钮的图标为选中状态
    icon.textContent = 'radio_button_checked';
  }

  // 设置优先级按钮的选中状态
  setPriorityButtonState(container, priority) {
    const buttons = container.querySelectorAll('.priority-button');
    buttons.forEach(button => {
      const isSelected = button.dataset.priority === priority.toString();
      button.classList.toggle('selected', isSelected);
      const icon = button.querySelector('.material-icons');
      icon.textContent = isSelected ? 'radio_button_checked' : 'radio_button_unchecked';
    });
  }

  // 获取选中的优先级值
  getSelectedPriority(container) {
    const selectedButton = container.querySelector('.priority-button.selected');
    return selectedButton ? parseInt(selectedButton.dataset.priority) : 0;
  }

  // 创建新项目
  async createProject() {
    try {
      // 检查是否已登录
      if (!this.didaService.accessToken) {
        this.showErrorMessage('请先登录滴答清单');
        return;
      }

      const projectName = prompt('请输入项目名称:');
      if (!projectName) return;

      const projectData = {
        name: projectName,
        color: '#F18181',
        viewMode: 'list',
        kind: 'task'
      };

      const newProject = await this.didaService.createProject(projectData);
      await this.refreshProjectList();
      this.showSuccessMessage('项目创建成功');
    } catch (error) {
      this.showErrorMessage('创建项目失败: ' + error.message);
    }
  }

  // 编辑项目
  async editProject(projectId) {
    try {
      const projectItem = document.querySelector(`[data-project-id="${projectId}"]`);
      if (!projectItem) return;

      const currentName = projectItem.querySelector('.project-name').textContent;
      const newName = prompt('请输入新的项目名称:', currentName);
      
      if (!newName || newName === currentName) return;

      const projectData = {
        name: newName
      };

      await this.didaService.updateProject(projectId, projectData);
      await this.refreshProjectList(); // 刷新项目列表
      this.showSuccessMessage('项目更新成功');
    } catch (error) {
      this.showErrorMessage('更新项目失败: ' + error.message);
    }
  }

  // 删除项目
  async deleteProject(projectId) {
    try {
      const projectItem = document.querySelector(`[data-project-id="${projectId}"]`);
      if (!projectItem) return;

      const projectName = projectItem.querySelector('.project-name').textContent;
      if (!confirm(`确定要删除项目 "${projectName}" 吗？`)) return;

      await this.didaService.deleteProject(projectId);
      await this.refreshProjectList(); // 刷新项目列表
      this.showSuccessMessage('项目删除成功');
    } catch (error) {
      this.showErrorMessage('删除项目失败: ' + error.message);
    }
  }

  // 显示项目右键菜单
  showProjectContextMenu(event, projectId) {
    // 阻止事件冒泡和默认行为
    event.preventDefault();
    event.stopPropagation();

    // 先移除所有已存在的上下文菜单
    const existingMenus = document.querySelectorAll('.context-menu');
    existingMenus.forEach(menu => menu.remove());

    // 创建新的上下文菜单
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <div class="menu-item edit-project">编辑项目</div>
      <div class="menu-item delete-project">删除项目</div>
    `;

    // 定位菜单
    const rect = event.target.closest('.project-item').getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    // 确保菜单不会超出视窗
    requestAnimationFrame(() => {
      const menuRect = menu.getBoundingClientRect();
      if (menuRect.right > window.innerWidth) {
        menu.style.left = `${window.innerWidth - menuRect.width - 5}px`;
      }
      if (menuRect.bottom > window.innerHeight) {
        menu.style.top = `${window.innerHeight - menuRect.height - 5}px`;
      }
    });

    // 添加菜单项事件监听
    menu.querySelector('.edit-project').addEventListener('click', (e) => {
      e.stopPropagation();
      this.editProject(projectId);
      menu.remove();
    });

    menu.querySelector('.delete-project').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteProject(projectId);
      menu.remove();
    });

    // 点击其他地方关闭菜单
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
        document.removeEventListener('contextmenu', closeMenu);
      }
    };

    document.addEventListener('click', closeMenu);
    document.addEventListener('contextmenu', closeMenu);

    // 添加菜单到文档
    document.body.appendChild(menu);
  }

  // 刷新项目列表
  async refreshProjectList() {
    try {
      const projects = await this.didaService.getProjects();
      this.renderProjects(projects);
    } catch (error) {
      this.showErrorMessage('获取项目列表失败: ' + error.message);
    }
  }

  // 选择项目
  async selectProject(projectId) {
    // 移除其他项目的选中状态
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => item.classList.remove('active'));
    
    // 添加当前项目的选中状态
    const currentProject = document.querySelector(`[data-project-id="${projectId}"]`);
    if (currentProject) {
      currentProject.classList.add('active');
    }
    
    // 更新项目标题
    const projectTitle = currentProject?.querySelector('.project-name')?.textContent || '';
    if (this.currentProjectName) {
      this.currentProjectName.querySelector('.project-title').textContent = projectTitle;
    }
    
    // 显示快速添加任务输入框
    if (this.quickAddTask) {
      this.quickAddTask.style.display = 'block';
    }
    
    // 加载项目任务
    await this.loadProjectTasks(projectId);
  }

  // 更新任务计数
  updateTaskCount(projectId, count) {
    const projectItem = document.querySelector(`[data-project-id="${projectId}"]`);
    if (projectItem) {
      const countElement = projectItem.querySelector('.project-count');
      if (countElement) {
        countElement.textContent = count;
      }
    }
    
    // 更新当前项目标题中的任务计数
    if (this.currentProjectName) {
      const taskCount = this.currentProjectName.querySelector('.task-count');
      if (taskCount) {
        taskCount.textContent = `${count} 个任务`;
      }
    }
  }

  showAboutPage() {
    const aboutPage = document.querySelector('.about-page');
    if (aboutPage) {
      aboutPage.style.display = 'flex';
      // 使用 requestAnimationFrame 确保过渡动画生效
      requestAnimationFrame(() => {
        aboutPage.classList.add('show');
      });

      // 点击空白处关闭
      aboutPage.addEventListener('click', (e) => {
        if (e.target === aboutPage) {
          this.hideAboutPage();
        }
      });

      // ESC 键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideAboutPage();
        }
      });
    }
  }

  hideAboutPage() {
    const aboutPage = document.querySelector('.about-page');
    if (aboutPage) {
      aboutPage.classList.remove('show');
      setTimeout(() => {
        aboutPage.style.display = 'none';
      }, 300);
    }
  }
}

// 初始化TodoManager
document.addEventListener('DOMContentLoaded', () => {
  new TodoManager();
}); 