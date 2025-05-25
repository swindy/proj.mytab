document.addEventListener('DOMContentLoaded', () => {
  console.log('页面加载完成，开始初始化...');
  
  try {
    // 初始化时钟和日期
    updateClock();
    setInterval(updateClock, 1000);
    console.log('时钟初始化完成');
    
    // 初始化搜索
    initSearch();
    console.log('搜索初始化完成');
    
    // 初始化侧边栏
    initSidebar();
    console.log('侧边栏初始化完成');
    
    // 初始化模态框
    initModals();
    console.log('模态框初始化完成');
    
    // 初始化底边栏图标错误处理
    initBottomBarIcons();
    console.log('底边栏图标初始化完成');
    
    // 初始化工作区（这会触发书签初始化）
    initWorkspaces();
    console.log('工作区初始化完成');
    
    // 初始化动漫背景
    initAnimeBackground();
    console.log('动漫背景初始化完成');
    
  } catch (error) {
    console.error('初始化过程中发生错误:', error);
  }
});

// 更新时钟和日期
function updateClock() {
  const now = new Date();
  
  // 更新时钟
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
  
  // 更新日期
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  document.getElementById('date').textContent = now.toLocaleDateString('zh-CN', options);
}

// 初始化快速链接/书签
function initBookmarks() {
  const bookmarksContainer = document.getElementById('bookmarks');
  if (!bookmarksContainer) {
    console.error('书签容器元素未找到');
    return;
  }
  
  bookmarksContainer.innerHTML = '';
  
  // 检查工作区数据是否已加载
  if (!workspaces || !currentWorkspace) {
    console.log('工作区数据尚未加载，跳过书签初始化');
    return;
  }
  
  // 确保当前工作区存在
  if (!workspaces[currentWorkspace]) {
    console.error('当前工作区不存在:', currentWorkspace);
    return;
  }
  
  // 获取当前工作区的书签
  if (workspaces[currentWorkspace].bookmarks && workspaces[currentWorkspace].bookmarks.length > 0) {
    const bookmarks = workspaces[currentWorkspace].bookmarks;
    
    // 渲染书签
    bookmarks.forEach(bookmark => {
      const bookmarkElement = createBookmarkElement(bookmark);
      bookmarksContainer.appendChild(bookmarkElement);
    });
  } else {
    // 如果当前工作区没有书签，显示默认书签（仅限默认工作区）
    if (currentWorkspace === 'default') {
      const defaultBookmarks = [
        { title: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
        { title: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
        { title: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
        { title: 'Bilibili', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
        { title: '腾讯视频', url: 'https://v.qq.com', icon: 'https://v.qq.com/favicon.ico' },
        { title: '淘宝', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico' }
      ];
      
      // 保存默认书签到当前工作区
      workspaces[currentWorkspace].bookmarks = defaultBookmarks;
      
      // 保存到存储（如果可用）
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({ workspaces });
      }
      
      // 渲染书签
      defaultBookmarks.forEach(bookmark => {
        const bookmarkElement = createBookmarkElement(bookmark);
        bookmarksContainer.appendChild(bookmarkElement);
      });
    }
  }
  
  // 添加"添加书签"按钮到最后
  const addButton = createAddBookmarkButton();
  
  // 计算当前书签数量，为添加按钮设置合适的动画延迟
  const bookmarkCount = bookmarksContainer.children.length;
  const delay = (bookmarkCount + 1) * 0.1;
  addButton.style.animationDelay = `${delay}s`;
  
  bookmarksContainer.appendChild(addButton);
}

// 获取网站类型对应的渐变色
function getIconGradient(url, title) {
  const domain = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // 根据网站类型返回不同的渐变色
  if (domain.includes('baidu') || domain.includes('google') || domain.includes('bing')) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // 搜索 - 紫蓝
  } else if (domain.includes('weibo') || domain.includes('twitter') || domain.includes('facebook')) {
    return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'; // 社交 - 粉红
  } else if (domain.includes('zhihu') || domain.includes('stackoverflow')) {
    return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'; // 问答 - 蓝青
  } else if (domain.includes('bilibili') || domain.includes('youtube') || domain.includes('netflix')) {
    return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'; // 视频 - 粉黄
  } else if (domain.includes('github') || domain.includes('gitlab') || domain.includes('coding')) {
    return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'; // 代码 - 青粉
  } else if (domain.includes('taobao') || domain.includes('tmall') || domain.includes('jd')) {
    return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'; // 购物 - 橙黄
  } else if (domain.includes('music') || domain.includes('spotify') || titleLower.includes('音乐')) {
    return 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'; // 音乐 - 紫粉
  } else if (domain.includes('mail') || domain.includes('gmail') || titleLower.includes('邮箱')) {
    return 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'; // 邮件 - 粉紫
  } else {
    // 默认渐变色
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
}

// 创建添加书签按钮
function createAddBookmarkButton() {
  const addBookmarkItem = document.createElement('div');
  addBookmarkItem.className = 'add-bookmark-item';
  addBookmarkItem.id = 'add-bookmark';
  
  const iconContainer = document.createElement('div');
  iconContainer.className = 'add-bookmark-icon';
  iconContainer.textContent = '+';
  
  const titleElement = document.createElement('div');
  titleElement.className = 'add-bookmark-title';
  titleElement.textContent = '添加链接';
  
  addBookmarkItem.appendChild(iconContainer);
  addBookmarkItem.appendChild(titleElement);
  
  // 添加点击事件
  addBookmarkItem.addEventListener('click', () => {
    const addBookmarkModal = document.getElementById('add-bookmark-modal');
    if (addBookmarkModal) {
      addBookmarkModal.classList.add('active');
    }
  });
  
  return addBookmarkItem;
}

// 创建书签元素
function createBookmarkElement(bookmark) {
  const bookmarkItem = document.createElement('a');
  bookmarkItem.href = bookmark.url;
  bookmarkItem.className = 'bookmark-item';
  
  // 如果有描述，添加到title属性中
  if (bookmark.description) {
    bookmarkItem.title = `${bookmark.title}\n${bookmark.description}`;
  } else {
    bookmarkItem.title = bookmark.title;
  }
  
  const iconContainer = document.createElement('div');
  iconContainer.className = 'bookmark-icon';
  
  if (bookmark.icon) {
    const iconImg = document.createElement('img');
    iconImg.src = bookmark.icon;
    iconImg.alt = bookmark.title;
    // 图标加载失败时显示首字母
    iconImg.onerror = function() {
      iconContainer.innerHTML = bookmark.title.charAt(0).toUpperCase();
      iconContainer.classList.add('letter-icon');
      // 设置个性化渐变色
      iconContainer.style.background = getIconGradient(bookmark.url, bookmark.title);
    };
    iconContainer.appendChild(iconImg);
  } else {
    // 如果没有图标，使用首字母
    iconContainer.textContent = bookmark.title.charAt(0).toUpperCase();
    iconContainer.classList.add('letter-icon');
    // 设置个性化渐变色
    iconContainer.style.background = getIconGradient(bookmark.url, bookmark.title);
  }
  
  const titleElement = document.createElement('div');
  titleElement.className = 'bookmark-title';
  titleElement.textContent = bookmark.title;
  
  bookmarkItem.appendChild(iconContainer);
  bookmarkItem.appendChild(titleElement);
  
  return bookmarkItem;
}

// 初始化搜索功能
function initSearch() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query) {
      // 获取当前搜索引擎设置
      chrome.storage.sync.get('searchEngine', (data) => {
        const searchEngine = data.searchEngine || 'baidu';
        let searchUrl;
        
        switch (searchEngine) {
          case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;
          case 'bing':
            searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            break;
          default:
            searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
        }
        
        window.location.href = searchUrl;
      });
    }
  });
}

