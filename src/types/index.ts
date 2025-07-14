// 书签接口
export interface Bookmark {
  title: string;
  url: string;
  icon?: string;
  description?: string;
}

// 工作区接口
export interface Workspace {
  id: string;
  name: string;
  bookmarks: Bookmark[];
  icon?: string;
}

// 工作区集合接口
export interface Workspaces {
  [key: string]: Workspace;
}

// 搜索引擎类型
export type SearchEngine = 'baidu' | 'google' | 'bing';

// 主题类型
export type Theme = 'light' | 'dark' | 'auto';

// 扩展设置接口
export interface ExtensionSettings {
  searchEngine: SearchEngine;
  theme: Theme;
  workspaces: Workspaces;
  currentWorkspace: string;
}

// Chrome消息接口
export interface ChromeMessage {
  action: string;
  data?: any;
}

// Chrome消息响应接口
export interface ChromeMessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// 搜索引擎配置接口
export interface SearchEngineConfig {
  name: string;
  url: string;
  placeholder: string;
}

// 动漫背景配置接口
export interface AnimeBackground {
  url: string;
  name?: string;
}

// DOM元素选择器类型
export type ElementSelector = string;

// 事件处理器类型
export type EventHandler<T = Event> = (event: T) => void;

// GitHub同步配置接口
export interface GitHubSyncConfig {
  token: string;
  gistId?: string;
  enabled: boolean;
}

// 同步状态类型
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// 同步配置数据接口
export interface SyncData {
  bookmarks: Bookmark[];
  searchEngine: SearchEngine;
  theme: Theme;
  workspaces: Workspaces;
  currentWorkspace: string;
  lastSync?: string;
}

// 存储数据类型
export interface StorageData {
  bookmarks?: Bookmark[];
  searchEngine?: SearchEngine;
  theme?: Theme;
  workspaces?: Workspaces;
  currentWorkspace?: string;
  githubSync?: GitHubSyncConfig;
} 