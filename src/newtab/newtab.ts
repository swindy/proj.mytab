// 导入Octokit
import { Octokit } from '@octokit/rest';

// 本地类型定义（避免import导致的export问题）
interface Bookmark {
  title: string;
  url: string;
  icon?: string;
  description?: string;
}

interface Workspace {
  id: string;
  name: string;
  bookmarks: Bookmark[];
  icon?: string;
}

interface Workspaces {
  [key: string]: Workspace;
}

type SearchEngine = 'baidu' | 'google' | 'bing';

interface SearchEngineConfig {
  name: string;
  url: string;
  placeholder: string;
}

interface AnimeBackground {
  url: string;
  name?: string;
}

// GitHub同步配置接口
interface GitHubSyncConfig {
  token: string;
  gistId?: string;
  enabled: boolean;
}

// 同步状态类型
type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// 同步配置数据接口
interface SyncData {
  bookmarks: Bookmark[];
  searchEngine: SearchEngine;
  workspaces: Workspaces;
  currentWorkspace: string;
  lastSync?: string;
}

// 配置数据接口
interface ConfigData {
  workspaces: Workspaces;
  currentWorkspace: string;
  settings?: Partial<AppSettings>;
  exportTime: string;
  version: string;
}

// 全局变量
let workspaces: Workspaces = {};
let currentWorkspace: string = 'default';

// DOM元素类型断言辅助函数
function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T;
}

function getElementBySelector<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T;
}

// 搜索引擎配置
const searchEngines: Record<SearchEngine, SearchEngineConfig> = {
  baidu: {
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    placeholder: '百度一下，你就知道'
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    placeholder: 'Search Google'
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    placeholder: 'Search Bing'
  }
};

// 动漫背景图片列表
const animeBackgrounds: AnimeBackground[] = [
  { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop', name: '星空夜景' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: '山脉风光' },
  { url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=1080&fit=crop', name: '城市夜景' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: '自然风景' },
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop', name: '森林小径' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: '海洋波浪' },
  { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop', name: '樱花盛开' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: '雪山景色' }
];

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
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

    // 初始化GitHub同步
    initGitHubSync();
    console.log('GitHub同步初始化完成');

    // 初始化底边栏图标（异步）
    initBottomBarIcons();
    console.log('底边栏图标初始化开始');

    // 初始化工作区（这会触发书签初始化）
    initWorkspaces();
    console.log('工作区初始化完成');

    // 初始化动漫背景
    initAnimeBackground();
    console.log('动漫背景初始化完成');

    // 初始化图标选择器（异步）
    initSimpleIconSelector().catch(error => {
      console.error('图标选择器初始化失败:', error);
    });

  } catch (error) {
    console.error('初始化过程中发生错误:', error);
  }
});

// 更新时钟和日期
function updateClock(): void {
  const now = new Date();

  // 更新时钟
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const clockElement = getElement('clock');
  if (clockElement) {
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  // 更新日期
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const dateElement = getElement('date');
  if (dateElement) {
    dateElement.textContent = now.toLocaleDateString('zh-CN', options);
  }
}

// 初始化搜索功能
function initSearch(): void {
  const searchInput = getElement<HTMLInputElement>('search-input');
  const searchForm = getElement<HTMLFormElement>('search-form');

  if (!searchInput || !searchForm) {
    console.error('搜索元素未找到');
    return;
  }

  // 加载搜索引擎设置
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get('searchEngine', (data: { searchEngine?: SearchEngine }): void => {
      const engine = data.searchEngine || 'baidu';
      const config = searchEngines[engine];
      searchInput.placeholder = config.placeholder;
    });
  }

  // 搜索表单提交事件
  searchForm.addEventListener('submit', (e: Event): void => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
    }
  });
}

// 执行搜索
function performSearch(query: string): void {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get('searchEngine', (data: { searchEngine?: SearchEngine }): void => {
      const engine = data.searchEngine || 'baidu';
      const config = searchEngines[engine];
      const searchUrl = config.url + encodeURIComponent(query);
      window.open(searchUrl, '_blank');
    });
  } else {
    // 默认使用百度搜索
    const searchUrl = searchEngines.baidu.url + encodeURIComponent(query);
    window.open(searchUrl, '_blank');
  }
}

// 初始化工作区
function initWorkspaces(): void {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get(['workspaces', 'currentWorkspace'], (data: { workspaces?: Workspaces; currentWorkspace?: string }): void => {
      workspaces = data.workspaces || getDefaultWorkspaces();
      currentWorkspace = data.currentWorkspace || 'default';

      completeWorkspaceInit();
    });
  } else {
    // 如果没有Chrome存储，使用默认工作区
    workspaces = getDefaultWorkspaces();
    currentWorkspace = 'default';
    completeWorkspaceInit();
  }
}

// 完成工作区初始化
async function completeWorkspaceInit(): Promise<void> {
  updateWorkspaceList();
  await initBookmarks();
}

// 获取默认工作区
function getDefaultWorkspaces(): Workspaces {
  return {
    default: {
      id: 'default',
      name: '默认',
      bookmarks: [],
      icon: 'las la-home'
    },
    work: {
      id: 'work',
      name: '工作',
      bookmarks: [],
      icon: 'las la-briefcase'
    },
    study: {
      id: 'study',
      name: '学习',
      bookmarks: [],
      icon: 'las la-book'
    },
    entertainment: {
      id: 'entertainment',
      name: '娱乐',
      bookmarks: [],
      icon: 'las la-gamepad'
    }
  };
}

// 更新工作区列表
function updateWorkspaceList(): void {
  const workspaceList = getElement('workspace-list');
  if (!workspaceList) {
    console.error('workspace-list 元素未找到');
    return;
  }

  workspaceList.innerHTML = '';

  Object.values(workspaces).forEach((workspace: Workspace): void => {
    const workspaceItem = document.createElement('div');
    workspaceItem.className = `workspace-item ${workspace.id === currentWorkspace ? 'active' : ''}`;
    workspaceItem.dataset['workspace'] = workspace.id;

    const icon = document.createElement('div');
    icon.className = 'workspace-icon';

    const iconElement = document.createElement('i');
    iconElement.className = workspace.icon || 'las la-home';
    icon.appendChild(iconElement);

    const name = document.createElement('span');
    name.textContent = workspace.name;

    workspaceItem.appendChild(icon);
    workspaceItem.appendChild(name);

    // 左键点击切换工作区
    workspaceItem.addEventListener('click', (): void => {
      console.log('点击工作区:', workspace.id);
      switchWorkspace(workspace.id);
    });

    // 右键菜单功能
    workspaceItem.addEventListener('contextmenu', (e: MouseEvent): void => {
      e.preventDefault();
      showWorkspaceContextMenu(e, workspace, workspaceItem);
    });

    workspaceList.appendChild(workspaceItem);
  });

  console.log('工作区列表已更新，当前工作区:', currentWorkspace);
}

// 切换工作区
async function switchWorkspace(workspaceId: string): Promise<void> {
  if (!workspaces[workspaceId]) {
    console.error('工作区不存在:', workspaceId);
    return;
  }

  currentWorkspace = workspaceId;

  // 保存当前工作区到存储
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set({ currentWorkspace });
  }

  // 更新UI
  updateWorkspaceList();
  await initBookmarks();
}