// 全局变量
let currentWorkspace = 'default';
let workspaces = {};

// 初始化工作区
function initWorkspaces() {
  // 检查是否在扩展环境中
  if (typeof chrome !== 'undefined' && chrome.storage) {
    // 从存储中加载工作区数据
    chrome.storage.sync.get(['workspaces', 'currentWorkspace'], (data) => {
      workspaces = data.workspaces || getDefaultWorkspaces();
      currentWorkspace = data.currentWorkspace || 'default';
      
      // 完成工作区初始化后，再初始化其他依赖组件
      completeWorkspaceInit();
    });
  } else {
    // 本地测试环境，使用默认数据
    console.log('本地测试环境，使用默认工作区数据');
    workspaces = getDefaultWorkspaces();
    currentWorkspace = 'default';
    
    // 完成工作区初始化后，再初始化其他依赖组件
    completeWorkspaceInit();
  }
}

// 完成工作区初始化后的操作
function completeWorkspaceInit() {
  // 更新工作区列表
  updateWorkspaceList();
  
  // 设置当前工作区
  switchWorkspace(currentWorkspace);
  
  // 初始化书签（现在工作区数据已经准备好了）
  initBookmarks();
  console.log('书签初始化完成');
}

// 获取默认工作区数据
function getDefaultWorkspaces() {
  return {
    default: {
      name: '默认',
      icon: '🏠',
      bookmarks: []
    },
    work: {
      name: '工作',
      icon: '💼',
      bookmarks: []
    },
    study: {
      name: '学习',
      icon: '📚',
      bookmarks: []
    },
    entertainment: {
      name: '娱乐',
      icon: '🎮',
      bookmarks: []
    }
  };
}

