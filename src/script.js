// 搜索相关功能
function getLocalizedMessage(messageName) {
  const message = chrome.i18n.getMessage(messageName);
  return message || messageName;
}

function applyBackgroundColor() {
  const savedBg = localStorage.getItem('selectedBackground');
  if (savedBg) {
    document.documentElement.className = savedBg;
    const activeOption = document.querySelector(`[data-bg="${savedBg}"]`);
    if (activeOption) {
      activeOption.classList.add('active');
    }
  } else {
    document.documentElement.className = 'gradient-background-7';
    const defaultOption = document.querySelector('[data-bg="gradient-background-7"]');
    if (defaultOption) {
      defaultOption.classList.add('active');
    }
  }
}

// 立即调用这个函数
applyBackgroundColor();

function updateSearchEngineIcon(engineName) {
  const searchEngineIcon = document.getElementById('search-engine-icon');
  if (searchEngineIcon) {
    const iconPath = getSearchEngineIconPath(engineName);
    if (searchEngineIcon.src !== iconPath) {
      const img = new Image();
      img.onload = function () {
        searchEngineIcon.src = iconPath;
        searchEngineIcon.alt = `${engineName} Search`;
      };
      img.onerror = function () {
      };
      img.src = iconPath;
    }
  }
}

function getSearchEngineIconPath(engineName) {
  const iconPaths = {
    baidu: '../images/baidu-logo.svg',
    google: '../images/google-logo.svg',
    bing: '../images/bing-logo.png',
    doubao: '../images/doubao-logo.png',
    kimi: '../images/kimi-logo.svg',
    metaso: '../images/metaso-logo.png',
    deepseek: '../images/deepseek-logo.svg'
  };
  return iconPaths[engineName.toLowerCase()] || '../images/baidu-logo.svg'; // 默认使用百度图标
}