// 显示工作区右键菜单
function showWorkspaceContextMenu(e: MouseEvent, workspace: Workspace, workspaceElement: HTMLElement): void {
  // 移除已存在的右键菜单
  const existingMenu = document.querySelector('.workspace-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 创建右键菜单
  const contextMenu = document.createElement('div');
  contextMenu.className = 'workspace-context-menu';
  contextMenu.style.position = 'fixed';
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.style.background = 'white';
  contextMenu.style.border = '1px solid #ddd';
  contextMenu.style.borderRadius = '6px';
  contextMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  contextMenu.style.zIndex = '10000';
  contextMenu.style.minWidth = '120px';
  contextMenu.style.overflow = 'hidden';

  // 修改选项
  const editOption = document.createElement('div');
  editOption.className = 'context-menu-item';
  editOption.textContent = '修改';
  editOption.style.padding = '8px 12px';
  editOption.style.cursor = 'pointer';
  editOption.style.fontSize = '14px';
  editOption.style.borderBottom = '1px solid #eee';
  editOption.addEventListener('mouseenter', (): void => {
    editOption.style.background = '#f5f5f5';
  });
  editOption.addEventListener('mouseleave', (): void => {
    editOption.style.background = 'white';
  });
  editOption.addEventListener('click', (): void => {
    editWorkspace(workspace);
    contextMenu.remove();
  });

  // 删除选项（默认工作区不能删除）
  if (workspace.id !== 'default') {
    const deleteOption = document.createElement('div');
    deleteOption.className = 'context-menu-item';
    deleteOption.textContent = '删除';
    deleteOption.style.padding = '8px 12px';
    deleteOption.style.cursor = 'pointer';
    deleteOption.style.fontSize = '14px';
    deleteOption.style.color = '#dc3545';
    deleteOption.addEventListener('mouseenter', (): void => {
      deleteOption.style.background = '#f5f5f5';
    });
    deleteOption.addEventListener('mouseleave', (): void => {
      deleteOption.style.background = 'white';
    });
    deleteOption.addEventListener('click', (): void => {
      deleteWorkspace(workspace);
      contextMenu.remove();
    });

    contextMenu.appendChild(editOption);
    contextMenu.appendChild(deleteOption);
  } else {
    // 默认工作区只显示修改选项
    contextMenu.appendChild(editOption);
  }

  document.body.appendChild(contextMenu);

  // 点击其他地方关闭菜单
  const closeMenu = (event: MouseEvent): void => {
    if (!contextMenu.contains(event.target as Node)) {
      contextMenu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };

  // 延迟添加点击事件，避免立即触发
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 0);
}

// 编辑工作区
function editWorkspace(workspace: Workspace): void {
  const addWorkspaceModal = getElement('add-workspace-modal');
  const workspaceNameInput = getElement<HTMLInputElement>('workspace-name');

  if (!addWorkspaceModal || !workspaceNameInput) {
    console.error('工作区编辑元素未找到');
    return;
  }

  // 填充当前工作区数据
  workspaceNameInput.value = workspace.name;

  // 选择当前图标
  const iconOptions = document.querySelectorAll('.icon-option');
  iconOptions.forEach((option: Element): void => {
    option.classList.remove('selected');
    const iconOption = option as HTMLElement;
    if (iconOption.dataset['icon'] === workspace.icon) {
      option.classList.add('selected');
    }
  });

  // 标记为编辑模式
  addWorkspaceModal.setAttribute('data-edit-mode', 'true');
  addWorkspaceModal.setAttribute('data-edit-workspace', JSON.stringify(workspace));

  // 更改标题
  const modalTitle = addWorkspaceModal.querySelector('h3');
  if (modalTitle) {
    modalTitle.textContent = '修改工作区';
  }

  // 显示模态框
  addWorkspaceModal.classList.add('active');
}

// 删除工作区
function deleteWorkspace(workspace: Workspace): void {
  if (workspace.id === 'default') {
    alert('默认工作区不能删除');
    return;
  }

  if (!confirm(`确定要删除工作区"${workspace.name}"吗？\n删除后该工作区的所有书签也会被删除。`)) {
    return;
  }

  // 如果删除的是当前工作区，切换到默认工作区
  if (workspace.id === currentWorkspace) {
    currentWorkspace = 'default';
  }

  // 从工作区列表中删除
  delete workspaces[workspace.id];

  // 保存到存储
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set({ workspaces, currentWorkspace }, (): void => {
      console.log('工作区已删除:', workspace.name);
      updateWorkspaceList();
      initBookmarks();
    });
  } else {
    // 本地测试环境
    console.log('工作区已删除:', workspace.name);
    updateWorkspaceList();
    initBookmarks();
  }
}

// 修改initBookmarks函数为异步版本，使用智能图标获取
async function initBookmarks(): Promise<void> {
  const bookmarksContainer = getElement('bookmarks');
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
  const currentWorkspaceData = workspaces[currentWorkspace];
  if (!currentWorkspaceData) {
    console.error('当前工作区不存在:', currentWorkspace);
    return;
  }

  // 获取当前工作区的书签
  if (currentWorkspaceData.bookmarks && currentWorkspaceData.bookmarks.length > 0) {
    const bookmarks = currentWorkspaceData.bookmarks;

    // 渲染书签 - 立即显示，异步获取图标
    for (const bookmark of bookmarks) {
      createBookmarkElementWithLogo(bookmark).then((bookmarkElement) => {
        bookmarksContainer.appendChild(bookmarkElement);
      });
    }
  } else {
    // 如果当前工作区没有书签，显示默认书签（仅限默认工作区）
    if (currentWorkspace === 'default') {
      const defaultBookmarks: Bookmark[] = [
        { title: '百度', url: 'https://www.baidu.com' },
        { title: '微博', url: 'https://weibo.com' },
        { title: '知乎', url: 'https://www.zhihu.com' },
        { title: 'Bilibili', url: 'https://www.bilibili.com' },
        { title: '腾讯视频', url: 'https://v.qq.com' },
        { title: '淘宝', url: 'https://www.taobao.com' }
      ];

      // 保存默认书签到当前工作区
      const workspace = workspaces[currentWorkspace];
      if (workspace) {
        workspace.bookmarks = defaultBookmarks;

        // 保存到存储（如果可用）
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.sync.set({ workspaces });
        }

        // 渲染书签 - 立即显示，异步获取图标
        for (const bookmark of defaultBookmarks) {
          createBookmarkElementWithLogo(bookmark).then((bookmarkElement) => {
            bookmarksContainer.appendChild(bookmarkElement);
          });
        }
      }
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

// 显示书签右键菜单
function showBookmarkContextMenu(e: MouseEvent, bookmark: Bookmark, bookmarkElement: HTMLElement): void {
  // 移除已存在的右键菜单
  const existingMenu = document.querySelector('.bookmark-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 创建右键菜单
  const contextMenu = document.createElement('div');
  contextMenu.className = 'bookmark-context-menu';
  contextMenu.style.position = 'fixed';
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.style.background = 'white';
  contextMenu.style.border = '1px solid #ddd';
  contextMenu.style.borderRadius = '6px';
  contextMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  contextMenu.style.zIndex = '10000';
  contextMenu.style.minWidth = '120px';
  contextMenu.style.overflow = 'hidden';

  // 修改选项
  const editOption = document.createElement('div');
  editOption.className = 'context-menu-item';
  editOption.textContent = '修改';
  editOption.style.padding = '8px 12px';
  editOption.style.cursor = 'pointer';
  editOption.style.fontSize = '14px';
  editOption.style.borderBottom = '1px solid #eee';
  editOption.addEventListener('mouseenter', (): void => {
    editOption.style.background = '#f5f5f5';
  });
  editOption.addEventListener('mouseleave', (): void => {
    editOption.style.background = 'white';
  });
  editOption.addEventListener('click', (): void => {
    editBookmark(bookmark);
    contextMenu.remove();
  });

  // 删除选项
  const deleteOption = document.createElement('div');
  deleteOption.className = 'context-menu-item';
  deleteOption.textContent = '删除';
  deleteOption.style.padding = '8px 12px';
  deleteOption.style.cursor = 'pointer';
  deleteOption.style.fontSize = '14px';
  deleteOption.style.color = '#dc3545';
  deleteOption.addEventListener('mouseenter', (): void => {
    deleteOption.style.background = '#f5f5f5';
  });
  deleteOption.addEventListener('mouseleave', (): void => {
    deleteOption.style.background = 'white';
  });
  deleteOption.addEventListener('click', (): void => {
    deleteBookmark(bookmark, bookmarkElement);
    contextMenu.remove();
  });

  contextMenu.appendChild(editOption);
  contextMenu.appendChild(deleteOption);
  document.body.appendChild(contextMenu);

  // 点击其他地方关闭菜单
  const closeMenu = (event: MouseEvent): void => {
    if (!contextMenu.contains(event.target as Node)) {
      contextMenu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };

  // 延迟添加点击事件，避免立即触发
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 0);
}

// 编辑书签
function editBookmark(bookmark: Bookmark): void {
  const addBookmarkModal = getElement('add-bookmark-modal');
  const titleInput = getElement<HTMLInputElement>('bookmark-title');
  const urlInput = getElement<HTMLInputElement>('bookmark-url');
  const descriptionInput = getElement<HTMLTextAreaElement>('bookmark-description');

  if (!addBookmarkModal || !titleInput || !urlInput) {
    console.error('书签编辑元素未找到');
    return;
  }

  // 填充当前书签数据
  titleInput.value = bookmark.title;
  urlInput.value = bookmark.url;
  if (descriptionInput && bookmark.description) {
    descriptionInput.value = bookmark.description;
  }

  // 标记为编辑模式
  addBookmarkModal.setAttribute('data-edit-mode', 'true');
  addBookmarkModal.setAttribute('data-edit-bookmark', JSON.stringify(bookmark));

  // 显示模态框
  addBookmarkModal.classList.add('active');
}

// 删除书签
function deleteBookmark(bookmark: Bookmark, bookmarkElement: HTMLElement): void {
  if (!confirm(`确定要删除书签"${bookmark.title}"吗？`)) {
    return;
  }

  // 从当前工作区中删除书签
  const currentWorkspaceData = workspaces[currentWorkspace];
  if (currentWorkspaceData && currentWorkspaceData.bookmarks) {
    const bookmarkIndex = currentWorkspaceData.bookmarks.findIndex(
      (b: Bookmark) => b.title === bookmark.title && b.url === bookmark.url
    );

    if (bookmarkIndex !== -1) {
      currentWorkspaceData.bookmarks.splice(bookmarkIndex, 1);

      // 保存到存储
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({ workspaces }, (): void => {
          console.log('书签已删除:', bookmark.title);
        });
      }

      // 从DOM中移除元素
      bookmarkElement.remove();
    }
  }
}

// 简化的图标获取函数 - 只使用favicon
async function getWebsiteFavicon(url: string): Promise<string> {
  const domain = new URL(url).hostname;

  // 定义favicon路径，按优先级排序
  const faviconPaths = [
    // 高分辨率favicon
    `https://${domain}/favicon.ico`,

  ];

  // 尝试加载每个路径
  for (const faviconPath of faviconPaths) {
    try {
      const isValid = await checkImageExists(faviconPath);
      if (isValid) {
        return faviconPath;
      }
    } catch (error) {
      // 继续尝试下一个路径
      continue;
    }
  }

  // 如果所有路径都失败，返回空字符串，将使用文字
  return '';
}

// 检查图片是否存在且可加载
function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // 检查图片尺寸，过小的图片可能是占位符
      if (img.width >= 16 && img.height >= 16) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = url;

    // 设置超时，避免长时间等待
    setTimeout(() => resolve(false), 3000);
  });
}

