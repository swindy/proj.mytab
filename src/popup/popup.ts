import { Bookmark, SearchEngine, Theme, StorageData } from '../types/index.js';

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
  
  // 主题选择器事件监听
  const themeButtons = document.querySelectorAll<HTMLElement>('.theme-option');
  themeButtons.forEach((button: HTMLElement): void => {
    button.addEventListener('click', (): void => {
      themeButtons.forEach((btn: HTMLElement): void => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
});

// 加载设置
function loadSettings(): void {
  chrome.storage.sync.get(['bookmarks', 'searchEngine', 'theme'], (data: StorageData): void => {
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
    
    // 加载主题设置
    if (data.theme) {
      const themeButton = document.querySelector<HTMLElement>(`.theme-option[data-theme="${data.theme}"]`);
      if (themeButton) {
        document.querySelectorAll<HTMLElement>('.theme-option').forEach((btn: HTMLElement): void => btn.classList.remove('active'));
        themeButton.classList.add('active');
      }
    } else {
      // 默认主题
      const defaultThemeButton = document.querySelector<HTMLElement>('.theme-option[data-theme="light"]');
      if (defaultThemeButton) {
        defaultThemeButton.classList.add('active');
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
  
  // 获取主题设置
  const themeElement = getElementBySelector<HTMLElement>('.theme-option.active');
  const theme = themeElement.dataset['theme'] as Theme;
  
  // 保存设置
  chrome.storage.sync.set({ searchEngine, theme }, (): void => {
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