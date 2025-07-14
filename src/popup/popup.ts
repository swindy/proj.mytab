import { Bookmark, StorageData, Workspace, Workspaces } from '../types/index.js';

// 声明Chrome API类型
declare const chrome: any;

// DOM元素类型断言辅助函数
function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T;
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return element;
}

function getElementBySelector<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector(selector) as T;
  if (!element) {
    throw new Error(`Element with selector '${selector}' not found`);
  }
  return element;
}

document.addEventListener('DOMContentLoaded', (): void => {
  // 事件监听器
  getElement<HTMLFormElement>('save-to-workspace-form').addEventListener('submit', handleSaveToWorkspace);
  
  // 初始化表单
  initializeForm();
});

// 初始化表单
function initializeForm(): void {
  // 获取当前页面信息
  getCurrentPageInfo().then(pageInfo => {
    const titleInput = getElement<HTMLInputElement>('workspace-bookmark-title');
    const urlInput = getElement<HTMLInputElement>('workspace-bookmark-url');
    
    titleInput.value = pageInfo.title;
    urlInput.value = pageInfo.url;
    
    // 加载工作区列表
    loadWorkspaceList();
  });
}

// 获取当前页面信息
function getCurrentPageInfo(): Promise<{title: string, url: string}> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs: any[]) => {
        if (tabs[0]) {
          resolve({
            title: tabs[0].title || '',
            url: tabs[0].url || ''
          });
        } else {
          resolve({title: '', url: ''});
        }
      });
    } else {
      // 本地测试环境
      resolve({title: '测试页面', url: 'https://example.com'});
    }
  });
}

// 加载工作区列表
function loadWorkspaceList(): void {
  chrome.storage.sync.get(['workspaces'], (data: StorageData): void => {
    const workspaces: Workspaces = data.workspaces || {};
    const workspaceSelect = getElement<HTMLSelectElement>('workspace-select');
    
    // 清空现有选项
    workspaceSelect.innerHTML = '';
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '选择工作区';
    workspaceSelect.appendChild(defaultOption);
    
    // 添加工作区选项
    Object.keys(workspaces).forEach(workspaceId => {
      const workspace = workspaces[workspaceId];
      if (workspace) {
        const option = document.createElement('option');
        option.value = workspaceId;
        option.textContent = workspace.name;
        workspaceSelect.appendChild(option);
      }
    });
  });
}

// 处理保存到工作区
function handleSaveToWorkspace(e: Event): void {
  e.preventDefault();
  
  const titleInput = getElement<HTMLInputElement>('workspace-bookmark-title');
  const urlInput = getElement<HTMLInputElement>('workspace-bookmark-url');
  const workspaceSelect = getElement<HTMLSelectElement>('workspace-select');
  
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();
  const workspaceId = workspaceSelect.value;
  
  if (!title || !url || !workspaceId) {
    alert('请填写完整信息并选择工作区');
    return;
  }
  
  // 保存到指定工作区
  chrome.storage.sync.get(['workspaces'], (data: StorageData): void => {
    const workspaces: Workspaces = data.workspaces || {};
    
    if (!workspaces[workspaceId]) {
      alert('工作区不存在');
      return;
    }
    
    // 检查是否已存在相同的书签
    const existingBookmark = workspaces[workspaceId].bookmarks.find(bookmark => 
      bookmark.url === url
    );
    
    if (existingBookmark) {
      alert('该页面已存在于此工作区中');
      return;
    }
    
    // 添加新书签
    let iconUrl = `https://www.google.com/s2/favicons?domain=${url}`;
    try {
      const urlObj = new URL(url);
      iconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`;
    } catch (e) {
      // 如果URL无效，使用默认图标
      iconUrl = `https://www.google.com/s2/favicons?domain=${url}`;
    }
    
    const newBookmark: Bookmark = {
      title,
      url,
      icon: iconUrl
    };
    
    workspaces[workspaceId].bookmarks.push(newBookmark);
    
    // 保存到存储
    chrome.storage.sync.set({ workspaces }, (): void => {
      const workspaceName = workspaces[workspaceId]?.name || '未知工作区';
      alert(`已保存到工作区: ${workspaceName}`);
      // 重新初始化表单以获取新的页面信息
      initializeForm();
    });
  });
}
