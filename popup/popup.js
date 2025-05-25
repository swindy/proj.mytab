document.addEventListener('DOMContentLoaded', () => {
  // 加载设置
  loadSettings();
  
  // 事件监听器
  document.getElementById('add-bookmark').addEventListener('click', showAddBookmarkDialog);
  document.getElementById('cancel-add-bookmark').addEventListener('click', hideAddBookmarkDialog);
  document.getElementById('add-bookmark-form').addEventListener('submit', handleAddBookmark);
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // 主题选择器事件监听
  const themeButtons = document.querySelectorAll('.theme-option');
  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      themeButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
});

// 加载设置
function loadSettings() {
  chrome.storage.sync.get(['bookmarks', 'searchEngine', 'theme'], (data) => {
    // 加载书签
    if (data.bookmarks) {
      renderBookmarks(data.bookmarks);
    }
    
    // 加载搜索引擎设置
    if (data.searchEngine) {
      document.querySelector(`input[name="search-engine"][value="${data.searchEngine}"]`).checked = true;
    }
    
    // 加载主题设置
    if (data.theme) {
      const themeButton = document.querySelector(`.theme-option[data-theme="${data.theme}"]`);
      if (themeButton) {
        document.querySelectorAll('.theme-option').forEach(btn => btn.classList.remove('active'));
        themeButton.classList.add('active');
      }
    } else {
      // 默认主题
      document.querySelector('.theme-option[data-theme="light"]').classList.add('active');
    }
  });
}

// 渲染书签列表
function renderBookmarks(bookmarks) {
  const bookmarkList = document.getElementById('bookmark-list');
  bookmarkList.innerHTML = '';
  
  bookmarks.forEach((bookmark, index) => {
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
    deleteButton.addEventListener('click', () => deleteBookmark(index));
    
    bookmarkActions.appendChild(deleteButton);
    
    bookmarkItem.appendChild(bookmarkInfo);
    bookmarkItem.appendChild(bookmarkActions);
    
    bookmarkList.appendChild(bookmarkItem);
  });
}

// 显示添加书签对话框
function showAddBookmarkDialog() {
  const dialog = document.getElementById('add-bookmark-dialog');
  dialog.classList.add('active');
}

// 隐藏添加书签对话框
function hideAddBookmarkDialog() {
  const dialog = document.getElementById('add-bookmark-dialog');
  dialog.classList.remove('active');
  document.getElementById('add-bookmark-form').reset();
}

// 处理添加书签
function handleAddBookmark(e) {
  e.preventDefault();
  
  const title = document.getElementById('bookmark-title').value.trim();
  let url = document.getElementById('bookmark-url').value.trim();
  
  // 确保URL格式正确
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  chrome.storage.sync.get('bookmarks', (data) => {
    const bookmarks = data.bookmarks || [];
    
    // 添加新书签
    const newBookmark = {
      title,
      url,
      icon: `https://www.google.com/s2/favicons?domain=${url}`
    };
    
    bookmarks.push(newBookmark);
    
    // 保存到存储
    chrome.storage.sync.set({ bookmarks }, () => {
      renderBookmarks(bookmarks);
      hideAddBookmarkDialog();
    });
  });
}

// 删除书签
function deleteBookmark(index) {
  chrome.storage.sync.get('bookmarks', (data) => {
    const bookmarks = data.bookmarks || [];
    
    // 删除指定索引的书签
    bookmarks.splice(index, 1);
    
    // 保存到存储
    chrome.storage.sync.set({ bookmarks }, () => {
      renderBookmarks(bookmarks);
    });
  });
}

// 保存设置
function saveSettings() {
  // 获取搜索引擎设置
  const searchEngine = document.querySelector('input[name="search-engine"]:checked').value;
  
  // 获取主题设置
  const theme = document.querySelector('.theme-option.active').dataset.theme;
  
  // 保存设置
  chrome.storage.sync.set({ searchEngine, theme }, () => {
    // 显示保存成功提示
    const saveButton = document.getElementById('save-settings');
    const originalText = saveButton.textContent;
    saveButton.textContent = '已保存';
    saveButton.disabled = true;
    
    setTimeout(() => {
      saveButton.textContent = originalText;
      saveButton.disabled = false;
    }, 1500);
  });
} 