// 创建书签元素 - 优化版本，先显示文字，异步获取favicon
async function createBookmarkElementWithLogo(bookmark: Bookmark): Promise<HTMLElement> {
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

  // 先显示文字版本
  function showTextIcon(): void {
    iconContainer.innerHTML = '';
    iconContainer.style.background = '#6c757d';
    iconContainer.style.color = 'white';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.fontSize = '1.2rem';
    iconContainer.style.fontWeight = 'bold';
    iconContainer.textContent = bookmark.title.charAt(0).toUpperCase();
  }

  // 显示图标版本
  function showImageIcon(iconUrl: string): void {
    const iconImg = document.createElement('img');
    iconImg.src = iconUrl;
    iconImg.alt = bookmark.title;
    iconImg.style.width = '100%';
    iconImg.style.height = '100%';
    iconImg.style.objectFit = 'contain';
    iconImg.style.backgroundColor = '#f8f9fa';
    iconImg.style.borderRadius = '4px';
    iconImg.onerror = (): void => {
      // 图标加载失败时，回退到文字
      showTextIcon();
    };

    // 清除文字样式，显示图片
    iconContainer.innerHTML = '';
    iconContainer.style.background = '';
    iconContainer.style.color = '';
    iconContainer.style.fontSize = '';
    iconContainer.style.fontWeight = '';
    iconContainer.appendChild(iconImg);
  }

  // 立即显示文字版本
  showTextIcon();

  const titleElement = document.createElement('div');
  titleElement.className = 'bookmark-title';
  titleElement.textContent = bookmark.title;
  titleElement.style.maxWidth = '108px';
  titleElement.style.overflow = 'hidden';
  titleElement.style.textOverflow = 'ellipsis';
  titleElement.style.whiteSpace = 'nowrap';

  bookmarkItem.appendChild(iconContainer);
  bookmarkItem.appendChild(titleElement);

  // 添加右键菜单事件
  bookmarkItem.addEventListener('contextmenu', (e: MouseEvent): void => {
    e.preventDefault();
    showBookmarkContextMenu(e, bookmark, bookmarkItem);
  });

  // 异步获取favicon并替换
  (async (): Promise<void> => {
    try {
      let iconUrl = '';

      // 如果已有图标URL，先验证是否有效
      if (bookmark.icon) {
        const isValid = await checkImageExists(bookmark.icon);
        if (isValid) {
          iconUrl = bookmark.icon;
        }
      }

      // 如果没有有效图标，尝试获取favicon
      if (!iconUrl) {
        iconUrl = await getWebsiteFavicon(bookmark.url);
      }

      // 如果获取到有效图标，替换文字版本
      if (iconUrl) {
        showImageIcon(iconUrl);
      }
    } catch (error) {
      console.warn('获取书签图标失败:', bookmark.title, error);
      // 保持文字版本
    }
  })();

  return bookmarkItem;
}

// 修改原有的createBookmarkElement函数，简化为只使用favicon或文字
function createBookmarkElement(bookmark: Bookmark): HTMLElement {
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

  // 如果有图标URL，使用图片；否则使用文字
  if (bookmark.icon) {
    const iconImg = document.createElement('img');
    iconImg.src = bookmark.icon;
    iconImg.alt = bookmark.title;
    iconImg.style.width = '100%';
    iconImg.style.height = '100%';
    iconImg.style.objectFit = 'contain';
    iconImg.style.backgroundColor = '#f8f9fa';
    iconImg.style.borderRadius = '4px';
    iconImg.onerror = (): void => {
      // 图标加载失败时，使用文字
      iconContainer.innerHTML = '';
      iconContainer.style.background = '#6c757d';
      iconContainer.style.color = 'white';
      iconContainer.style.display = 'flex';
      iconContainer.style.alignItems = 'center';
      iconContainer.style.justifyContent = 'center';
      iconContainer.style.fontSize = '1.2rem';
      iconContainer.style.fontWeight = 'bold';
      iconContainer.textContent = bookmark.title.charAt(0).toUpperCase();
    };
    iconContainer.appendChild(iconImg);
  } else {
    // 使用文字
    iconContainer.style.background = '#6c757d';
    iconContainer.style.color = 'white';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.fontSize = '1.2rem';
    iconContainer.style.fontWeight = 'bold';
    iconContainer.textContent = bookmark.title.charAt(0).toUpperCase();
  }

  const titleElement = document.createElement('div');
  titleElement.className = 'bookmark-title';
  titleElement.textContent = bookmark.title;
  titleElement.style.maxWidth = '108px';
  titleElement.style.overflow = 'hidden';
  titleElement.style.textOverflow = 'ellipsis';
  titleElement.style.whiteSpace = 'nowrap';

  bookmarkItem.appendChild(iconContainer);
  bookmarkItem.appendChild(titleElement);

  // 添加右键菜单事件
  bookmarkItem.addEventListener('contextmenu', (e: MouseEvent): void => {
    e.preventDefault();
    showBookmarkContextMenu(e, bookmark, bookmarkItem);
  });

  return bookmarkItem;
}