// 更新工作区列表
function updateWorkspaceList() {
  const workspaceList = document.querySelector('.workspace-list');
  workspaceList.innerHTML = '';
  
  Object.keys(workspaces).forEach(workspaceId => {
    const workspace = workspaces[workspaceId];
    const workspaceItem = document.createElement('div');
    workspaceItem.className = 'workspace-item';
    workspaceItem.dataset.workspace = workspaceId;
    
    if (workspaceId === currentWorkspace) {
      workspaceItem.classList.add('active');
    }
    
    workspaceItem.innerHTML = `
      <div class="workspace-icon">${workspace.icon}</div>
      <span>${workspace.name}</span>
    `;
    
    workspaceItem.addEventListener('click', () => {
      switchWorkspace(workspaceId);
    });
    
    workspaceList.appendChild(workspaceItem);
  });
}

// 切换工作区
function switchWorkspace(workspaceId) {
  if (!workspaces[workspaceId]) return;
  
  currentWorkspace = workspaceId;
  
  // 更新活动状态
  document.querySelectorAll('.workspace-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`[data-workspace="${workspaceId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
  
  // 更新标题
  const workspaceTitle = document.getElementById('workspace-title');
  workspaceTitle.textContent = workspaces[workspaceId].name;
  
  // 重新加载书签
  initBookmarks();
  
  // 保存当前工作区
  chrome.storage.sync.set({ currentWorkspace });
}

// 初始化侧边栏
function initSidebar() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const bottomBar = document.getElementById('bottom-bar');
  
  if (!sidebarToggle || !sidebar) {
    console.error('侧边栏元素未找到');
    return;
  }
  
  // 更新底边栏位置的函数
  function updateBottomBarPosition() {
    if (bottomBar) {
      const isCollapsed = sidebar.classList.contains('collapsed');
      bottomBar.style.left = isCollapsed ? '60px' : '250px';
      console.log('底边栏位置已更新:', isCollapsed ? '60px' : '250px');
    }
  }
  
  sidebarToggle.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('侧边栏切换按钮被点击');
    
    sidebar.classList.toggle('collapsed');
    console.log('侧边栏collapsed状态:', sidebar.classList.contains('collapsed'));
    
    // 手动更新按钮文本作为备用方案
    const toggleSpan = sidebarToggle.querySelector('span');
    if (toggleSpan) {
      toggleSpan.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
    }
    
    // 更新底边栏位置
    updateBottomBarPosition();
  });
  
  // 初始化时设置底边栏位置
  updateBottomBarPosition();
}