// 搜索引擎相关功能
document.addEventListener('DOMContentLoaded', function() {
  const searchEngineIcon = document.getElementById('search-engine-icon');
  const defaultSearchEngine = localStorage.getItem('selectedSearchEngine') || 'baidu';
  const searchInput = document.querySelector('.search-input');
  const searchForm = document.getElementById('search-form');
  const tabsContainer = document.getElementById('tabs-container');
  const tabs = document.querySelectorAll('.tab');

  // 设置初始搜索引擎图标
  setSearchEngineIcon(defaultSearchEngine);

  function setSearchEngineIcon(engineName) {
    const iconPath = getSearchEngineIconPath(engineName);
    searchEngineIcon.src = iconPath;
    searchEngineIcon.alt = `${engineName} Search`;
  }

  // 标签点击事件处理
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const selectedEngine = this.getAttribute('data-engine');
      localStorage.setItem('selectedSearchEngine', selectedEngine);
      
      // 更新图标
      setSearchEngineIcon(selectedEngine);
      
      // 更新标签激活状态
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // 初始化默认标签的激活状态
  const defaultTab = document.querySelector(`[data-engine="${defaultSearchEngine}"]`);
  if (defaultTab) {
    tabs.forEach(t => t.classList.remove('active'));
    defaultTab.classList.add('active');
  }

  // 快捷键设置相关
  const defaultShortcuts = {
    'baidu': 'Alt+1',
    'google': 'Alt+2',
    'bing': 'Alt+3',
    'doubao': 'Alt+4',
    'kimi': 'Alt+5',
    'metaso': 'Alt+6',
    'deepseek': 'Alt+7'
  };

  // 从存储中加载快捷键设置
  function loadShortcuts() {
    const savedShortcuts = JSON.parse(localStorage.getItem('searchEngineShortcuts') || '{}');
    return { ...defaultShortcuts, ...savedShortcuts };
  }

  // 保存快捷键设置
  function saveShortcuts(shortcuts) {
    localStorage.setItem('searchEngineShortcuts', JSON.stringify(shortcuts));
  }

  // 初始化快捷键输入框
  function initShortcutInputs() {
    const shortcuts = loadShortcuts();
    const inputs = document.querySelectorAll('.shortcut-input');
    
    inputs.forEach(input => {
      const engine = input.dataset.engine;
      input.value = shortcuts[engine] || '';

      // 设置快捷键
      input.addEventListener('click', function() {
        if (!input.classList.contains('recording')) {
          input.value = '请按下新快捷键...';
          input.classList.add('recording');
        }
      });

      input.addEventListener('keydown', function(e) {
        e.preventDefault();
        if (input.classList.contains('recording')) {
          if (e.altKey) {
            // 获取实际按下的键
            let key = e.key.toUpperCase();
            
            // 如果按下的是 Alt 键本身，不做处理
            if (key === 'ALT') {
              return;
            }
            
            // 处理特殊键名
            const keyMap = {
              'DIGIT1': '1',
              'DIGIT2': '2',
              'DIGIT3': '3',
              'DIGIT4': '4',
              'DIGIT5': '5',
              'DIGIT6': '6',
              'DIGIT7': '7',
              'DIGIT8': '8',
              'DIGIT9': '9',
              'DIGIT0': '0'
            };
            
            // 如果是数字键，使用映射后的值
            if (e.code in keyMap) {
              key = keyMap[e.code];
            }
            
            // 验证按键是否为数字或字母
            if (/^[0-9A-Z]$/.test(key)) {
              const shortcut = `Alt+${key}`;
              const shortcuts = loadShortcuts();
              
              // 检查快捷键是否已被使用
              const conflictEngine = Object.entries(shortcuts).find(([eng, sc]) => 
                sc === shortcut && eng !== engine
              );

              if (conflictEngine) {
                showToast(`快捷键 ${shortcut} 已被 ${conflictEngine[0]} 使用`);
              } else {
                shortcuts[engine] = shortcut;
                saveShortcuts(shortcuts);
                input.value = shortcut;
                showToast(`已设置 ${engine} 的快捷键为 ${shortcut}`);
              }
            } else {
              showToast('请使用数字键或字母键');
            }
          } else {
            showToast('快捷键必须包含 Alt 键');
          }
          input.classList.remove('recording');
        }
      });

      // 当输入框失去焦点时，恢复显示原有快捷键
      input.addEventListener('blur', function() {
        if (input.classList.contains('recording')) {
          const shortcuts = loadShortcuts();
          input.value = shortcuts[engine] || '';
          input.classList.remove('recording');
        }
      });
    });

    // 重置快捷键
    const resetButtons = document.querySelectorAll('.reset-shortcut');
    resetButtons.forEach(button => {
      button.addEventListener('click', function() {
        const engine = button.dataset.engine;
        const shortcuts = loadShortcuts();
        shortcuts[engine] = defaultShortcuts[engine];
        saveShortcuts(shortcuts);
        const input = document.querySelector(`.shortcut-input[data-engine="${engine}"]`);
        input.value = defaultShortcuts[engine];
        showToast(`已重置 ${engine} 的快捷键`);
      });
    });
  }

  // 修改快捷键切换搜索引擎的处理
  window.addEventListener('keydown', function(e) {
    if (e.altKey) {
      const shortcuts = loadShortcuts();
      const pressedShortcut = `Alt+${e.key.toUpperCase()}`;
      const engineEntry = Object.entries(shortcuts).find(([, shortcut]) => shortcut === pressedShortcut);
      
      if (engineEntry) {
        e.preventDefault();
        const [engine] = engineEntry;
        const engineTab = document.querySelector(`[data-engine="${engine}"]`);
        if (engineTab) {
          const selectedEngine = engine;
          localStorage.setItem('selectedSearchEngine', selectedEngine);
          setSearchEngineIcon(selectedEngine);
          tabs.forEach(t => t.classList.remove('active'));
          engineTab.classList.add('active');
        }
      }
    }
  });

  // 设置标签切换
  const tabButtons = document.querySelectorAll('.settings-tab-button');
  const tabContents = document.querySelectorAll('.settings-tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      
      // 更新按钮状态
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // 更新内容显示
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tab}-settings`) {
          content.classList.add('active');
        }
      });
    });
  });

  // 初始化快捷键设置
  initShortcutInputs();

  // 搜索相关事件处理
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = this.value.trim();
      if (query) {
        performSearch(query);
      }
    }
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
    }
  });

  function performSearch(query) {
    if (!query) return;
    
    const selectedEngine = localStorage.getItem('selectedSearchEngine') || 'baidu';
    const url = getSearchUrl(selectedEngine, query);
    window.open(url, '_blank');
  }

  function getSearchUrl(engine, query) {
    switch (engine.toLowerCase()) {
      case 'kimi':
        return `https://kimi.moonshot.cn/?q=${encodeURIComponent(query)}`;
      case 'doubao':
      case '豆包':
        return `https://www.doubao.com/chat/?q=${encodeURIComponent(query)}`;
      case 'deepseek':
        return `https://chat.deepseek.com/?q=${encodeURIComponent(query)}`;
      case 'metaso':
      case '秘塔':
        return `https://metaso.cn/?q=${query}`;
      case 'google':
      case '谷歌':
        return `https://www.google.com/search?q=${query}`;
      case 'bing':
      case '必应':
        return `https://www.bing.com/search?q=${query}`;
      case 'baidu':
      case '百度':
        return `https://www.baidu.com/s?wd=${query}`;
      default:
        return `https://www.baidu.com/s?wd=${query}`; // 默认使用百度搜索
    }
  }

  // 设置相关功能
  const settingsModal = document.getElementById('settings-modal');
  const closeButton = document.querySelector('.settings-modal-close');
  const bgOptions = document.querySelectorAll('.settings-bg-option');

  // 关闭设置模态框
  closeButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  // 点击模态框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });

  // 背景颜色选择
  bgOptions.forEach(option => {
    option.addEventListener('click', function() {
      const bgClass = this.getAttribute('data-bg');
      document.documentElement.className = bgClass;
      bgOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
      localStorage.setItem('selectedBackground', bgClass);
    });
  });
});