// 创建添加书签按钮
function createAddBookmarkButton(): HTMLElement {
  const addBookmarkItem = document.createElement('div');
  addBookmarkItem.className = 'add-bookmark-item';
  addBookmarkItem.id = 'add-bookmark';

  const iconContainer = document.createElement('div');
  iconContainer.className = 'add-bookmark-icon';
  iconContainer.textContent = '+';

  const titleElement = document.createElement('div');
  titleElement.className = 'add-bookmark-title';
  titleElement.textContent = '添加链接';
  titleElement.style.maxWidth = '108px';
  titleElement.style.overflow = 'hidden';
  titleElement.style.textOverflow = 'ellipsis';
  titleElement.style.whiteSpace = 'nowrap';

  addBookmarkItem.appendChild(iconContainer);
  addBookmarkItem.appendChild(titleElement);

  // 添加点击事件
  addBookmarkItem.addEventListener('click', (): void => {
    const addBookmarkModal = getElement('add-bookmark-modal');
    if (addBookmarkModal) {
      addBookmarkModal.classList.add('active');
    }
  });

  return addBookmarkItem;
}

// 初始化侧边栏
function initSidebar(): void {
  // 侧边栏相关功能实现
  console.log('侧边栏初始化');
}

// 初始化模态框
function initModals(): void {
  const addWorkspaceBtn = getElement('add-workspace');
  const addWorkspaceModal = getElement('add-workspace-modal');
  const addWorkspaceForm = getElement<HTMLFormElement>('add-workspace-form');
  const cancelWorkspaceBtn = getElement('cancel-workspace');

  // 书签相关元素
  const addBookmarkModal = getElement('add-bookmark-modal');
  const addBookmarkForm = getElement<HTMLFormElement>('add-bookmark-form');
  const cancelBookmarkBtn = getElement('cancel-bookmark');

  // 添加工作区按钮点击事件
  if (addWorkspaceBtn && addWorkspaceModal) {
    addWorkspaceBtn.addEventListener('click', (): void => {
      console.log('点击添加工作区按钮');
      addWorkspaceModal.classList.add('active');
    });
  }

  // 取消添加工作区按钮
  if (cancelWorkspaceBtn && addWorkspaceModal && addWorkspaceForm) {
    cancelWorkspaceBtn.addEventListener('click', (): void => {
      addWorkspaceModal.classList.remove('active');
      addWorkspaceForm.reset();
      clearIconSelection();
      // 清除编辑模式标记
      addWorkspaceModal.removeAttribute('data-edit-mode');
      addWorkspaceModal.removeAttribute('data-edit-workspace');
      // 恢复标题
      const modalTitle = addWorkspaceModal.querySelector('h3');
      if (modalTitle) {
        modalTitle.textContent = '添加新工作区';
      }
    });
  }

  // 点击模态框外部关闭
  if (addWorkspaceModal && addWorkspaceForm) {
    addWorkspaceModal.addEventListener('click', (e: Event): void => {
      if (e.target === addWorkspaceModal) {
        addWorkspaceModal.classList.remove('active');
        addWorkspaceForm.reset();
        clearIconSelection();
        // 清除编辑模式标记
        addWorkspaceModal.removeAttribute('data-edit-mode');
        addWorkspaceModal.removeAttribute('data-edit-workspace');
        // 恢复标题
        const modalTitle = addWorkspaceModal.querySelector('h3');
        if (modalTitle) {
          modalTitle.textContent = '添加新工作区';
        }
      }
    });
  }

  // 图标选择功能
  const iconOptions = document.querySelectorAll('.icon-option');
  iconOptions.forEach((option: Element): void => {
    option.addEventListener('click', (): void => {
      iconOptions.forEach((opt: Element): void => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
  });

  // 添加工作区表单提交
  if (addWorkspaceForm) {
    addWorkspaceForm.addEventListener('submit', (e: Event): void => {
      e.preventDefault();

      const workspaceNameInput = getElement<HTMLInputElement>('workspace-name');
      const selectedIcon = document.querySelector('.icon-option.selected') as HTMLElement;

      if (!workspaceNameInput || !selectedIcon || !addWorkspaceModal) {
        alert('请填写工作区名称并选择图标');
        return;
      }

      const workspaceName = workspaceNameInput.value.trim();

      if (!workspaceName) {
        alert('请填写工作区名称');
        return;
      }

      const workspaceIcon = selectedIcon.dataset['icon'] || '📁';

      // 检查是否为编辑模式
      const isEditMode = addWorkspaceModal.getAttribute('data-edit-mode') === 'true';
      const editWorkspaceData = addWorkspaceModal.getAttribute('data-edit-workspace');

      if (isEditMode && editWorkspaceData) {
        // 编辑模式：更新现有工作区
        try {
          const originalWorkspace: Workspace = JSON.parse(editWorkspaceData);

          if (workspaces[originalWorkspace.id]) {
            // 更新工作区数据
            const workspace = workspaces[originalWorkspace.id];
            if (workspace) {
              workspace.name = workspaceName;
              workspace.icon = workspaceIcon;
            }

            console.log('工作区已更新:', workspaceName);
          } else {
            alert('找不到要编辑的工作区');
            return;
          }
        } catch (error) {
          console.error('解析编辑工作区数据失败:', error);
          alert('编辑工作区数据错误');
          return;
        }
      } else {
        // 添加模式：创建新工作区
        const workspaceId = 'workspace_' + Date.now();

        workspaces[workspaceId] = {
          id: workspaceId,
          name: workspaceName,
          icon: workspaceIcon,
          bookmarks: []
        };

        console.log('新工作区已添加:', workspaceName);
      }

      // 保存到存储
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({ workspaces }, (): void => {
          updateWorkspaceList();
          addWorkspaceModal.classList.remove('active');
          addWorkspaceForm.reset();
          clearIconSelection();
          // 清除编辑模式标记
          addWorkspaceModal.removeAttribute('data-edit-mode');
          addWorkspaceModal.removeAttribute('data-edit-workspace');
          // 恢复标题
          const modalTitle = addWorkspaceModal.querySelector('h3');
          if (modalTitle) {
            modalTitle.textContent = '添加新工作区';
          }
        });
      } else {
        // 本地测试环境
        updateWorkspaceList();
        addWorkspaceModal.classList.remove('active');
        addWorkspaceForm.reset();
        clearIconSelection();
        // 清除编辑模式标记
        addWorkspaceModal.removeAttribute('data-edit-mode');
        addWorkspaceModal.removeAttribute('data-edit-workspace');
        // 恢复标题
        const modalTitle = addWorkspaceModal.querySelector('h3');
        if (modalTitle) {
          modalTitle.textContent = '添加新工作区';
        }
      }
    });
  }

  // 书签模态框功能
  if (cancelBookmarkBtn && addBookmarkModal && addBookmarkForm) {
    cancelBookmarkBtn.addEventListener('click', (): void => {
      addBookmarkModal.classList.remove('active');
      addBookmarkForm.reset();
      // 清除编辑模式标记
      addBookmarkModal.removeAttribute('data-edit-mode');
      addBookmarkModal.removeAttribute('data-edit-bookmark');
    });
  }

  // 点击书签模态框外部关闭
  if (addBookmarkModal && addBookmarkForm) {
    addBookmarkModal.addEventListener('click', (e: Event): void => {
      if (e.target === addBookmarkModal) {
        addBookmarkModal.classList.remove('active');
        addBookmarkForm.reset();
        // 清除编辑模式标记
        addBookmarkModal.removeAttribute('data-edit-mode');
        addBookmarkModal.removeAttribute('data-edit-bookmark');
      }
    });
  }

  // 添加书签表单提交
  if (addBookmarkForm) {
    addBookmarkForm.addEventListener('submit', (e: Event): void => {
      e.preventDefault();

      const titleInput = getElement<HTMLInputElement>('bookmark-title');
      const urlInput = getElement<HTMLInputElement>('bookmark-url');
      const descriptionInput = getElement<HTMLTextAreaElement>('bookmark-description');

      if (!titleInput || !urlInput || !addBookmarkModal) {
        alert('请填写完整的书签信息');
        return;
      }

      const title = titleInput.value.trim();
      const url = urlInput.value.trim();
      const description = descriptionInput?.value.trim() || '';

      if (!title || !url) {
        alert('请填写书签标题和URL');
        return;
      }

      // 检查是否为编辑模式
      const isEditMode = addBookmarkModal.getAttribute('data-edit-mode') === 'true';
      const editBookmarkData = addBookmarkModal.getAttribute('data-edit-bookmark');

      const currentWorkspaceData = workspaces[currentWorkspace];
      if (!currentWorkspaceData) {
        alert('当前工作区不存在');
        return;
      }

      if (isEditMode && editBookmarkData) {
        // 编辑模式：更新现有书签
        try {
          const originalBookmark: Bookmark = JSON.parse(editBookmarkData);
          const bookmarkIndex = currentWorkspaceData.bookmarks.findIndex(
            (b: Bookmark) => b.title === originalBookmark.title && b.url === originalBookmark.url
          );

          if (bookmarkIndex !== -1) {
            // 更新书签数据
            currentWorkspaceData.bookmarks[bookmarkIndex] = {
              title,
              url,
              ...(description && { description })
            };

            console.log('书签已更新:', title);
          } else {
            alert('找不到要编辑的书签');
            return;
          }
        } catch (error) {
          console.error('解析编辑书签数据失败:', error);
          alert('编辑书签数据错误');
          return;
        }
      } else {
        // 添加模式：创建新书签
        const newBookmark: Bookmark = {
          title,
          url,
          ...(description && { description })
        };

        currentWorkspaceData.bookmarks.push(newBookmark);
        console.log('新书签已添加:', title);
      }

      // 保存到存储
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({ workspaces }, async (): Promise<void> => {
          await initBookmarks();
          addBookmarkModal.classList.remove('active');
          addBookmarkForm.reset();
          // 清除编辑模式标记
          addBookmarkModal.removeAttribute('data-edit-mode');
          addBookmarkModal.removeAttribute('data-edit-bookmark');
        });
      } else {
        // 本地测试环境
        (async (): Promise<void> => {
          await initBookmarks();
          addBookmarkModal.classList.remove('active');
          addBookmarkForm.reset();
          // 清除编辑模式标记
          addBookmarkModal.removeAttribute('data-edit-mode');
          addBookmarkModal.removeAttribute('data-edit-bookmark');
        })();
      }
    });
  }

  // 设置界面相关元素
  const settingsBtn = getElement('settings-btn');
  const settingsModal = getElement('settings-modal');
  const cancelSettingsBtn = getElement('cancel-settings');
  const saveSettingsBtn = getElement('save-settings');
  const resetSettingsBtn = getElement('reset-settings');
  const closeSettingsBtn = getElement('close-settings');

  // 设置按钮点击事件
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', (): void => {
      console.log('点击设置按钮');
      loadSettingsData();
      settingsModal.classList.add('active');
    });
  }

  // 关闭设置按钮
  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener('click', (): void => {
      settingsModal.classList.remove('active');
    });
  }

  // 取消设置按钮
  if (cancelSettingsBtn && settingsModal) {
    cancelSettingsBtn.addEventListener('click', (): void => {
      settingsModal.classList.remove('active');
    });
  }

  // 点击设置模态框外部关闭
  if (settingsModal) {
    settingsModal.addEventListener('click', (e: Event): void => {
      if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
      }
    });
  }

  // 阻止模态框内容的点击事件冒泡
  const settingsModalContent = settingsModal?.querySelector('.settings-modal-content');
  if (settingsModalContent) {
    settingsModalContent.addEventListener('click', (e: Event): void => {
      e.stopPropagation();
    });
  }

  // 标签页切换功能
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach((btn: Element): void => {
    btn.addEventListener('click', (): void => {
      const tabBtn = btn as HTMLElement;
      const targetTab = tabBtn.dataset['tab'];

      if (!targetTab) return;

      // 移除所有活动状态
      tabBtns.forEach((b: Element): void => b.classList.remove('active'));
      tabContents.forEach((c: Element): void => c.classList.remove('active'));

      // 激活当前标签
      tabBtn.classList.add('active');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // 保存设置按钮
  if (saveSettingsBtn && settingsModal) {
    saveSettingsBtn.addEventListener('click', (): void => {
      saveSettingsData();
      settingsModal.classList.remove('active');
    });
  }

  // 重置设置按钮
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', (): void => {
      if (confirm('确定要重置所有设置吗？这将恢复默认设置。')) {
        resetSettingsData();
      }
    });
  }

  // 配置管理相关元素
  const exportConfigBtn = getElement('export-config');
  const importConfigBtn = getElement('import-config');
  const importFileInput = getElement<HTMLInputElement>('import-file');

  // 导出配置按钮
  if (exportConfigBtn) {
    exportConfigBtn.addEventListener('click', (): void => {
      exportConfiguration();
    });
  }

  // 导入配置按钮
  if (importConfigBtn && importFileInput) {
    importConfigBtn.addEventListener('click', (): void => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e: Event): void => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        importConfiguration(file);
        target.value = ''; // 清空文件选择
      }
    });
  }

  console.log('模态框初始化完成');
}