// 初始化模态框
function initModals() {
  const addWorkspaceBtn = document.getElementById('add-workspace');
  const addWorkspaceModal = document.getElementById('add-workspace-modal');
  const addWorkspaceForm = document.getElementById('add-workspace-form');
  const cancelWorkspaceBtn = document.getElementById('cancel-workspace');
  const settingsBtn = document.getElementById('settings-btn');
  
  // 书签相关元素
  const addBookmarkModal = document.getElementById('add-bookmark-modal');
  const addBookmarkForm = document.getElementById('add-bookmark-form');
  const cancelBookmarkBtn = document.getElementById('cancel-bookmark');
  
  // 添加工作区按钮
  addWorkspaceBtn.addEventListener('click', () => {
    addWorkspaceModal.classList.add('active');
  });
  
  // 取消按钮
  cancelWorkspaceBtn.addEventListener('click', () => {
    addWorkspaceModal.classList.remove('active');
    addWorkspaceForm.reset();
    clearIconSelection();
  });
  
  // 点击模态框外部关闭
  addWorkspaceModal.addEventListener('click', (e) => {
    if (e.target === addWorkspaceModal) {
      addWorkspaceModal.classList.remove('active');
      addWorkspaceForm.reset();
      clearIconSelection();
    }
  });
  
  // 图标选择
  const iconOptions = document.querySelectorAll('.icon-option');
  iconOptions.forEach(option => {
    option.addEventListener('click', () => {
      iconOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
  
  // 添加工作区表单提交
  addWorkspaceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const workspaceName = document.getElementById('workspace-name').value.trim();
    const selectedIcon = document.querySelector('.icon-option.selected');
    
    if (!workspaceName || !selectedIcon) {
      alert('请填写工作区名称并选择图标');
      return;
    }
    
    const workspaceId = 'workspace_' + Date.now();
    const workspaceIcon = selectedIcon.dataset.icon;
    
    // 添加新工作区
    workspaces[workspaceId] = {
      name: workspaceName,
      icon: workspaceIcon,
      bookmarks: []
    };
    
    // 保存到存储
    chrome.storage.sync.set({ workspaces }, () => {
      updateWorkspaceList();
      addWorkspaceModal.classList.remove('active');
      addWorkspaceForm.reset();
      clearIconSelection();
    });
  });
  

  
  // 取消添加书签
  if (cancelBookmarkBtn && addBookmarkModal && addBookmarkForm) {
    cancelBookmarkBtn.addEventListener('click', () => {
      addBookmarkModal.classList.remove('active');
      addBookmarkForm.reset();
    });
  }
  
  // 点击模态框外部关闭书签弹框
  if (addBookmarkModal && addBookmarkForm) {
    addBookmarkModal.addEventListener('click', (e) => {
      if (e.target === addBookmarkModal) {
        addBookmarkModal.classList.remove('active');
        addBookmarkForm.reset();
      }
    });
  }
  
  // 添加书签表单提交
  addBookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('bookmark-title').value.trim();
    const url = document.getElementById('bookmark-url').value.trim();
    const description = document.getElementById('bookmark-description').value.trim();
    
    if (!title || !url) {
      alert('请填写链接名称和地址');
      return;
    }
    
    // 验证URL格式
    try {
      new URL(url);
    } catch (e) {
      alert('请输入有效的URL地址');
      return;
    }
    
    // 创建新书签
    const newBookmark = {
      title: title,
      url: url,
      description: description,
      icon: getFaviconUrl(url)
    };
    
    // 添加到当前工作区
    if (!workspaces[currentWorkspace].bookmarks) {
      workspaces[currentWorkspace].bookmarks = [];
    }
    
    workspaces[currentWorkspace].bookmarks.push(newBookmark);
    
    // 保存到存储
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ workspaces }, () => {
        initBookmarks(); // 重新加载书签
        addBookmarkModal.classList.remove('active');
        addBookmarkForm.reset();
        console.log('书签添加成功:', newBookmark);
      });
    } else {
      // 本地测试环境，直接更新
      console.log('本地测试环境，直接更新书签');
      initBookmarks(); // 重新加载书签
      addBookmarkModal.classList.remove('active');
      addBookmarkForm.reset();
      console.log('书签添加成功:', newBookmark);
    }
  });
  
  // 设置按钮 - 打开扩展设置
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // 背景切换按钮
  const bgSwitchBtn = document.getElementById('bg-switch-btn');
  if (bgSwitchBtn) {
    bgSwitchBtn.addEventListener('click', () => {
      if (!isTransitioning) {
        // 添加点击反馈动画
        bgSwitchBtn.style.transform = 'translateY(-6px) scale(1.15) rotate(180deg)';
        setTimeout(() => {
          bgSwitchBtn.style.transform = '';
        }, 300);
        
        switchBackground();
      }
    });
  }
}

