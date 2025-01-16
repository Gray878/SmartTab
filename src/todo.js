import { Dida365Service } from './services/dida365Service.js';

// 待办事项管理
class TodoManager {
  constructor() {
    this.didaService = new Dida365Service();
      this.initializeElements();
      this.init();
  }

  initializeElements() {
    this.loginForm = document.getElementById('dida365-login');
    this.todoContent = document.querySelector('.todo-content');
    this.projectList = document.getElementById('project-list');
    this.todoList = document.getElementById('todo-list');
    this.currentProjectName = document.getElementById('current-project-name');
    this.addTodoButton = document.getElementById('add-todo');
    this.todoEmpty = document.getElementById('todo-empty');
    
    if (!this.loginForm) {
      console.error('登录表单元素未找到');
      return;
    }
  }

  async init() {
    try {
      const isLoggedIn = await this.didaService.checkLoginStatus();
      if (isLoggedIn) {
        await this.showTodoContent();
      } else {
        this.showLoginForm();
      }
    } catch (error) {
      console.error('初始化失败:', error);
        this.showLoginForm();
    }
  }

  async showTodoContent() {
    if (this.loginForm) {
      this.loginForm.style.display = 'none';
    }
    if (this.todoContent) {
      this.todoContent.style.display = 'flex';
    }
    await this.loadProjects();
  }

  showLoginForm() {
    if (!this.loginForm) return;
    
    this.loginForm.style.display = 'block';
    if (this.todoContent) {
      this.todoContent.style.display = 'none';
    }

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
        await this.showTodoContent();
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
      await this.renderProjectList(projects);
    } catch (error) {
      console.error('加载项目列表失败:', error);
      if (this.projectList) {
        this.projectList.innerHTML = '<div class="error">加载项目失败</div>';
      }
    }
  }

  async renderProjectList(projects) {
    if (!this.projectList) return;

    // 清空现有内容
    this.projectList.innerHTML = '';

    // 按sortOrder排序
    const sortedProjects = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);

    // 渲染每个项目
    sortedProjects.forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.className = 'project-item';
      projectItem.dataset.projectId = project.id;

      // 解码项目名称中的表情符号
      const decodedName = decodeURIComponent(JSON.parse(`"${project.name}"`));

      projectItem.innerHTML = `
        <span class="material-icons">folder</span>
        <span class="project-name">${decodedName}</span>
        <span class="project-task-count"></span>
      `;

      // 添加点击事件
      projectItem.addEventListener('click', () => {
        // 移除其他项目的active类
        document.querySelectorAll('.project-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // 添加active类到当前项目
        projectItem.classList.add('active');
        
        // 更新当前项目名称
        if (this.currentProjectName) {
          this.currentProjectName.textContent = decodedName;
        }
        
        // 启用添加任务按钮
        if (this.addTodoButton) {
          this.addTodoButton.disabled = false;
        }
        
        // 隐藏空状态提示
        if (this.todoEmpty) {
          this.todoEmpty.style.display = 'none';
        }
        
        // 加载项目任务
        this.loadProjectTasks(project.id);
      });

      this.projectList.appendChild(projectItem);
    });

    // 如果有项目，默认选中第一个
    if (sortedProjects.length > 0) {
      const firstProject = this.projectList.firstElementChild;
      if (firstProject) {
        firstProject.click();
      }
    }
  }

  async loadProjectTasks(projectId) {
    if (!this.todoList) return;

    try {
      // 显示加载状态
      this.todoList.innerHTML = '<div class="loading">加载中...</div>';
      
      // 获取项目数据
      const projectData = await this.didaService.getProjectData(projectId);
      
      if (projectData && Array.isArray(projectData.tasks)) {
        // 更新任务统计
        const totalTasks = projectData.tasks.length;
        const completedTasks = projectData.tasks.filter(task => task.status === 'completed').length;
        const statsElement = document.querySelector('.todo-stats');
        if (statsElement) {
          statsElement.textContent = `(${completedTasks}/${totalTasks})`;
        }
        
        // 渲染任务列表
        this.renderTasks(projectData.tasks);
      } else {
        this.todoList.innerHTML = '<div class="no-tasks">暂无任务</div>';
      }
    } catch (error) {
      console.error('加载项目任务失败:', error);
      this.todoList.innerHTML = '<div class="error">加载失败</div>';
    }
  }

  renderTasks(tasks) {
    if (!this.todoList) return;
    this.todoList.innerHTML = '';

    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = 'todo-item';
      taskElement.dataset.taskId = task.id;

      // 创建优先级指示器
      const priorityClass = task.priority === 0 ? 'low' : task.priority === 1 ? 'medium' : 'high';
      
      taskElement.innerHTML = `
        <div class="priority-indicator priority-${priorityClass}"></div>
        <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''}>
        <div class="todo-item-content">
          <div class="todo-item-title">${task.title}</div>
          <div class="todo-item-meta">
            ${task.dueDate ? `<span class="due-date">${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
            ${task.tags && task.tags.length > 0 ? `<span class="tags">${task.tags.join(', ')}</span>` : ''}
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
        this.updateTaskStatus(task.id, checkbox.checked ? 'completed' : 'normal');
      });

      this.todoList.appendChild(taskElement);
    });
  }

  async updateTaskStatus(taskId, status) {
    try {
      const checkbox = document.querySelector(`[data-task-id="${taskId}"] input[type="checkbox"]`);
      const originalStatus = checkbox.checked;
      
      // 立即更新UI状态，提供即时反馈
      if (checkbox) {
        checkbox.checked = status === 'completed';
      }

      try {
        await this.didaService.updateTaskStatus(taskId, status);
        
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
}

// 初始化TodoManager
document.addEventListener('DOMContentLoaded', () => {
  new TodoManager();
}); 