// 初始化底边栏图标
function initBottomBarIcons(): void {
  console.log('底边栏图标初始化');

  // 定义底边栏快速链接
  const quickLinks = [
    { title: '百度', url: 'https://www.baidu.com', emoji: '🔍' },
    { title: '微博', url: 'https://weibo.com', emoji: '📱' },
    { title: '知乎', url: 'https://www.zhihu.com', emoji: '💭' },
    { title: 'Bilibili', url: 'https://www.bilibili.com', emoji: '📺' },
    { title: 'GitHub', url: 'https://github.com', emoji: '💻' },
    { title: '淘宝', url: 'https://www.taobao.com', emoji: '🛒' },
    { title: '网易云音乐', url: 'https://music.163.com', emoji: '🎵' },
    { title: 'QQ邮箱', url: 'https://mail.qq.com', emoji: '📧' }
  ];

  const fixedLinksContainer = document.querySelector('.fixed-links');
  if (!fixedLinksContainer) {
    console.error('固定链接容器未找到');
    return;
  }

  // 清空现有内容
  fixedLinksContainer.innerHTML = '';

  // 为每个快速链接创建元素
  for (const link of quickLinks) {
    createQuickLinkElement(link).then((linkElement) => {
      fixedLinksContainer.appendChild(linkElement);
    });
  }
}

