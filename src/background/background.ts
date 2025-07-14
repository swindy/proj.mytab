import { Bookmark, SearchEngine, StorageData, ChromeMessage, ChromeMessageResponse } from '../types/index.js';

// 声明Chrome API类型（如果@types/chrome不可用）
declare const chrome: any;

// 监听扩展安装
chrome.runtime.onInstalled.addListener((details: any): void => {
  if (details.reason === 'install') {
    // 首次安装时初始化默认设置
    initDefaultSettings();
  } else if (details.reason === 'update') {
    // 扩展更新时可以执行的操作
    const thisVersion: string = chrome.runtime.getManifest().version;
    console.log(`更新到版本 ${thisVersion}`);
  }
});

// 初始化默认设置
function initDefaultSettings(): void {
  // 默认书签
  const defaultBookmarks: Bookmark[] = [
    { title: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
    { title: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
    { title: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
    { title: 'Bilibili', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' }
  ];

  // 默认搜索引擎
  const defaultSearchEngine: SearchEngine = 'baidu';
  
  // 保存默认设置
  const defaultSettings: StorageData = {
    bookmarks: defaultBookmarks,
    searchEngine: defaultSearchEngine
  };

  chrome.storage.sync.set(defaultSettings, (): void => {
    console.log('默认设置已初始化');
  });
}

// 监听来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((
  message: ChromeMessage, 
  sender: any, 
  sendResponse: (response: ChromeMessageResponse) => void
): boolean => {
  if (message.action === 'getSearchEngine') {
    // 获取当前搜索引擎设置
    chrome.storage.sync.get('searchEngine', (data: StorageData): void => {
      sendResponse({
        success: true,
        data: {
          searchEngine: data.searchEngine || 'baidu'
        }
      });
    });
    return true; // 异步响应需要返回true
  }
  
  // 如果没有匹配的action，返回错误
  sendResponse({
    success: false,
    error: `未知的操作: ${message.action}`
  });
  
  return false;
}); 