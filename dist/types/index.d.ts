export interface Bookmark {
    title: string;
    url: string;
    icon?: string;
    description?: string;
}
export interface Workspace {
    id: string;
    name: string;
    bookmarks: Bookmark[];
    icon?: string;
}
export interface Workspaces {
    [key: string]: Workspace;
}
export type SearchEngine = 'baidu' | 'google' | 'bing';
export type Theme = 'light' | 'dark' | 'auto';
export interface ExtensionSettings {
    searchEngine: SearchEngine;
    theme: Theme;
    workspaces: Workspaces;
    currentWorkspace: string;
}
export interface ChromeMessage {
    action: string;
    data?: any;
}
export interface ChromeMessageResponse {
    success: boolean;
    data?: any;
    error?: string;
}
export interface SearchEngineConfig {
    name: string;
    url: string;
    placeholder: string;
}
export interface AnimeBackground {
    url: string;
    name?: string;
}
export type ElementSelector = string;
export type EventHandler<T = Event> = (event: T) => void;
export interface StorageData {
    bookmarks?: Bookmark[];
    searchEngine?: SearchEngine;
    theme?: Theme;
    workspaces?: Workspaces;
    currentWorkspace?: string;
}
//# sourceMappingURL=index.d.ts.map