// 创建快速链接元素 - 优化版本，先显示文字，异步获取favicon
async function createQuickLinkElement(link: { title: string; url: string; emoji: string }): Promise<HTMLElement> {
  const linkElement = document.createElement('a');
  linkElement.href = link.url;
  linkElement.className = 'fixed-link';
  linkElement.title = link.title;
  linkElement.setAttribute('data-emoji', link.emoji);

  // 先显示文字版本
  function showTextIcon(): void {
    linkElement.innerHTML = '';
    linkElement.textContent = link.title.charAt(0).toUpperCase();
    linkElement.style.fontSize = '1.8rem';
    linkElement.style.color = 'white';
    linkElement.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    linkElement.style.display = 'flex';
    linkElement.style.alignItems = 'center';
    linkElement.style.justifyContent = 'center';
    linkElement.style.fontWeight = 'bold';
  }

  // 显示图标版本
  function showImageIcon(faviconUrl: string): void {
    const img = document.createElement('img');
    img.src = faviconUrl;
    img.alt = link.title;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    img.style.borderRadius = '50%';
    img.style.padding = '2px';

    // 图片加载失败时回退到文字
    img.onerror = (): void => {
      showTextIcon();
    };

    // 清除文字样式，显示图片
    linkElement.innerHTML = '';
    linkElement.style.fontSize = '';
    linkElement.style.color = '';
    linkElement.style.textShadow = '';
    linkElement.style.fontWeight = '';
    linkElement.appendChild(img);
  }

  // 立即显示文字版本
  showTextIcon();

  // 异步获取favicon并替换
  (async (): Promise<void> => {
    try {
      const faviconUrl = await getWebsiteFavicon(link.url);

      // 如果获取到有效图标，替换文字版本
      if (faviconUrl) {
        showImageIcon(faviconUrl);
      }
    } catch (error) {
      console.warn('获取快速链接图标失败:', link.title, error);
      // 保持文字版本
    }
  })();

  return linkElement;
}

// 初始化动漫背景
function initAnimeBackground(): void {
  let currentBackgroundIndex = 0;
  let backgroundChangeInterval: number;

  // 获取背景元素
  const bg1 = getElement('anime-bg-1');
  const bg2 = getElement('anime-bg-2');
  const bgSwitchBtn = getElement('bg-switch-btn');

  if (!bg1 || !bg2) {
    console.error('背景元素未找到');
    return;
  }

  // 从存储中加载当前背景索引和自动切换设置
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get(['currentBackgroundIndex', 'autoChangeBackground'], (data: { currentBackgroundIndex?: number; autoChangeBackground?: boolean }): void => {
      currentBackgroundIndex = data.currentBackgroundIndex || 0;
      const autoChange = data.autoChangeBackground !== false; // 默认开启自动切换

      // 设置初始背景
      setBackground(currentBackgroundIndex);

      // 如果开启自动切换，启动定时器
      if (autoChange) {
        startAutoChange();
      }
    });
  } else {
    // 本地测试环境
    setBackground(0);
    startAutoChange();
  }

  // 背景切换按钮点击事件
  if (bgSwitchBtn) {
    bgSwitchBtn.addEventListener('click', (): void => {
      switchToNextBackground();
    });
  }

  // 设置背景图片
  function setBackground(index: number): void {
    if (index >= 0 && index < animeBackgrounds.length) {
      const background = animeBackgrounds[index];

      if (!background) {
        console.error('背景数据不存在，索引:', index);
        return;
      }

      // 预加载图片
      const img = new Image();
      img.onload = (): void => {
        // 图片加载完成后设置背景
        if (bg1 && bg2) {
          const activeBg = bg1.style.opacity === '0' ? bg1 : bg2;
          const inactiveBg = activeBg === bg1 ? bg2 : bg1;

          // 设置新背景
          activeBg.style.backgroundImage = `url(${background.url})`;
          activeBg.style.opacity = '1';

          // 淡出旧背景
          inactiveBg.style.opacity = '0';
        }

        console.log('背景已切换到:', background.name);
      };

      img.onerror = (): void => {
        console.error('背景图片加载失败:', background.url);
        // 如果图片加载失败，尝试下一张
        switchToNextBackground();
      };

      img.src = background.url;
    }
  }

  // 切换到下一张背景
  function switchToNextBackground(): void {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % animeBackgrounds.length;
    setBackground(currentBackgroundIndex);

    // 保存当前背景索引
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ currentBackgroundIndex });
    }

    // 重置自动切换定时器
    if (backgroundChangeInterval) {
      clearInterval(backgroundChangeInterval);
      startAutoChange();
    }
  }

  // 开始自动切换
  function startAutoChange(): void {
    // 每30秒自动切换背景
    backgroundChangeInterval = window.setInterval((): void => {
      switchToNextBackground();
    }, 30000);
  }

  // 停止自动切换
  function stopAutoChange(): void {
    if (backgroundChangeInterval) {
      clearInterval(backgroundChangeInterval);
    }
  }

  // 页面失去焦点时停止自动切换，获得焦点时恢复
  document.addEventListener('visibilitychange', (): void => {
    if (document.hidden) {
      stopAutoChange();
    } else {
      startAutoChange();
    }
  });

  console.log('动漫背景初始化完成，共', animeBackgrounds.length, '张背景图片');
}

// 设置相关接口
interface AppSettings {
  autoChangeBackground: boolean;
  backgroundInterval: number;
  showClock: boolean;
  showDate: boolean;
  searchEngine: SearchEngine;
  searchSuggestions: boolean;
  openInNewTab: boolean;
}

// 加载设置数据
function loadSettingsData(): void {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get([
      'autoChangeBackground',
      'backgroundInterval',
      'showClock',
      'showDate',
      'searchEngine',
      'searchSuggestions',
      'openInNewTab'
    ], (data: Partial<AppSettings>): void => {
      // 常规设置
      const autoChangeCheckbox = getElement<HTMLInputElement>('auto-change-background');
      if (autoChangeCheckbox) {
        autoChangeCheckbox.checked = data.autoChangeBackground !== false;
      }

      const backgroundIntervalInput = getElement<HTMLInputElement>('background-interval');
      if (backgroundIntervalInput) {
        backgroundIntervalInput.value = String(data.backgroundInterval || 30);
      }

      const showClockCheckbox = getElement<HTMLInputElement>('show-clock');
      if (showClockCheckbox) {
        showClockCheckbox.checked = data.showClock !== false;
      }

      const showDateCheckbox = getElement<HTMLInputElement>('show-date');
      if (showDateCheckbox) {
        showDateCheckbox.checked = data.showDate !== false;
      }

      // 搜索设置
      const searchEngine = data.searchEngine || 'baidu';
      const searchEngineRadios = document.querySelectorAll<HTMLInputElement>('input[name="search-engine"]');
      searchEngineRadios.forEach((radio: HTMLInputElement): void => {
        radio.checked = radio.value === searchEngine;
      });

      const searchSuggestionsCheckbox = getElement<HTMLInputElement>('search-suggestions');
      if (searchSuggestionsCheckbox) {
        searchSuggestionsCheckbox.checked = data.searchSuggestions !== false;
      }

      const openInNewTabCheckbox = getElement<HTMLInputElement>('open-in-new-tab');
      if (openInNewTabCheckbox) {
        openInNewTabCheckbox.checked = data.openInNewTab !== false;
      }

    });
  } else {
    // 本地测试环境，使用默认值
    console.log('本地测试环境，使用默认设置');
  }
}

