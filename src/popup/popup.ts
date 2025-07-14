import { Bookmark, SearchEngine, Theme, StorageData, GitHubSyncConfig, SyncData, SyncStatus } from '../types/index.js';
import { Octokit } from '@octokit/rest';

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
  // 加载设置
  loadSettings();
  
  // 事件监听器
  getElement('add-bookmark').addEventListener('click', showAddBookmarkDialog);
  getElement('cancel-add-bookmark').addEventListener('click', hideAddBookmarkDialog);
  getElement<HTMLFormElement>('add-bookmark-form').addEventListener('submit', handleAddBookmark);
  getElement('save-settings').addEventListener('click', saveSettings);
  
  // GitHub同步相关事件监听器
  getElement<HTMLInputElement>('github-sync-enabled').addEventListener('change', toggleGitHubSync);
  getElement('test-connection').addEventListener('click', testGitHubConnection);
  getElement('sync-now').addEventListener('click', syncNow);
});

// 加载设置
function loadSettings(): void {
  chrome.storage.sync.get(['bookmarks', 'searchEngine', 'githubSync'], (data: StorageData): void => {
    // 加载书签
    if (data.bookmarks) {
      renderBookmarks(data.bookmarks);
    }
    
    // 加载搜索引擎设置
    if (data.searchEngine) {
      const searchEngineInput = document.querySelector<HTMLInputElement>(`input[name="search-engine"][value="${data.searchEngine}"]`);
      if (searchEngineInput) {
        searchEngineInput.checked = true;
      }
    }
    
    // 加载GitHub同步设置
    if (data.githubSync) {
      const syncEnabled = getElement<HTMLInputElement>('github-sync-enabled');
      const syncConfig = getElement('github-sync-config');
      const githubToken = getElement<HTMLInputElement>('github-token');
      
      syncEnabled.checked = data.githubSync.enabled;
      githubToken.value = data.githubSync.token || '';
      
      if (data.githubSync.enabled) {
        syncConfig.style.display = 'block';
        updateSyncStatus('idle', '已启用GitHub同步');
      } else {
        syncConfig.style.display = 'none';
      }
    }
  });
}

// 渲染书签列表
function renderBookmarks(bookmarks: Bookmark[]): void {
  const bookmarkList = getElement('bookmark-list');
  bookmarkList.innerHTML = '';
  
  bookmarks.forEach((bookmark: Bookmark, index: number): void => {
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'bookmark-item';
    
    const bookmarkInfo = document.createElement('div');
    bookmarkInfo.className = 'bookmark-info';
    
    const favicon = document.createElement('img');
    favicon.className = 'bookmark-icon';
    favicon.src = bookmark.icon || `https://www.google.com/s2/favicons?domain=${bookmark.url}`;
    favicon.alt = '';
    
    const title = document.createElement('span');
    title.className = 'bookmark-title';
    title.textContent = bookmark.title;
    
    bookmarkInfo.appendChild(favicon);
    bookmarkInfo.appendChild(title);
    
    const bookmarkActions = document.createElement('div');
    bookmarkActions.className = 'bookmark-actions';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'bookmark-action';
    deleteButton.textContent = '删除';
    deleteButton.addEventListener('click', (): void => deleteBookmark(index));
    
    bookmarkActions.appendChild(deleteButton);
    
    bookmarkItem.appendChild(bookmarkInfo);
    bookmarkItem.appendChild(bookmarkActions);
    
    bookmarkList.appendChild(bookmarkItem);
  });
}

// 显示添加书签对话框
function showAddBookmarkDialog(): void {
  const dialog = getElement('add-bookmark-dialog');
  dialog.classList.add('active');
}

// 隐藏添加书签对话框
function hideAddBookmarkDialog(): void {
  const dialog = getElement('add-bookmark-dialog');
  dialog.classList.remove('active');
  getElement<HTMLFormElement>('add-bookmark-form').reset();
}

