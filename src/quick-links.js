document.addEventListener('DOMContentLoaded', function () {
  // 生成快速链接
  function generateQuickLinks() {
    chrome.history.search({
      text: '',
      maxResults: 100,
      startTime: 0
    }, function (historyItems) {
      // 获取黑名单
      chrome.storage.local.get(['blacklist'], function (result) {
        const blacklist = result.blacklist || [];
        
        // 过滤和统计访问次数
        const visitCounts = {};
        historyItems.forEach(item => {
          if (!blacklist.includes(item.url)) {
            const hostname = new URL(item.url).hostname;
            visitCounts[hostname] = (visitCounts[hostname] || 0) + 1;
          }
        });

        // 转换为数组并排序
        const sites = Object.entries(visitCounts)
          .map(([hostname, count]) => ({
            hostname,
            count,
            url: historyItems.find(item => new URL(item.url).hostname === hostname).url,
            title: historyItems.find(item => new URL(item.url).hostname === hostname).title
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, MAX_DISPLAY);

        // 清空容器
        quickLinksContainer.innerHTML = '';

        // 创建快速链接元素
        sites.forEach(site => {
          const linkContainer = document.createElement('div');
          linkContainer.className = 'quick-link-item-container';

          const link = document.createElement('a');
          link.href = site.url;
          link.className = 'quick-link-item';
          link.title = site.title;

          const favicon = document.createElement('img');
          favicon.src = faviconURL(site.url);
          favicon.className = 'favicon';
          favicon.alt = site.hostname;

          const hostname = document.createElement('span');
          hostname.textContent = site.hostname;
          hostname.className = 'hostname';

          link.appendChild(favicon);
          link.appendChild(hostname);
          linkContainer.appendChild(link);

          // 添加右键菜单事件监听器
          link.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            showContextMenu(e, site);
          });

          quickLinksContainer.appendChild(linkContainer);
        });

        // 调整容器宽度
        adjustQuickLinksContainerWidth();
      });
    });
  }

  // 显示上下文菜单
  function showContextMenu(e, site) {
    e.preventDefault();
    // 移除任何已存在的上下文菜单
    const existingMenu = document.querySelector('.custom-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const contextMenu = document.createElement('div');
    contextMenu.className = 'custom-context-menu';

    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;

    // 定义菜单项
    const menuItems = [
      { text: chrome.i18n.getMessage("openInNewTab"), icon: 'open_in_new', action: () => window.open(site.url, '_blank') },
      { text: chrome.i18n.getMessage("openInNewWindow"), icon: 'launch', action: () => window.open(site.url, '_blank', 'noopener,noreferrer') },
      { text: chrome.i18n.getMessage("openInIncognito"), icon: 'visibility_off', action: () => openInIncognito(site.url) },
      { text: chrome.i18n.getMessage("editQuickLink"), icon: 'edit', action: () => editQuickLink(site) },
      { text: chrome.i18n.getMessage("deleteQuickLink"), icon: 'delete', action: () => addToBlacklistConfirm(site) },
      { text: chrome.i18n.getMessage("copyLink"), icon: 'content_copy', action: () => copyToClipboard(site.url) }
    ];

    menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'context-menu-item';
      
      const icon = document.createElement('span');
      icon.className = 'material-icons context-menu-icon';
      icon.textContent = item.icon;
      
      const text = document.createElement('span');
      text.textContent = item.text;
      
      menuItem.appendChild(icon);
      menuItem.appendChild(text);
      
      menuItem.addEventListener('click', () => {
        item.action();
        contextMenu.remove();
      });
      
      contextMenu.appendChild(menuItem);
    });

    document.body.appendChild(contextMenu);

    // 点击其他地方时关闭菜单
    document.addEventListener('click', function closeMenu(e) {
      if (!contextMenu.contains(e.target)) {
        contextMenu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }

  // 在无痕窗口中打开链接
  function openInIncognito(url) {
    chrome.windows.create({
      url: url,
      incognito: true
    });
  }

  // 编辑快速链接
  function editQuickLink(site) {
    // 实现编辑功能
    console.log('Edit quick link:', site);
  }

  // 添加到黑名单确认
  function addToBlacklistConfirm(site) {
    const message = chrome.i18n.getMessage("confirmDeleteQuickLinkMessage", [site.hostname]);
    if (confirm(message)) {
      addToBlacklist(site.url);
    }
  }

  // 添加到黑名单
  function addToBlacklist(url) {
    chrome.storage.local.get(['blacklist'], function (result) {
      const blacklist = result.blacklist || [];
      if (!blacklist.includes(url)) {
        blacklist.push(url);
        chrome.storage.local.set({ blacklist: blacklist }, function () {
          generateQuickLinks(); // 重新生成快速链接
          showToast(chrome.i18n.getMessage("addedToBlacklist"));
        });
      }
    });
  }

  // 复制到剪贴板
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(chrome.i18n.getMessage("linkCopied"));
    });
  }

  // 初始化
  generateQuickLinks();

  // 调整容器宽度
  function adjustQuickLinksContainerWidth() {
    const container = document.querySelector('.quick-links-container');
    const items = container.querySelectorAll('.quick-link-item-container');
    const itemCount = items.length;
    const itemWidth = 80; // 每个项目的宽度（包括间距）
    const maxColumns = 10; // 最大列数
    const columns = Math.min(itemCount, maxColumns);
    
    // 计算容器宽度
    const containerWidth = columns * itemWidth;
    
    // 设置容器宽度
    container.style.width = `${containerWidth}px`;
    
    // 更新网格列数
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }

  // 监听窗口大小变化
  window.addEventListener('resize', adjustQuickLinksContainerWidth);

  // 显示提示消息
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000); // 显示3秒钟
  }
});