// 保存设置数据
function saveSettingsData(): void {
  // 收集所有设置数据
  const autoChangeCheckbox = getElement<HTMLInputElement>('auto-change-background');
  const backgroundIntervalInput = getElement<HTMLInputElement>('background-interval');
  const showClockCheckbox = getElement<HTMLInputElement>('show-clock');
  const showDateCheckbox = getElement<HTMLInputElement>('show-date');
  const searchSuggestionsCheckbox = getElement<HTMLInputElement>('search-suggestions');
  const openInNewTabCheckbox = getElement<HTMLInputElement>('open-in-new-tab');

  // 获取选中的搜索引擎
  const selectedSearchEngine = document.querySelector<HTMLInputElement>('input[name="search-engine"]:checked');
  const searchEngine = selectedSearchEngine?.value || 'baidu';

  const settings: Partial<AppSettings> = {
    autoChangeBackground: autoChangeCheckbox?.checked !== false,
    backgroundInterval: parseInt(backgroundIntervalInput?.value || '30'),
    showClock: showClockCheckbox?.checked !== false,
    showDate: showDateCheckbox?.checked !== false,
    searchEngine: searchEngine as SearchEngine,
    searchSuggestions: searchSuggestionsCheckbox?.checked !== false,
    openInNewTab: openInNewTabCheckbox?.checked !== false
  };

  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set(settings, (): void => {
      console.log('设置已保存:', settings);
      alert('设置已保存！');

      // 应用一些立即生效的设置
      applySettings(settings);
    });
  } else {
    // 本地测试环境
    console.log('本地测试环境，设置已保存:', settings);
    alert('设置已保存！');
    applySettings(settings);
  }
}

// 重置设置数据
function resetSettingsData(): void {
  const defaultSettings: AppSettings = {
    autoChangeBackground: true,
    backgroundInterval: 30,
    showClock: true,
    showDate: true,
    searchEngine: 'baidu',
    searchSuggestions: true,
    openInNewTab: true
  };

  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set(defaultSettings, (): void => {
      console.log('设置已重置为默认值');
      alert('设置已重置为默认值！');

      // 重新加载设置界面
      loadSettingsData();

      // 应用默认设置
      applySettings(defaultSettings);
    });
  } else {
    // 本地测试环境
    console.log('本地测试环境，设置已重置为默认值');
    alert('设置已重置为默认值！');
    loadSettingsData();
    applySettings(defaultSettings);
  }
}

// 应用设置（立即生效的设置）
function applySettings(settings: Partial<AppSettings>): void {
  // 应用时钟显示设置
  const clockElement = getElement('clock');
  const dateElement = getElement('date');

  if (clockElement) {
    clockElement.style.display = settings.showClock === false ? 'none' : 'block';
  }

  if (dateElement) {
    dateElement.style.display = settings.showDate === false ? 'none' : 'block';
  }

  // 应用搜索引擎设置
  if (settings.searchEngine) {
    const searchInput = getElement<HTMLInputElement>('search-input');
    if (searchInput) {
      const config = searchEngines[settings.searchEngine];
      searchInput.placeholder = config.placeholder;
    }
  }

  console.log('设置已应用:', settings);
}

// 导出配置
function exportConfiguration(): void {
  try {
    // 收集当前配置数据
    const configData: ConfigData = {
      workspaces: workspaces,
      currentWorkspace: currentWorkspace,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    };

    // 如果有Chrome存储，也导出设置
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get([
        'autoChangeBackground',
        'backgroundInterval',
        'showClock',
        'showDate',
        'theme',
        'searchEngine',
        'searchSuggestions',
        'openInNewTab'
      ], (settings: Partial<AppSettings>): void => {
        configData.settings = settings;
        downloadConfigFile(configData);
      });
    } else {
      downloadConfigFile(configData);
    }
  } catch (error) {
    console.error('导出配置失败:', error);
    alert('导出配置失败，请重试。');
  }
}