// 处理添加书签
function handleAddBookmark(e: Event): void {
  e.preventDefault();
  
  const titleInput = getElement<HTMLInputElement>('bookmark-title');
  const urlInput = getElement<HTMLInputElement>('bookmark-url');
  
  const title = titleInput.value.trim();
  let url = urlInput.value.trim();
  
  // 确保URL格式正确
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  chrome.storage.sync.get('bookmarks', (data: StorageData): void => {
    const bookmarks: Bookmark[] = data.bookmarks || [];
    
    // 添加新书签
    const newBookmark: Bookmark = {
      title,
      url,
      icon: `https://www.google.com/s2/favicons?domain=${url}`
    };
    
    bookmarks.push(newBookmark);
    
    // 保存到存储
    chrome.storage.sync.set({ bookmarks }, (): void => {
      renderBookmarks(bookmarks);
      hideAddBookmarkDialog();
    });
  });
}

// 删除书签
function deleteBookmark(index: number): void {
  chrome.storage.sync.get('bookmarks', (data: StorageData): void => {
    const bookmarks: Bookmark[] = data.bookmarks || [];
    
    // 删除指定索引的书签
    bookmarks.splice(index, 1);
    
    // 保存到存储
    chrome.storage.sync.set({ bookmarks }, (): void => {
      renderBookmarks(bookmarks);
    });
  });
}

// 保存设置
function saveSettings(): void {
  // 获取搜索引擎设置
  const searchEngineInput = getElementBySelector<HTMLInputElement>('input[name="search-engine"]:checked');
  const searchEngine = searchEngineInput.value as SearchEngine;
  
  // 保存设置
  chrome.storage.sync.set({ searchEngine }, (): void => {
    // 显示保存成功提示
    const saveButton = getElement<HTMLButtonElement>('save-settings');
    const originalText = saveButton.textContent || '保存设置';
    saveButton.textContent = '已保存';
    saveButton.disabled = true;
    
    setTimeout((): void => {
      saveButton.textContent = originalText;
      saveButton.disabled = false;
    }, 1500);
  });
}

// GitHub同步相关函数
let currentSyncStatus: SyncStatus = 'idle';

// 切换GitHub同步开关
function toggleGitHubSync(): void {
  const syncEnabled = getElement<HTMLInputElement>('github-sync-enabled').checked;
  const syncConfig = getElement('github-sync-config');
  
  if (syncEnabled) {
    syncConfig.style.display = 'block';
    loadGitHubSyncSettings();
  } else {
    syncConfig.style.display = 'none';
    // 保存禁用状态
    chrome.storage.sync.set({ 
      githubSync: { enabled: false } 
    });
  }
}

// 加载GitHub同步设置
function loadGitHubSyncSettings(): void {
  chrome.storage.sync.get(['githubSync'], (data: StorageData): void => {
    const syncConfig = data.githubSync;
    if (syncConfig) {
      getElement<HTMLInputElement>('github-sync-enabled').checked = syncConfig.enabled;
      getElement<HTMLInputElement>('github-token').value = syncConfig.token || '';
      
      if (syncConfig.enabled) {
        getElement('github-sync-config').style.display = 'block';
      }
    }
  });
}

// 测试GitHub连接
async function testGitHubConnection(): Promise<void> {
  const tokenInput = getElement<HTMLInputElement>('github-token');
  const token = tokenInput.value.trim();
  
  if (!token) {
    updateSyncStatus('error', '请输入GitHub Token');
    return;
  }
  
  try {
    updateSyncStatus('syncing', '正在测试连接...');
    
    // 创建Octokit实例
    const octokit = new Octokit({
      auth: token,
    });
    
    // 测试连接
    const response = await octokit.rest.users.getAuthenticated();
    updateSyncStatus('success', `连接成功，用户: ${response.data.login}`);
    
    // 保存token
    chrome.storage.sync.set({
      githubSync: { token, enabled: true }
    });
    
  } catch (error: any) {
    updateSyncStatus('error', `连接失败: ${error.message}`);
  }
}

// 立即同步
async function syncNow(): Promise<void> {
  const token = getElement<HTMLInputElement>('github-token').value.trim();
  
  if (!token) {
    updateSyncStatus('error', '请先设置GitHub Token');
    return;
  }
  
  try {
    updateSyncStatus('syncing', '正在同步...');
    
    // 获取当前本地设置
    const localData = await getCurrentSettings();
    
    // 获取或创建gist
    const gistId = await getOrCreateGist(token);
    
    // 同步数据
    await syncWithGist(token, gistId, localData);
    
    updateSyncStatus('success', '同步完成');
    
  } catch (error: any) {
    updateSyncStatus('error', `同步失败: ${error.message}`);
  }
}

