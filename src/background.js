// 当扩展安装或更新时触发
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: "chrome://newtab" });

    // 初始化 defaultBookmarkId
    chrome.storage.local.set({ defaultBookmarkId: null }, function () {
      if (chrome.runtime.lastError) {
        console.error('Error initializing defaultBookmarkId:', chrome.runtime.lastError);
      } else {
        console.log('Initialized defaultBookmarkId to null');
      }
    });
  }
});

// 定义 defaultBookmarkId 变量
let defaultBookmarkId = null;

// 从存储中获取 defaultBookmarkId
function loadDefaultBookmarkId() {
  chrome.storage.local.get(['defaultBookmarkId'], function (result) {
    if (chrome.runtime.lastError) {
      console.error('Error loading defaultBookmarkId from storage:', chrome.runtime.lastError);
    } else {
      defaultBookmarkId = result.defaultBookmarkId || null;
      console.log('Loaded defaultBookmarkId from storage:', defaultBookmarkId);
    }
  });
}

// 初始加载
loadDefaultBookmarkId();

// 监听存储变化
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === 'local' && changes.defaultBookmarkId) {
    defaultBookmarkId = changes.defaultBookmarkId.newValue;
    console.log('Updated defaultBookmarkId from storage change:', defaultBookmarkId);
  }
});

// 保留这个新的消息监听器，并添加其他操作

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script received a message:", request);
  switch (request.action) {
    case 'fetchBookmarks':
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ bookmarks: bookmarkTreeNodes });
        }
      });
      return true;

    case 'getDefaultBookmarkId':
      console.log('Sending defaultBookmarkId:', defaultBookmarkId);
      sendResponse({ defaultBookmarkId });
      break;

    case 'setDefaultBookmarkId':
      defaultBookmarkId = request.defaultBookmarkId;
      chrome.storage.local.set({ defaultBookmarkId: defaultBookmarkId }, function () {
        if (chrome.runtime.lastError) {
          console.error('Error setting defaultBookmarkId:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Updated defaultBookmarkId to:', defaultBookmarkId);
          sendResponse({ success: true });
        }
      });
      return true;

    case 'openInternalPage':
      handleOpenInternalPage(request, sendResponse);
      return true;

    case 'reloadExtension':
      chrome.runtime.reload();
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }

  return false; // 对于同步响应的情况
});

function handleOpenInternalPage(request, sendResponse) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.update(tabs[0].id, {url: request.url}, function(tab) {
        if (chrome.runtime.lastError) {
          console.error('Error updating tab:', chrome.runtime.lastError);
          sendResponse({success: false, error: 'Error updating tab: ' + chrome.runtime.lastError.message});
        } else {
          console.log('Successfully opened internal page:', request.url);
          sendResponse({success: true, message: 'Current tab updated'});
        }
      });
    } else {
      console.error('No active tab found');
      sendResponse({success: false, error: 'No active tab found'});
    }
  });
  return true; // 保持消息通道开放
}