// 打开设置模态框
function openSettingsModal() {
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.style.display = 'block';
    settingsModal.offsetHeight; // 强制重排
  }
}

// 添加全局右键菜单事件
document.addEventListener('contextmenu', function(event) {
  const targetSettingsModal = event.target.closest('.settings-modal-content');
  if (targetSettingsModal) return;

  event.preventDefault();
  const contextMenu = document.createElement('div');
  contextMenu.className = 'custom-context-menu';

  const settingsMenuItem = document.createElement('div');
  settingsMenuItem.className = 'custom-context-menu-item';
  
  const settingsIcon = document.createElement('span');
  settingsIcon.className = 'material-icons';
  settingsIcon.textContent = 'settings';
  settingsIcon.style.marginRight = '8px';
  settingsIcon.style.fontSize = '18px';
  
  const settingsText = document.createElement('span');
  settingsText.textContent = '设置';

  settingsMenuItem.appendChild(settingsIcon);
  settingsMenuItem.appendChild(settingsText);

  settingsMenuItem.addEventListener('click', function() {
    openSettingsModal();
    contextMenu.style.display = 'none';
  });

  contextMenu.appendChild(settingsMenuItem);
  contextMenu.style.display = 'block';
  contextMenu.style.left = `${event.clientX}px`;
  contextMenu.style.top = `${event.clientY}px`;

  document.body.appendChild(contextMenu);

  // 点击其他区域关闭菜单
  document.addEventListener('click', function removeMenu() {
    contextMenu.remove();
    document.removeEventListener('click', removeMenu);
  });
});

// 显示提示信息
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }, 3000);
}

// 任务排序函数
function compareTasks(a, b) {
  // 首先按优先级排序（优先级数字越大越靠前）
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }
  
  // 如果优先级相同，则按截止时间排序
  const aDate = a.dueDate ? new Date(a.dueDate) : null;
  const bDate = b.dueDate ? new Date(b.dueDate) : null;
  
  // 有截止时间的排在前面
  if (aDate && !bDate) return -1;
  if (!aDate && bDate) return 1;
  if (!aDate && !bDate) return 0;
  
  // 都有截止时间则按时间先后排序
  return aDate.getTime() - bDate.getTime();
}

