// 监听扩展安装
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // 首次安装时初始化默认设置
        initDefaultSettings();
    }
    else if (details.reason === 'update') {
        // 扩展更新时可以执行的操作
        const thisVersion = chrome.runtime.getManifest().version;
        console.log(`更新到版本 ${thisVersion}`);
    }
});
// 初始化默认设置
function initDefaultSettings() {
    // 默认书签
    const defaultBookmarks = [
        { title: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
        { title: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
        { title: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
        { title: 'Bilibili', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' }
    ];
    // 默认搜索引擎
    const defaultSearchEngine = 'baidu';
    // 默认主题
    const defaultTheme = 'light';
    // 保存默认设置
    const defaultSettings = {
        bookmarks: defaultBookmarks,
        searchEngine: defaultSearchEngine,
        theme: defaultTheme
    };
    chrome.storage.sync.set(defaultSettings, () => {
        console.log('默认设置已初始化');
    });
}
// 监听来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSearchEngine') {
        // 获取当前搜索引擎设置
        chrome.storage.sync.get('searchEngine', (data) => {
            sendResponse({
                success: true,
                data: {
                    searchEngine: data.searchEngine || 'baidu'
                }
            });
        });
        return true; // 异步响应需要返回true
    }
    if (message.action === 'getTheme') {
        // 获取当前主题设置
        chrome.storage.sync.get('theme', (data) => {
            sendResponse({
                success: true,
                data: {
                    theme: data.theme || 'light'
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
export {};
//# sourceMappingURL=background.js.map