// 下载配置文件
function downloadConfigFile(configData: ConfigData): void {
  const jsonString = JSON.stringify(configData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `mytab-config-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('配置已导出');
  alert('配置导出成功！');
}

// 导入配置
function importConfiguration(file: File): void {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>): void => {
    try {
      const content = e.target?.result as string;
      const configData: ConfigData = JSON.parse(content);

      // 验证配置数据格式
      if (!validateConfigData(configData)) {
        alert('配置文件格式不正确，请选择有效的配置文件。');
        return;
      }

      // 获取导入模式
      const importMode = getSelectedImportMode();

      // 确认导入
      const confirmMessage = importMode === 'replace'
        ? '确定要覆盖当前配置吗？这将删除所有现有的工作区和书签。'
        : '确定要合并配置吗？重复的书签将被自动去除。';

      if (!confirm(confirmMessage)) {
        return;
      }

      // 执行导入
      if (importMode === 'replace') {
        replaceConfiguration(configData);
      } else {
        mergeConfiguration(configData);
      }

    } catch (error) {
      console.error('导入配置失败:', error);
      alert('配置文件解析失败，请检查文件格式。');
    }
  };

  reader.readAsText(file);
}

// 验证配置数据格式
function validateConfigData(data: any): data is ConfigData {
  return (
    data &&
    typeof data === 'object' &&
    data.workspaces &&
    typeof data.workspaces === 'object' &&
    typeof data.currentWorkspace === 'string' &&
    typeof data.version === 'string'
  );
}

// 获取选中的导入模式
function getSelectedImportMode(): 'replace' | 'merge' {
  const selectedMode = document.querySelector<HTMLInputElement>('input[name="import-mode"]:checked');
  return selectedMode?.value as 'replace' | 'merge' || 'replace';
}

// 覆盖配置
function replaceConfiguration(configData: ConfigData): void {
  // 直接替换工作区数据
  workspaces = configData.workspaces;
  currentWorkspace = configData.currentWorkspace;

  // 确保当前工作区存在
  if (!workspaces[currentWorkspace]) {
    currentWorkspace = Object.keys(workspaces)[0] || 'default';
  }

  // 保存到存储
  saveConfigurationToStorage(configData, (): void => {
    // 更新UI
    updateWorkspaceList();
    initBookmarks();

    alert('配置导入成功！页面将刷新以应用新配置。');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}

// 合并配置
function mergeConfiguration(configData: ConfigData): void {
  // 合并工作区
  Object.keys(configData.workspaces).forEach((workspaceId: string): void => {
    const importedWorkspace = configData.workspaces[workspaceId];

    // 检查导入的工作区是否存在
    if (!importedWorkspace) {
      return;
    }

    if (workspaces[workspaceId]) {
      // 工作区已存在，合并书签
      const existingBookmarks = workspaces[workspaceId].bookmarks;
      const importedBookmarks = importedWorkspace.bookmarks;

      // 去重合并书签（基于URL）
      const mergedBookmarks = [...existingBookmarks];
      const existingUrls = new Set(existingBookmarks.map(b => b.url));

      importedBookmarks.forEach((bookmark: Bookmark): void => {
        if (!existingUrls.has(bookmark.url)) {
          mergedBookmarks.push(bookmark);
        }
      });

      workspaces[workspaceId].bookmarks = mergedBookmarks;
    } else {
      // 工作区不存在，直接添加
      workspaces[workspaceId] = { ...importedWorkspace };
    }
  });

  // 保存到存储
  saveConfigurationToStorage(configData, (): void => {
    // 更新UI
    updateWorkspaceList();
    initBookmarks();

    alert('配置合并成功！');
  });
}

// 保存配置到存储
function saveConfigurationToStorage(configData: ConfigData, callback: () => void): void {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const dataToSave: any = {
      workspaces: workspaces,
      currentWorkspace: currentWorkspace
    };

    // 如果有设置数据，也保存设置
    if (configData.settings) {
      Object.assign(dataToSave, configData.settings);
    }

    chrome.storage.sync.set(dataToSave, callback);
  } else {
    // 本地测试环境
    console.log('本地测试环境，配置已保存');
    callback();
  }
}

// GitHub同步功能
let currentSyncStatus: SyncStatus = 'idle';

// 初始化GitHub同步功能
function initGitHubSync(): void {
  const syncEnabledEl = getElement<HTMLInputElement>('github-sync-enabled');
  const testConnectionBtn = getElement<HTMLButtonElement>('test-connection');
  const syncNowBtn = getElement<HTMLButtonElement>('sync-now');

  if (syncEnabledEl) {
    syncEnabledEl.addEventListener('change', toggleGitHubSync);
    loadGitHubSyncSettings();
  }

  if (testConnectionBtn) {
    testConnectionBtn.addEventListener('click', testGitHubConnection);
  }

  if (syncNowBtn) {
    syncNowBtn.addEventListener('click', syncNow);
  }
}

// 切换GitHub同步开关
function toggleGitHubSync(): void {
  const syncEnabledEl = getElement<HTMLInputElement>('github-sync-enabled');
  const syncConfigEl = getElement<HTMLElement>('github-sync-config');

  if (!syncEnabledEl || !syncConfigEl) return;

  const syncEnabled = syncEnabledEl.checked;

  if (syncEnabled) {
    syncConfigEl.style.display = 'block';
    loadGitHubSyncSettings();
  } else {
    syncConfigEl.style.display = 'none';
    // 保存禁用状态
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({
        githubSync: { enabled: false }
      });
    }
  }
}

// 加载GitHub同步设置
function loadGitHubSyncSettings(): void {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get(['githubSync'], (data: any) => {
      const syncConfig = data.githubSync;
      if (syncConfig) {
        const syncEnabledEl = getElement<HTMLInputElement>('github-sync-enabled');
        const githubTokenEl = getElement<HTMLInputElement>('github-token');
        const syncConfigEl = getElement<HTMLElement>('github-sync-config');

        if (syncEnabledEl) syncEnabledEl.checked = syncConfig.enabled;
        if (githubTokenEl) githubTokenEl.value = syncConfig.token || '';

        if (syncConfig.enabled && syncConfigEl) {
          syncConfigEl.style.display = 'block';
          updateSyncStatus('idle', '已启用GitHub同步');
        } else if (syncConfigEl) {
          syncConfigEl.style.display = 'none';
        }
      }
    });
  }
}

// 测试GitHub连接
async function testGitHubConnection(): Promise<void> {
  const tokenInput = getElement<HTMLInputElement>('github-token');
  if (!tokenInput) return;

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
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({
        githubSync: { token, enabled: true }
      });
    }

  } catch (error: any) {
    updateSyncStatus('error', `连接失败: ${error.message}`);
  }
}

// 立即同步
async function syncNow(): Promise<void> {
  const tokenInput = getElement<HTMLInputElement>('github-token');
  if (!tokenInput) return;

  const token = tokenInput.value.trim();

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

    if (!gistId) {
      updateSyncStatus('error', '创建gist失败');
      return;
    }


    // 同步数据
    await syncWithGist(token, gistId, localData);


    updateSyncStatus('success', '同步完成');

  } catch (error: any) {
    updateSyncStatus('error', `同步失败: ${error.message}`);
  }
}

// 获取当前设置
async function getCurrentSettings(): Promise<SyncData> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['bookmarks', 'searchEngine', 'workspaces', 'currentWorkspace'], (data: any) => {
        resolve({
          bookmarks: data.bookmarks || [],
          searchEngine: data.searchEngine || 'baidu',
          workspaces: data.workspaces || workspaces,
          currentWorkspace: data.currentWorkspace || currentWorkspace,
          lastSync: new Date().toISOString()
        });
      });
    } else {
      // 本地测试环境
      resolve({
        bookmarks: [],
        searchEngine: 'baidu',
        workspaces: workspaces,
        currentWorkspace: currentWorkspace,
        lastSync: new Date().toISOString()
      });
    }
  });
}

// 获取或创建gist
async function getOrCreateGist(token: string): Promise<string | null> {
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

  return createResponse.data.id || null;
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
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set({
      bookmarks: mergedData.bookmarks,
      searchEngine: mergedData.searchEngine,
      workspaces: mergedData.workspaces,
      currentWorkspace: mergedData.currentWorkspace,
      githubSync: {
        token,
        enabled: true,
        gistId
      }
    });
  }

  // 更新全局变量
  workspaces = mergedData.workspaces;
  currentWorkspace = mergedData.currentWorkspace;

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
  await completeWorkspaceInit();
  await initBookmarks();
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
  const statusElement = getElement<HTMLElement>('sync-status-text');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `sync-status-${status}`;
  }

  // 更新按钮状态
  const testButton = getElement<HTMLButtonElement>('test-connection');
  const syncButton = getElement<HTMLButtonElement>('sync-now');

  if (status === 'syncing') {
    if (testButton) testButton.disabled = true;
    if (syncButton) syncButton.disabled = true;
  } else {
    if (testButton) testButton.disabled = false;
    if (syncButton) syncButton.disabled = false;
  }
}

// 更新最后同步时间
function updateLastSyncTime(): void {
  const lastSyncElement = getElement<HTMLElement>('last-sync-time');
  if (lastSyncElement) {
    const now = new Date();
    lastSyncElement.textContent = `最后同步: ${now.toLocaleString('zh-CN')}`;
  }
}

// Line Awesome 图标数据接口
interface IconData {
  // name: string;
  class: string;
  // category: string;
  // keywords: string[];
}

// 图标选择器数据接口
interface IconSelectorData {
  metadata: {
    source: string;
    totalIcons: number;
    generatedAt: string;
    description: string;
  };
  categories: Record<string, IconData[]>;
  allIcons: IconData[];
}

// 图标数据变量
let iconCategories: Record<string, IconData[]> = {};
let allIcons: IconData[] = [];
let iconDataLoaded = false;

// 加载图标数据
async function loadIconData(): Promise<void> {
  if (iconDataLoaded) {
    return;
  }

  try {
    console.log('开始加载图标数据...');

    const jsonUrl = chrome.runtime.getURL('icon-selector-data.json');
    const response = await fetch(jsonUrl);
    if (response.ok) {
      const iconSelectorData: IconSelectorData = await response.json();

      iconCategories = iconSelectorData.categories;
      allIcons = iconSelectorData.allIcons;
      iconDataLoaded = true;

      console.log(`✅ 成功加载图标数据: ${iconSelectorData.metadata.totalIcons} 个图标`);

    } else {
      console.warn('⚠️ 无法加载图标数据文件，使用默认图标');
    }
  } catch (error) {
    console.error('❌ 加载图标数据失败:', error);
  }
}

// 简化的图标选择器初始化函数
async function initSimpleIconSelector(): Promise<void> {
  const iconSelector = getElement('icon-selector');

  if (!iconSelector) {
    console.error('图标选择器容器未找到');
    return;
  }

  // 加载图标数据
  await loadIconData();

  // 直接显示所有图标
  renderAllIcons();

}

// 渲染所有图标
function renderAllIcons(): void {
  renderIconsFromList(allIcons);
}

// 从图标列表渲染图标
function renderIconsFromList(icons: IconData[]): void {
  const iconSelector = getElement('icon-selector');
  const iconLoading = getElement('icon-loading');

  if (!iconSelector) {
    console.error('图标选择器容器未找到');
    return;
  }

  // 显示加载状态
  if (iconLoading) {
    iconLoading.style.display = 'flex';
  }
  iconSelector.innerHTML = '';
  icons.forEach((icon: IconData, index: number): void => {
    const iconOption = document.createElement('span');
    iconOption.className = 'icon-option';
    iconOption.dataset['icon'] = icon.class;
    // iconOption.title = icon.name;
    // iconOption.style.animationDelay = `${index * 0.02}s`;

    const iconElement = document.createElement('i');
    iconElement.className = icon.class;
    iconOption.appendChild(iconElement);

    iconOption.addEventListener('click', (): void => {
      document.querySelectorAll('.icon-option.selected').forEach(opt => {
        opt.classList.remove('selected');
      });
      iconOption.classList.add('selected');
    });

    iconSelector.appendChild(iconOption);
  });

  if (iconLoading) {
    iconLoading.style.display = 'none';
  }
}

// 清除图标选择
function clearIconSelection(): void {
  const iconOptions = document.querySelectorAll('.icon-option');
  iconOptions.forEach((option: Element): void => {
    option.classList.remove('selected');
  });
} 