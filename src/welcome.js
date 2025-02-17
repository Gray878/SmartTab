class WelcomeModule {
  constructor() {
    this.userName = localStorage.getItem('userName') || 'Gray';
    this.currentStyle = localStorage.getItem('welcomeStyle') || 'basic';
    this.welcomeItems = document.querySelectorAll('.welcome-item');
    
    // 立即显示当前样式的元素
    const currentItem = document.querySelector(`[data-style="${this.currentStyle}"]`);
    if (currentItem) {
      currentItem.style.display = 'block';
      
      // 如果是年度进度样式，显示季节图标
      if (this.currentStyle === 'progress') {
        const seasons = currentItem.querySelector('.seasons');
        if (seasons) {
          seasons.style.display = 'flex';
        }
      }
    }
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateWelcome();
    
    // 定时更新
    setInterval(() => this.updateWelcome(), 1000);
    
    // 初始化欢迎样式选项
    this.initWelcomeStyleOptions();
  }

  setupEventListeners() {
    document.getElementById('welcome-message').addEventListener('click', () => this.editUserName());
  }

  // 添加初始化欢迎样式选项的方法
  initWelcomeStyleOptions() {
    // 获取所有样式选项按钮
    const styleOptions = document.querySelectorAll('.welcome-style-option');
    
    // 设置当前选中的样式
    const currentOption = document.querySelector(`.welcome-style-option[data-style="${this.currentStyle}"]`);
    if (currentOption) {
      currentOption.classList.add('active');
    }
    
    // 为每个选项添加点击事件
    styleOptions.forEach(option => {
      option.addEventListener('click', () => {
        // 移除其他选项的激活状态
        styleOptions.forEach(opt => opt.classList.remove('active'));
        // 添加当前选项的激活状态
        option.classList.add('active');
        
        // 更新欢迎样式
        const style = option.dataset.style;
        this.setStyle(style);
        
        // 显示提示信息
        this.showToast(`已切换至${option.querySelector('span:last-child').textContent}`);
      });
    });
  }

  // 添加提示信息方法
  showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
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
  }

  updateWelcome() {
    // 隐藏所有欢迎项
    this.welcomeItems.forEach(item => {
      item.style.display = 'none';
      item.classList.remove('active');
      
      // 确保所有样式的季节图标都是隐藏的
      const seasons = item.querySelector('.seasons');
      if (seasons) {
        seasons.style.display = 'none';
      }
    });

    // 显示当前样式
    const currentItem = document.querySelector(`[data-style="${this.currentStyle}"]`);
    if (currentItem) {
      currentItem.style.display = 'block';
      requestAnimationFrame(() => {
        currentItem.classList.add('active');
      });

      // 如果是年度进度样式，显示季节图标
      if (this.currentStyle === 'progress') {
        const seasons = currentItem.querySelector('.seasons');
        if (seasons) {
          seasons.style.display = 'flex';
        }
      }
    }

    // 根据不同样式更新内容
    switch (this.currentStyle) {
      case 'basic':
        this.updateBasicWelcome();
        break;
      case 'clock':
        this.updateClock();
        break;
      case 'poem':
        this.updatePoem();
        break;
      case 'voyager':
        this.updateVoyager();
        break;
      case 'progress':
        this.updateYearProgress();
        break;
    }
  }

  updateBasicWelcome() {
    const now = new Date();
    const hours = now.getHours();
    
    let greeting;
    if (hours < 6) {
      greeting = '凌晨好👋';
    } else if (hours < 12) {
      greeting = '早安👋';
    } else if (hours < 14) {
      greeting = '中午好🌞';
    } else if (hours < 18) {
      greeting = '下午好🌞';
    } else if (hours < 22) {
      greeting = '晚上好🌙';
    } else {
      greeting = '夜深了🌙';
    }

    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
      welcomeElement.textContent = `${greeting}，${this.userName}`;
    }
  }

  updateClock() {
    const now = new Date();
    const clockElement = document.getElementById('clock-message');
    if (clockElement) {
      const timeElement = clockElement.querySelector('.time');
      const dateElement = clockElement.querySelector('.date');
      
      timeElement.textContent = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      dateElement.textContent = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    }
  }

  async updatePoem() {
    const poemElement = document.getElementById('poem-message');
    if (!poemElement.dataset.loaded) {
      try {
        // 使用今日诗词API
        const response = await fetch('https://v2.jinrishici.com/one.json');
        const data = await response.json();
        
        if (data.status === 'success') {
          const poem = data.data;
          
          poemElement.querySelector('.poem-content').textContent = poem.content;
          poemElement.querySelector('.poem-author').textContent = `${poem.origin.author} 《${poem.origin.title}》`;
          poemElement.querySelector('.poem-source').textContent = '来源: 今日诗词';
          
          poemElement.dataset.loaded = 'true';
          
          const today = new Date().toDateString();
          localStorage.setItem('lastPoemDate', today);
        }
      } catch (error) {
        console.error('获取诗词失败:', error);
        // 设置默认诗词
        poemElement.querySelector('.poem-content').textContent = '青海长云暗雪山，孤城遥望玉门关。';
        poemElement.querySelector('.poem-author').textContent = '王之涣《凉州词》';
        poemElement.querySelector('.poem-source').textContent = '来源: 今日诗词';
      }
    }
  }

  updateVoyager() {
    const voyagerElement = document.getElementById('voyager-message');
    if (voyagerElement) {
      const launchDate = new Date('1977-09-05');
      const now = new Date();
      const daysFromLaunch = (now - launchDate) / (1000 * 60 * 60 * 24);
      
      const distanceKm = Math.round(daysFromLaunch * 17 * 86400);
      const astronomicalUnits = (distanceKm / 149597870.7).toFixed(6);
      
      voyagerElement.querySelector('.voyager-distance').innerHTML = 
        `旅行者 1 号当前距离地球 <span>${distanceKm.toLocaleString()}</span> 千米，约为 <span>${astronomicalUnits}</span> 个天文单位`;
    }
  }

  updateYearProgress() {
    const progressElement = document.getElementById('year-progress');
    if (progressElement) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      
      const progress = (now - startOfYear) / (endOfYear - startOfYear) * 100;
      
      // 更新进度文本
      progressElement.querySelector('.progress-text').innerHTML = 
        `<span class="year">${now.getFullYear()}</span>年已经过去 <span class="percentage">${progress.toFixed(1)}%</span>`;
      
      // 更新进度条
      progressElement.querySelector('.progress-inner').style.width = `${progress}%`;
      
      // 更新季节图标
      const month = now.getMonth();
      const seasons = progressElement.querySelectorAll('.season');
      seasons.forEach(season => season.classList.remove('active'));
      
      // 根据月份激活对应的季节图标
      if (month >= 2 && month <= 4) {
        seasons[0].classList.add('active'); // 春
      } else if (month >= 5 && month <= 7) {
        seasons[1].classList.add('active'); // 夏
      } else if (month >= 8 && month <= 10) {
        seasons[2].classList.add('active'); // 秋
      } else {
        seasons[3].classList.add('active'); // 冬
      }
    }
  }

  editUserName() {
    const newUserName = prompt('我该怎么称呼你:', this.userName);
    if (newUserName && newUserName.trim() !== '') {
      this.userName = newUserName.trim();
      localStorage.setItem('userName', this.userName);
      this.updateWelcome();
    }
  }

  setStyle(style) {
    this.currentStyle = style;
    localStorage.setItem('welcomeStyle', style);
    this.updateWelcome();
  }
}

// 初始化欢迎模块
document.addEventListener('DOMContentLoaded', () => {
  window.welcomeModule = new WelcomeModule();
});