// 获取当前设置
function getCurrentSettings(): Promise<SyncData> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['bookmarks', 'searchEngine', 'workspaces', 'currentWorkspace'], (data: StorageData) => {
      resolve({
        bookmarks: data.bookmarks || [],
        searchEngine: data.searchEngine || 'baidu',
        workspaces: data.workspaces || {},
        currentWorkspace: data.currentWorkspace || 'default',
        lastSync: new Date().toISOString()
      });
    });
  });
}

// 获取或创建gist
async function getOrCreateGist(token: string): Promise<string> {
  const octokit = new Octokit({
    auth: token,
  });
  
  // 获取用户的所有gists
  const response = await octokit.rest.gists.list();
  const gists = response.data;
  
  // 查找名为mytab的gist
  const existingGist = gists.find((gist: any) => 
    gist.files && 'mytab-config.json' in gist.files
  );
  
  if (existingGist) {
    return existingGist.id;
  }
  
  // 创建新的gist
  const createResponse = await octokit.rest.gists.create({
    description: 'MyTab Extension Configuration',
    public: false,
    files: {
      'mytab-config.json': {
        content: JSON.stringify({
          bookmarks: [],
          searchEngine: 'baidu',
          theme: 'light',
          workspaces: {},
          currentWorkspace: 'default'
        }, null, 2)
      }
    }
  });
  
  return createResponse.data.id!;
}

// 与gist同步
async function syncWithGist(token: string, gistId: string, localData: SyncData): Promise<void> {
  const octokit = new Octokit({
    auth: token,
  });
  
  // 获取gist内容
  const gistResponse = await octokit.rest.gists.get({
    gist_id: gistId
  });
  
  const gistContent = gistResponse.data.files!['mytab-config.json']?.content;
  let remoteData: SyncData;
  
  if (gistContent) {
    remoteData = JSON.parse(gistContent);
  } else {
    remoteData = localData;
  }
  
  // 合并本地和远程数据
  const mergedData = mergeData(localData, remoteData);
  
  // 更新本地存储
  chrome.storage.sync.set({
    bookmarks: mergedData.bookmarks,
    searchEngine: mergedData.searchEngine,
    theme: mergedData.theme,
    workspaces: mergedData.workspaces,
    currentWorkspace: mergedData.currentWorkspace,
    githubSync: { 
      token, 
      enabled: true, 
      gistId 
    }
  });
  
  // 更新gist
  await octokit.rest.gists.update({
    gist_id: gistId,
    files: {
      'mytab-config.json': {
        content: JSON.stringify(mergedData, null, 2)
      }
    }
  });
  
  // 重新渲染界面
  renderBookmarks(mergedData.bookmarks);
  updateLastSyncTime();
}

// 合并数据
function mergeData(localData: SyncData, remoteData: SyncData): SyncData {
  // 简单的合并策略：使用最新的时间戳
  const localTime = new Date(localData.lastSync || '1970-01-01').getTime();
  const remoteTime = new Date(remoteData.lastSync || '1970-01-01').getTime();
  
  if (localTime > remoteTime) {
    return { ...localData, lastSync: new Date().toISOString() };
  } else {
    return { ...remoteData, lastSync: new Date().toISOString() };
  }
}

// 更新同步状态
function updateSyncStatus(status: SyncStatus, message: string): void {
  currentSyncStatus = status;
  const statusElement = getElement('sync-status-text');
  statusElement.textContent = message;
  
  // 更新样式
  statusElement.className = `sync-status-${status}`;
  
  // 更新按钮状态
  const testButton = getElement<HTMLButtonElement>('test-connection');
  const syncButton = getElement<HTMLButtonElement>('sync-now');
  
  if (status === 'syncing') {
    testButton.disabled = true;
    syncButton.disabled = true;
  } else {
    testButton.disabled = false;
    syncButton.disabled = false;
  }
}

// 更新最后同步时间
function updateLastSyncTime(): void {
  const lastSyncElement = getElement('last-sync-time');
  const now = new Date();
  lastSyncElement.textContent = `最后同步: ${now.toLocaleString('zh-CN')}`;
} 