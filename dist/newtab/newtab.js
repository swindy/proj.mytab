"use strict";
// 全局变量
let workspaces = {};
let currentWorkspace = 'default';
// DOM元素类型断言辅助函数
function getElement(id) {
    return document.getElementById(id);
}
function getElementBySelector(selector) {
    return document.querySelector(selector);
}
// 搜索引擎配置
const searchEngines = {
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
const animeBackgrounds = [
    { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop', name: '星空夜景' },
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: '山脉风光' },
    { url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=1080&fit=crop', name: '城市夜景' },
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: '自然风景' },
    { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop', name: '森林小径' },
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: '海洋波浪' },
    { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop', name: '樱花盛开' },
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: '雪山景色' }
];
document.addEventListener('DOMContentLoaded', async () => {
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
        // 初始化底边栏图标（异步）
        initBottomBarIcons();
        console.log('底边栏图标初始化开始');
        // 初始化工作区（这会触发书签初始化）
        initWorkspaces();
        console.log('工作区初始化完成');
        // 初始化动漫背景
        initAnimeBackground();
        console.log('动漫背景初始化完成');
    }
    catch (error) {
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
    const clockElement = getElement('clock');
    if (clockElement) {
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    // 更新日期
    const options = {
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
function initSearch() {
    const searchInput = getElement('search-input');
    const searchForm = getElement('search-form');
    if (!searchInput || !searchForm) {
        console.error('搜索元素未找到');
        return;
    }
    // 加载搜索引擎设置
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get('searchEngine', (data) => {
            const engine = data.searchEngine || 'baidu';
            const config = searchEngines[engine];
            searchInput.placeholder = config.placeholder;
        });
    }
    // 搜索表单提交事件
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });
}
// 执行搜索
function performSearch(query) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get('searchEngine', (data) => {
            const engine = data.searchEngine || 'baidu';
            const config = searchEngines[engine];
            const searchUrl = config.url + encodeURIComponent(query);
            window.open(searchUrl, '_blank');
        });
    }
    else {
        // 默认使用百度搜索
        const searchUrl = searchEngines.baidu.url + encodeURIComponent(query);
        window.open(searchUrl, '_blank');
    }
}
// 初始化工作区
function initWorkspaces() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['workspaces', 'currentWorkspace'], (data) => {
            workspaces = data.workspaces || getDefaultWorkspaces();
            currentWorkspace = data.currentWorkspace || 'default';
            completeWorkspaceInit();
        });
    }
    else {
        // 如果没有Chrome存储，使用默认工作区
        workspaces = getDefaultWorkspaces();
        currentWorkspace = 'default';
        completeWorkspaceInit();
    }
}
// 完成工作区初始化
async function completeWorkspaceInit() {
    updateWorkspaceList();
    await initBookmarks();
    updateConfigStats();
}
// 获取默认工作区
function getDefaultWorkspaces() {
    return {
        default: {
            id: 'default',
            name: '默认',
            bookmarks: [],
            icon: '🏠'
        },
        work: {
            id: 'work',
            name: '工作',
            bookmarks: [],
            icon: '💼'
        },
        study: {
            id: 'study',
            name: '学习',
            bookmarks: [],
            icon: '📚'
        },
        entertainment: {
            id: 'entertainment',
            name: '娱乐',
            bookmarks: [],
            icon: '🎮'
        }
    };
}
// 更新工作区列表
function updateWorkspaceList() {
    const workspaceList = getElement('workspace-list');
    if (!workspaceList) {
        console.error('workspace-list 元素未找到');
        return;
    }
    workspaceList.innerHTML = '';
    Object.values(workspaces).forEach((workspace) => {
        const workspaceItem = document.createElement('div');
        workspaceItem.className = `workspace-item ${workspace.id === currentWorkspace ? 'active' : ''}`;
        workspaceItem.dataset['workspace'] = workspace.id;
        const icon = document.createElement('div');
        icon.className = 'workspace-icon';
        icon.textContent = workspace.icon || '📁';
        const name = document.createElement('span');
        name.textContent = workspace.name;
        workspaceItem.appendChild(icon);
        workspaceItem.appendChild(name);
        // 左键点击切换工作区
        workspaceItem.addEventListener('click', () => {
            console.log('点击工作区:', workspace.id);
            switchWorkspace(workspace.id);
        });
        // 右键菜单功能
        workspaceItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showWorkspaceContextMenu(e, workspace, workspaceItem);
        });
        workspaceList.appendChild(workspaceItem);
    });
    console.log('工作区列表已更新，当前工作区:', currentWorkspace);
}
// 切换工作区
async function switchWorkspace(workspaceId) {
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
function showWorkspaceContextMenu(e, workspace, workspaceElement) {
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
    editOption.addEventListener('mouseenter', () => {
        editOption.style.background = '#f5f5f5';
    });
    editOption.addEventListener('mouseleave', () => {
        editOption.style.background = 'white';
    });
    editOption.addEventListener('click', () => {
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
        deleteOption.addEventListener('mouseenter', () => {
            deleteOption.style.background = '#f5f5f5';
        });
        deleteOption.addEventListener('mouseleave', () => {
            deleteOption.style.background = 'white';
        });
        deleteOption.addEventListener('click', () => {
            deleteWorkspace(workspace);
            contextMenu.remove();
        });
        contextMenu.appendChild(editOption);
        contextMenu.appendChild(deleteOption);
    }
    else {
        // 默认工作区只显示修改选项
        contextMenu.appendChild(editOption);
    }
    document.body.appendChild(contextMenu);
    // 点击其他地方关闭菜单
    const closeMenu = (event) => {
        if (!contextMenu.contains(event.target)) {
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
function editWorkspace(workspace) {
    const addWorkspaceModal = getElement('add-workspace-modal');
    const workspaceNameInput = getElement('workspace-name');
    if (!addWorkspaceModal || !workspaceNameInput) {
        console.error('工作区编辑元素未找到');
        return;
    }
    // 填充当前工作区数据
    workspaceNameInput.value = workspace.name;
    // 选择当前图标
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach((option) => {
        option.classList.remove('selected');
        const iconOption = option;
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
function deleteWorkspace(workspace) {
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
        chrome.storage.sync.set({ workspaces, currentWorkspace }, () => {
            console.log('工作区已删除:', workspace.name);
            updateWorkspaceList();
            initBookmarks();
        });
    }
    else {
        // 本地测试环境
        console.log('工作区已删除:', workspace.name);
        updateWorkspaceList();
        initBookmarks();
    }
}
// 修改initBookmarks函数为异步版本，使用智能图标获取
async function initBookmarks() {
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
    }
    else {
        // 如果当前工作区没有书签，显示默认书签（仅限默认工作区）
        if (currentWorkspace === 'default') {
            const defaultBookmarks = [
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
function showBookmarkContextMenu(e, bookmark, bookmarkElement) {
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
    editOption.addEventListener('mouseenter', () => {
        editOption.style.background = '#f5f5f5';
    });
    editOption.addEventListener('mouseleave', () => {
        editOption.style.background = 'white';
    });
    editOption.addEventListener('click', () => {
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
    deleteOption.addEventListener('mouseenter', () => {
        deleteOption.style.background = '#f5f5f5';
    });
    deleteOption.addEventListener('mouseleave', () => {
        deleteOption.style.background = 'white';
    });
    deleteOption.addEventListener('click', () => {
        deleteBookmark(bookmark, bookmarkElement);
        contextMenu.remove();
    });
    contextMenu.appendChild(editOption);
    contextMenu.appendChild(deleteOption);
    document.body.appendChild(contextMenu);
    // 点击其他地方关闭菜单
    const closeMenu = (event) => {
        if (!contextMenu.contains(event.target)) {
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
function editBookmark(bookmark) {
    const addBookmarkModal = getElement('add-bookmark-modal');
    const titleInput = getElement('bookmark-title');
    const urlInput = getElement('bookmark-url');
    const descriptionInput = getElement('bookmark-description');
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
function deleteBookmark(bookmark, bookmarkElement) {
    if (!confirm(`确定要删除书签"${bookmark.title}"吗？`)) {
        return;
    }
    // 从当前工作区中删除书签
    const currentWorkspaceData = workspaces[currentWorkspace];
    if (currentWorkspaceData && currentWorkspaceData.bookmarks) {
        const bookmarkIndex = currentWorkspaceData.bookmarks.findIndex((b) => b.title === bookmark.title && b.url === bookmark.url);
        if (bookmarkIndex !== -1) {
            currentWorkspaceData.bookmarks.splice(bookmarkIndex, 1);
            // 保存到存储
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.sync.set({ workspaces }, () => {
                    console.log('书签已删除:', bookmark.title);
                });
            }
            // 从DOM中移除元素
            bookmarkElement.remove();
        }
    }
}
// 简化的图标获取函数 - 只使用favicon
async function getWebsiteFavicon(url) {
    const domain = new URL(url).hostname;
    // 定义favicon路径，按优先级排序
    const faviconPaths = [
        // 高分辨率favicon
        `https://${domain}/favicon-32x32.png`,
        `https://${domain}/favicon-96x96.png`,
        `https://${domain}/favicon-192x192.png`,
        // Apple touch icon (通常质量较好)
        `https://${domain}/apple-touch-icon.png`,
        `https://${domain}/apple-touch-icon-180x180.png`,
        // Google favicon服务 (备用)
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        // 标准favicon (最后备用)
        `https://${domain}/favicon.ico`
    ];
    // 尝试加载每个路径
    for (const faviconPath of faviconPaths) {
        try {
            const isValid = await checkImageExists(faviconPath);
            if (isValid) {
                return faviconPath;
            }
        }
        catch (error) {
            // 继续尝试下一个路径
            continue;
        }
    }
    // 如果所有路径都失败，返回空字符串，将使用文字
    return '';
}
// 检查图片是否存在且可加载
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            // 检查图片尺寸，过小的图片可能是占位符
            if (img.width >= 16 && img.height >= 16) {
                resolve(true);
            }
            else {
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
async function createBookmarkElementWithLogo(bookmark) {
    const bookmarkItem = document.createElement('a');
    bookmarkItem.href = bookmark.url;
    bookmarkItem.className = 'bookmark-item';
    // 如果有描述，添加到title属性中
    if (bookmark.description) {
        bookmarkItem.title = `${bookmark.title}\n${bookmark.description}`;
    }
    else {
        bookmarkItem.title = bookmark.title;
    }
    const iconContainer = document.createElement('div');
    iconContainer.className = 'bookmark-icon';
    // 先显示文字版本
    function showTextIcon() {
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
    function showImageIcon(iconUrl) {
        const iconImg = document.createElement('img');
        iconImg.src = iconUrl;
        iconImg.alt = bookmark.title;
        iconImg.style.width = '100%';
        iconImg.style.height = '100%';
        iconImg.style.objectFit = 'cover';
        iconImg.onerror = () => {
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
    bookmarkItem.appendChild(iconContainer);
    bookmarkItem.appendChild(titleElement);
    // 添加右键菜单事件
    bookmarkItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showBookmarkContextMenu(e, bookmark, bookmarkItem);
    });
    // 异步获取favicon并替换
    (async () => {
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
        }
        catch (error) {
            console.warn('获取书签图标失败:', bookmark.title, error);
            // 保持文字版本
        }
    })();
    return bookmarkItem;
}
// 修改原有的createBookmarkElement函数，简化为只使用favicon或文字
function createBookmarkElement(bookmark) {
    const bookmarkItem = document.createElement('a');
    bookmarkItem.href = bookmark.url;
    bookmarkItem.className = 'bookmark-item';
    // 如果有描述，添加到title属性中
    if (bookmark.description) {
        bookmarkItem.title = `${bookmark.title}\n${bookmark.description}`;
    }
    else {
        bookmarkItem.title = bookmark.title;
    }
    const iconContainer = document.createElement('div');
    iconContainer.className = 'bookmark-icon';
    // 如果有图标URL，使用图片；否则使用文字
    if (bookmark.icon) {
        const iconImg = document.createElement('img');
        iconImg.src = bookmark.icon;
        iconImg.alt = bookmark.title;
        iconImg.onerror = () => {
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
    }
    else {
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
    bookmarkItem.appendChild(iconContainer);
    bookmarkItem.appendChild(titleElement);
    // 添加右键菜单事件
    bookmarkItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showBookmarkContextMenu(e, bookmark, bookmarkItem);
    });
    return bookmarkItem;
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
        const addBookmarkModal = getElement('add-bookmark-modal');
        if (addBookmarkModal) {
            addBookmarkModal.classList.add('active');
        }
    });
    return addBookmarkItem;
}
// 初始化侧边栏
function initSidebar() {
    // 侧边栏相关功能实现
    console.log('侧边栏初始化');
}
// 初始化模态框
function initModals() {
    const addWorkspaceBtn = getElement('add-workspace');
    const addWorkspaceModal = getElement('add-workspace-modal');
    const addWorkspaceForm = getElement('add-workspace-form');
    const cancelWorkspaceBtn = getElement('cancel-workspace');
    // 书签相关元素
    const addBookmarkModal = getElement('add-bookmark-modal');
    const addBookmarkForm = getElement('add-bookmark-form');
    const cancelBookmarkBtn = getElement('cancel-bookmark');
    // 添加工作区按钮点击事件
    if (addWorkspaceBtn && addWorkspaceModal) {
        addWorkspaceBtn.addEventListener('click', () => {
            console.log('点击添加工作区按钮');
            addWorkspaceModal.classList.add('active');
        });
    }
    // 取消添加工作区按钮
    if (cancelWorkspaceBtn && addWorkspaceModal && addWorkspaceForm) {
        cancelWorkspaceBtn.addEventListener('click', () => {
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
        addWorkspaceModal.addEventListener('click', (e) => {
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
    iconOptions.forEach((option) => {
        option.addEventListener('click', () => {
            iconOptions.forEach((opt) => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    // 添加工作区表单提交
    if (addWorkspaceForm) {
        addWorkspaceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const workspaceNameInput = getElement('workspace-name');
            const selectedIcon = document.querySelector('.icon-option.selected');
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
                    const originalWorkspace = JSON.parse(editWorkspaceData);
                    if (workspaces[originalWorkspace.id]) {
                        // 更新工作区数据
                        const workspace = workspaces[originalWorkspace.id];
                        if (workspace) {
                            workspace.name = workspaceName;
                            workspace.icon = workspaceIcon;
                        }
                        console.log('工作区已更新:', workspaceName);
                    }
                    else {
                        alert('找不到要编辑的工作区');
                        return;
                    }
                }
                catch (error) {
                    console.error('解析编辑工作区数据失败:', error);
                    alert('编辑工作区数据错误');
                    return;
                }
            }
            else {
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
                chrome.storage.sync.set({ workspaces }, () => {
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
            }
            else {
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
        cancelBookmarkBtn.addEventListener('click', () => {
            addBookmarkModal.classList.remove('active');
            addBookmarkForm.reset();
            // 清除编辑模式标记
            addBookmarkModal.removeAttribute('data-edit-mode');
            addBookmarkModal.removeAttribute('data-edit-bookmark');
        });
    }
    // 点击书签模态框外部关闭
    if (addBookmarkModal && addBookmarkForm) {
        addBookmarkModal.addEventListener('click', (e) => {
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
        addBookmarkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const titleInput = getElement('bookmark-title');
            const urlInput = getElement('bookmark-url');
            const descriptionInput = getElement('bookmark-description');
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
                    const originalBookmark = JSON.parse(editBookmarkData);
                    const bookmarkIndex = currentWorkspaceData.bookmarks.findIndex((b) => b.title === originalBookmark.title && b.url === originalBookmark.url);
                    if (bookmarkIndex !== -1) {
                        // 更新书签数据
                        currentWorkspaceData.bookmarks[bookmarkIndex] = {
                            title,
                            url,
                            ...(description && { description })
                        };
                        console.log('书签已更新:', title);
                    }
                    else {
                        alert('找不到要编辑的书签');
                        return;
                    }
                }
                catch (error) {
                    console.error('解析编辑书签数据失败:', error);
                    alert('编辑书签数据错误');
                    return;
                }
            }
            else {
                // 添加模式：创建新书签
                const newBookmark = {
                    title,
                    url,
                    ...(description && { description })
                };
                currentWorkspaceData.bookmarks.push(newBookmark);
                console.log('新书签已添加:', title);
            }
            // 保存到存储
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.sync.set({ workspaces }, async () => {
                    await initBookmarks();
                    addBookmarkModal.classList.remove('active');
                    addBookmarkForm.reset();
                    // 清除编辑模式标记
                    addBookmarkModal.removeAttribute('data-edit-mode');
                    addBookmarkModal.removeAttribute('data-edit-bookmark');
                });
            }
            else {
                // 本地测试环境
                (async () => {
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
        settingsBtn.addEventListener('click', () => {
            console.log('点击设置按钮');
            loadSettingsData();
            settingsModal.classList.add('active');
        });
    }
    // 关闭设置按钮
    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
    }
    // 取消设置按钮
    if (cancelSettingsBtn && settingsModal) {
        cancelSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
    }
    // 点击设置模态框外部关闭
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
    }
    // 阻止模态框内容的点击事件冒泡
    const settingsModalContent = settingsModal?.querySelector('.settings-modal-content');
    if (settingsModalContent) {
        settingsModalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    // 标签页切换功能
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tabBtn = btn;
            const targetTab = tabBtn.dataset['tab'];
            if (!targetTab)
                return;
            // 移除所有活动状态
            tabBtns.forEach((b) => b.classList.remove('active'));
            tabContents.forEach((c) => c.classList.remove('active'));
            // 激活当前标签
            tabBtn.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    // 主题选择功能
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach((option) => {
        option.addEventListener('click', () => {
            themeOptions.forEach((opt) => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    // 保存设置按钮
    if (saveSettingsBtn && settingsModal) {
        saveSettingsBtn.addEventListener('click', () => {
            saveSettingsData();
            settingsModal.classList.remove('active');
        });
    }
    // 重置设置按钮
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('确定要重置所有设置吗？这将恢复默认设置。')) {
                resetSettingsData();
            }
        });
    }
    // 配置管理相关元素
    const exportConfigBtn = getElement('export-config');
    const importConfigBtn = getElement('import-config');
    const importFileInput = getElement('import-file');
    // 导出配置按钮
    if (exportConfigBtn) {
        exportConfigBtn.addEventListener('click', () => {
            exportConfiguration();
        });
    }
    // 导入配置按钮
    if (importConfigBtn && importFileInput) {
        importConfigBtn.addEventListener('click', () => {
            importFileInput.click();
        });
        importFileInput.addEventListener('change', (e) => {
            const target = e.target;
            const file = target.files?.[0];
            if (file) {
                importConfiguration(file);
                target.value = ''; // 清空文件选择
            }
        });
    }
    console.log('模态框初始化完成');
}
// 清除图标选择
function clearIconSelection() {
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach((option) => {
        option.classList.remove('selected');
    });
}
// 初始化底边栏图标
function initBottomBarIcons() {
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
async function createQuickLinkElement(link) {
    const linkElement = document.createElement('a');
    linkElement.href = link.url;
    linkElement.className = 'fixed-link';
    linkElement.title = link.title;
    linkElement.setAttribute('data-emoji', link.emoji);
    // 先显示文字版本
    function showTextIcon() {
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
    function showImageIcon(faviconUrl) {
        const img = document.createElement('img');
        img.src = faviconUrl;
        img.alt = link.title;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        // 图片加载失败时回退到文字
        img.onerror = () => {
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
    (async () => {
        try {
            const faviconUrl = await getWebsiteFavicon(link.url);
            // 如果获取到有效图标，替换文字版本
            if (faviconUrl) {
                showImageIcon(faviconUrl);
            }
        }
        catch (error) {
            console.warn('获取快速链接图标失败:', link.title, error);
            // 保持文字版本
        }
    })();
    return linkElement;
}
// 初始化动漫背景
function initAnimeBackground() {
    let currentBackgroundIndex = 0;
    let backgroundChangeInterval;
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
        chrome.storage.sync.get(['currentBackgroundIndex', 'autoChangeBackground'], (data) => {
            currentBackgroundIndex = data.currentBackgroundIndex || 0;
            const autoChange = data.autoChangeBackground !== false; // 默认开启自动切换
            // 设置初始背景
            setBackground(currentBackgroundIndex);
            // 如果开启自动切换，启动定时器
            if (autoChange) {
                startAutoChange();
            }
        });
    }
    else {
        // 本地测试环境
        setBackground(0);
        startAutoChange();
    }
    // 背景切换按钮点击事件
    if (bgSwitchBtn) {
        bgSwitchBtn.addEventListener('click', () => {
            switchToNextBackground();
        });
    }
    // 设置背景图片
    function setBackground(index) {
        if (index >= 0 && index < animeBackgrounds.length) {
            const background = animeBackgrounds[index];
            if (!background) {
                console.error('背景数据不存在，索引:', index);
                return;
            }
            // 预加载图片
            const img = new Image();
            img.onload = () => {
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
            img.onerror = () => {
                console.error('背景图片加载失败:', background.url);
                // 如果图片加载失败，尝试下一张
                switchToNextBackground();
            };
            img.src = background.url;
        }
    }
    // 切换到下一张背景
    function switchToNextBackground() {
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
    function startAutoChange() {
        // 每30秒自动切换背景
        backgroundChangeInterval = window.setInterval(() => {
            switchToNextBackground();
        }, 30000);
    }
    // 停止自动切换
    function stopAutoChange() {
        if (backgroundChangeInterval) {
            clearInterval(backgroundChangeInterval);
        }
    }
    // 页面失去焦点时停止自动切换，获得焦点时恢复
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoChange();
        }
        else {
            startAutoChange();
        }
    });
    console.log('动漫背景初始化完成，共', animeBackgrounds.length, '张背景图片');
}
// 加载设置数据
function loadSettingsData() {
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
        ], (data) => {
            // 常规设置
            const autoChangeCheckbox = getElement('auto-change-background');
            if (autoChangeCheckbox) {
                autoChangeCheckbox.checked = data.autoChangeBackground !== false;
            }
            const backgroundIntervalInput = getElement('background-interval');
            if (backgroundIntervalInput) {
                backgroundIntervalInput.value = String(data.backgroundInterval || 30);
            }
            const showClockCheckbox = getElement('show-clock');
            if (showClockCheckbox) {
                showClockCheckbox.checked = data.showClock !== false;
            }
            const showDateCheckbox = getElement('show-date');
            if (showDateCheckbox) {
                showDateCheckbox.checked = data.showDate !== false;
            }
            // 外观设置
            const theme = data.theme || 'auto';
            const themeOptions = document.querySelectorAll('.theme-option');
            themeOptions.forEach((option) => {
                const themeOption = option;
                option.classList.remove('active');
                if (themeOption.dataset['theme'] === theme) {
                    option.classList.add('active');
                }
            });
            // 搜索设置
            const searchEngine = data.searchEngine || 'baidu';
            const searchEngineRadios = document.querySelectorAll('input[name="search-engine"]');
            searchEngineRadios.forEach((radio) => {
                radio.checked = radio.value === searchEngine;
            });
            const searchSuggestionsCheckbox = getElement('search-suggestions');
            if (searchSuggestionsCheckbox) {
                searchSuggestionsCheckbox.checked = data.searchSuggestions !== false;
            }
            const openInNewTabCheckbox = getElement('open-in-new-tab');
            if (openInNewTabCheckbox) {
                openInNewTabCheckbox.checked = data.openInNewTab !== false;
            }
            // 更新配置统计信息
            updateConfigStats();
        });
    }
    else {
        // 本地测试环境，使用默认值
        console.log('本地测试环境，使用默认设置');
        updateConfigStats();
    }
}
// 保存设置数据
function saveSettingsData() {
    // 收集所有设置数据
    const autoChangeCheckbox = getElement('auto-change-background');
    const backgroundIntervalInput = getElement('background-interval');
    const showClockCheckbox = getElement('show-clock');
    const showDateCheckbox = getElement('show-date');
    const searchSuggestionsCheckbox = getElement('search-suggestions');
    const openInNewTabCheckbox = getElement('open-in-new-tab');
    // 获取选中的主题
    const selectedTheme = document.querySelector('.theme-option.active');
    const theme = selectedTheme?.dataset['theme'] || 'auto';
    // 获取选中的搜索引擎
    const selectedSearchEngine = document.querySelector('input[name="search-engine"]:checked');
    const searchEngine = selectedSearchEngine?.value || 'baidu';
    const settings = {
        autoChangeBackground: autoChangeCheckbox?.checked !== false,
        backgroundInterval: parseInt(backgroundIntervalInput?.value || '30'),
        showClock: showClockCheckbox?.checked !== false,
        showDate: showDateCheckbox?.checked !== false,
        theme: theme,
        searchEngine: searchEngine,
        searchSuggestions: searchSuggestionsCheckbox?.checked !== false,
        openInNewTab: openInNewTabCheckbox?.checked !== false
    };
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set(settings, () => {
            console.log('设置已保存:', settings);
            alert('设置已保存！');
            // 应用一些立即生效的设置
            applySettings(settings);
        });
    }
    else {
        // 本地测试环境
        console.log('本地测试环境，设置已保存:', settings);
        alert('设置已保存！');
        applySettings(settings);
    }
}
// 重置设置数据
function resetSettingsData() {
    const defaultSettings = {
        autoChangeBackground: true,
        backgroundInterval: 30,
        showClock: true,
        showDate: true,
        theme: 'auto',
        searchEngine: 'baidu',
        searchSuggestions: true,
        openInNewTab: true
    };
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set(defaultSettings, () => {
            console.log('设置已重置为默认值');
            alert('设置已重置为默认值！');
            // 重新加载设置界面
            loadSettingsData();
            // 应用默认设置
            applySettings(defaultSettings);
        });
    }
    else {
        // 本地测试环境
        console.log('本地测试环境，设置已重置为默认值');
        alert('设置已重置为默认值！');
        loadSettingsData();
        applySettings(defaultSettings);
    }
}
// 应用设置（立即生效的设置）
function applySettings(settings) {
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
        const searchInput = getElement('search-input');
        if (searchInput) {
            const config = searchEngines[settings.searchEngine];
            searchInput.placeholder = config.placeholder;
        }
    }
    console.log('设置已应用:', settings);
}
// 导出配置
function exportConfiguration() {
    try {
        // 收集当前配置数据
        const configData = {
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
            ], (settings) => {
                configData.settings = settings;
                downloadConfigFile(configData);
            });
        }
        else {
            downloadConfigFile(configData);
        }
    }
    catch (error) {
        console.error('导出配置失败:', error);
        alert('导出配置失败，请重试。');
    }
}
// 下载配置文件
function downloadConfigFile(configData) {
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
function importConfiguration(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result;
            const configData = JSON.parse(content);
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
            }
            else {
                mergeConfiguration(configData);
            }
        }
        catch (error) {
            console.error('导入配置失败:', error);
            alert('配置文件解析失败，请检查文件格式。');
        }
    };
    reader.readAsText(file);
}
// 验证配置数据格式
function validateConfigData(data) {
    return (data &&
        typeof data === 'object' &&
        data.workspaces &&
        typeof data.workspaces === 'object' &&
        typeof data.currentWorkspace === 'string' &&
        typeof data.version === 'string');
}
// 获取选中的导入模式
function getSelectedImportMode() {
    const selectedMode = document.querySelector('input[name="import-mode"]:checked');
    return selectedMode?.value || 'replace';
}
// 覆盖配置
function replaceConfiguration(configData) {
    // 直接替换工作区数据
    workspaces = configData.workspaces;
    currentWorkspace = configData.currentWorkspace;
    // 确保当前工作区存在
    if (!workspaces[currentWorkspace]) {
        currentWorkspace = Object.keys(workspaces)[0] || 'default';
    }
    // 保存到存储
    saveConfigurationToStorage(configData, () => {
        // 更新UI
        updateWorkspaceList();
        initBookmarks();
        updateConfigStats();
        alert('配置导入成功！页面将刷新以应用新配置。');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}
// 合并配置
function mergeConfiguration(configData) {
    // 合并工作区
    Object.keys(configData.workspaces).forEach((workspaceId) => {
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
            importedBookmarks.forEach((bookmark) => {
                if (!existingUrls.has(bookmark.url)) {
                    mergedBookmarks.push(bookmark);
                }
            });
            workspaces[workspaceId].bookmarks = mergedBookmarks;
        }
        else {
            // 工作区不存在，直接添加
            workspaces[workspaceId] = { ...importedWorkspace };
        }
    });
    // 保存到存储
    saveConfigurationToStorage(configData, () => {
        // 更新UI
        updateWorkspaceList();
        initBookmarks();
        updateConfigStats();
        alert('配置合并成功！');
    });
}
// 保存配置到存储
function saveConfigurationToStorage(configData, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        const dataToSave = {
            workspaces: workspaces,
            currentWorkspace: currentWorkspace
        };
        // 如果有设置数据，也保存设置
        if (configData.settings) {
            Object.assign(dataToSave, configData.settings);
        }
        chrome.storage.sync.set(dataToSave, callback);
    }
    else {
        // 本地测试环境
        console.log('本地测试环境，配置已保存');
        callback();
    }
}
// 更新配置统计信息
function updateConfigStats() {
    const workspaceCountEl = getElement('workspace-count');
    const bookmarkCountEl = getElement('bookmark-count');
    const currentWorkspaceNameEl = getElement('current-workspace-name');
    if (workspaceCountEl) {
        workspaceCountEl.textContent = String(Object.keys(workspaces).length);
    }
    if (bookmarkCountEl) {
        const totalBookmarks = Object.values(workspaces).reduce((total, workspace) => {
            return total + (workspace.bookmarks?.length || 0);
        }, 0);
        bookmarkCountEl.textContent = String(totalBookmarks);
    }
    if (currentWorkspaceNameEl) {
        const currentWorkspaceData = workspaces[currentWorkspace];
        currentWorkspaceNameEl.textContent = currentWorkspaceData?.name || '未知';
    }
}
//# sourceMappingURL=newtab.js.map