// 更新任务列表显示
function updateTodoList(tasks) {
  const todoList = document.getElementById('todo-list');
  const activeTasks = tasks.filter(task => !task.completed);
  
  // 对活动任务进行排序
  activeTasks.sort(compareTasks);
  
  // 清空并重新渲染列表
  todoList.innerHTML = '';
  
  activeTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    todoList.appendChild(taskElement);
  });
  
  // 更新任务计数
  updateTaskCount(tasks);
  
  // 如果没有任务，显示空状态
  const todoEmpty = document.getElementById('todo-empty');
  if (todoEmpty) {
    todoEmpty.style.display = activeTasks.length === 0 ? 'block' : 'none';
  }
}

// 每次任务状态改变时都需要重新排序
function onTaskStatusChange(taskId, completed) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = completed;
    saveTasks(tasks);
    updateTodoList(tasks);
    updateCompletedList(tasks);
  }
}

// 当任务优先级或截止时间更改时重新排序
function onTaskUpdate(taskId, updates) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    Object.assign(task, updates);
    saveTasks(tasks);
    updateTodoList(tasks);
  }
}

// 壁纸相关功能
document.addEventListener('DOMContentLoaded', function() {
  const selectWallpaperBtn = document.getElementById('select-wallpaper');
  const removeWallpaperBtn = document.getElementById('remove-wallpaper');
  const wallpaperUpload = document.getElementById('wallpaper-upload');
  
  // 从 localStorage 恢复壁纸设置
  const savedWallpaper = localStorage.getItem('customWallpaper');
  if (savedWallpaper) {
    applyCustomWallpaper(savedWallpaper);
    removeWallpaperBtn.style.display = 'block';
  }
  
  // 选择壁纸按钮点击事件
  selectWallpaperBtn.addEventListener('click', () => {
    wallpaperUpload.click();
  });
  
  // 文件选择处理
  wallpaperUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const imageData = event.target.result;
        // 检查文件大小
        if (imageData.length > 5 * 1024 * 1024) { // 5MB 限制
          showToast('图片大小不能超过 5MB');
          return;
        }
        
        // 检查图片尺寸
        const img = new Image();
        img.onload = function() {
          if (this.width < 1920 || this.height < 1080) {
            showToast('建议使用 1920×1080 或更高分辨率的图片');
          }
          applyCustomWallpaper(imageData);
          localStorage.setItem('customWallpaper', imageData);
          removeWallpaperBtn.style.display = 'block';
        };
        img.src = imageData;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // 移除壁纸按钮点击事件
  removeWallpaperBtn.addEventListener('click', () => {
    localStorage.removeItem('customWallpaper');
    removeCustomWallpaper();
    removeWallpaperBtn.style.display = 'none';
    // 恢复默认背景
    applyBackgroundColor();
  });
});

// 应用自定义壁纸
function applyCustomWallpaper(imageData) {
  removeCustomWallpaper(); // 移除现有壁纸
  
  const wallpaper = document.createElement('img');
  wallpaper.className = 'custom-wallpaper';
  wallpaper.src = imageData;
  
  const overlay = document.createElement('div');
  overlay.className = 'wallpaper-overlay';
  
  document.body.appendChild(wallpaper);
  document.body.appendChild(overlay);
  document.body.classList.add('has-custom-wallpaper');
  
  // 移除渐变背景
  document.documentElement.className = '';
}

// 移除自定义壁纸
function removeCustomWallpaper() {
  const existingWallpaper = document.querySelector('.custom-wallpaper');
  const existingOverlay = document.querySelector('.wallpaper-overlay');
  
  if (existingWallpaper) {
    existingWallpaper.remove();
  }
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  document.body.classList.remove('has-custom-wallpaper');
}