// 清除图标选择
function clearIconSelection() {
  document.querySelectorAll('.icon-option').forEach(option => {
    option.classList.remove('selected');
  });
}

// 获取网站图标URL
function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
  } catch (e) {
    return null;
  }
}

// 初始化底边栏图标错误处理
function initBottomBarIcons() {
  const fixedLinks = document.querySelectorAll('.fixed-link');
  
  fixedLinks.forEach(link => {
    const img = link.querySelector('img');
    const emoji = link.getAttribute('data-emoji');
    
    if (img && emoji) {
      img.addEventListener('error', function() {
        // 隐藏失败的图片
        this.style.display = 'none';
        
        // 用emoji替换
        link.innerHTML = emoji;
        link.style.fontSize = '1.8rem';
        link.style.color = 'white';
        link.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
      });
    }
  });
}

// 动漫壁纸URL列表
const animeWallpapers = [
  // 梦幻天空系列
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&sat=20&con=10',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop&sat=30&hue=180',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop&sat=25&hue=270',
  
  // 抽象艺术系列
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&h=1080&fit=crop&sat=40&con=15',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop&sat=35&hue=90',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&h=1080&fit=crop&sat=30&hue=45',
  
  // 自然风景系列
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&sat=50&hue=120',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&sat=40&con=20',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&sat=45&hue=300',
  
  // 城市夜景系列
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop&sat=60&con=25',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&h=1080&fit=crop&sat=55&hue=200',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop&sat=50&hue=330',
  
  // 梦幻色彩系列
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop&sat=70&hue=60',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&h=1080&fit=crop&sat=65&hue=240',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&sat=60&hue=150'
];

let currentBgIndex = 0;
let isTransitioning = false;

// 初始化动漫背景
function initAnimeBackground() {
  const bg1 = document.getElementById('anime-bg-1');
  const bg2 = document.getElementById('anime-bg-2');
  
  if (!bg1 || !bg2) {
    console.error('背景元素未找到');
    return;
  }
  
  // 设置初始背景
  setRandomBackground(bg1);
  
  // 每2分钟切换一次背景
  setInterval(() => {
    if (!isTransitioning) {
      switchBackground();
    }
  }, 120000);
}

// 设置随机背景
function setRandomBackground(element) {
  const randomIndex = Math.floor(Math.random() * animeWallpapers.length);
  const imageUrl = animeWallpapers[randomIndex];
  
  // 预加载图片
  const img = new Image();
  img.onload = () => {
    element.style.backgroundImage = `url(${imageUrl})`;
  };
  img.onerror = () => {
    console.error('背景图片加载失败:', imageUrl);
    // 使用渐变背景作为备用
    element.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };
  img.src = imageUrl;
  
  currentBgIndex = randomIndex;
}

// 切换背景
function switchBackground() {
  const bg1 = document.getElementById('anime-bg-1');
  const bg2 = document.getElementById('anime-bg-2');
  
  if (!bg1 || !bg2) return;
  
  isTransitioning = true;
  
  // 确定当前显示的背景和隐藏的背景
  const currentBg = bg1.style.opacity !== '0' ? bg1 : bg2;
  const nextBg = currentBg === bg1 ? bg2 : bg1;
  
  // 为下一个背景设置新的随机图片
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * animeWallpapers.length);
  } while (newIndex === currentBgIndex && animeWallpapers.length > 1);
  
  const imageUrl = animeWallpapers[newIndex];
  
  // 预加载新图片
  const img = new Image();
  img.onload = () => {
    nextBg.style.backgroundImage = `url(${imageUrl})`;
    
    // 开始切换动画
    nextBg.style.opacity = '1';
    currentBg.style.opacity = '0';
    
    // 动画完成后重置状态
    setTimeout(() => {
      isTransitioning = false;
      currentBgIndex = newIndex;
    }, 2000);
  };
  
  img.onerror = () => {
    console.error('新背景图片加载失败:', imageUrl);
    isTransitioning = false;
  };
  
  img.src = imageUrl;
} 