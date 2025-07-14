declare const Octokit: any;
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
interface GitHubSyncConfig {
    token: string;
    gistId?: string;
    enabled: boolean;
}
type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
interface SyncData {
    bookmarks: Bookmark[];
    searchEngine: SearchEngine;
    theme: string;
    workspaces: Workspaces;
    currentWorkspace: string;
    lastSync?: string;
}
interface ConfigData {
    workspaces: Workspaces;
    currentWorkspace: string;
    settings?: Partial<AppSettings>;
    exportTime: string;
    version: string;
}
declare let workspaces: Workspaces;
declare let currentWorkspace: string;
declare function getElement<T extends HTMLElement>(id: string): T | null;
declare function getElementBySelector<T extends HTMLElement>(selector: string): T | null;
declare const searchEngines: Record<SearchEngine, SearchEngineConfig>;
declare const animeBackgrounds: AnimeBackground[];
declare function updateClock(): void;
declare function initSearch(): void;
declare function performSearch(query: string): void;
declare function initWorkspaces(): void;
declare function completeWorkspaceInit(): Promise<void>;
declare function getDefaultWorkspaces(): Workspaces;
declare function updateWorkspaceList(): void;
declare function switchWorkspace(workspaceId: string): Promise<void>;
declare function showWorkspaceContextMenu(e: MouseEvent, workspace: Workspace, workspaceElement: HTMLElement): void;
declare function editWorkspace(workspace: Workspace): void;
declare function deleteWorkspace(workspace: Workspace): void;
declare function initBookmarks(): Promise<void>;
declare function showBookmarkContextMenu(e: MouseEvent, bookmark: Bookmark, bookmarkElement: HTMLElement): void;
declare function editBookmark(bookmark: Bookmark): void;
declare function deleteBookmark(bookmark: Bookmark, bookmarkElement: HTMLElement): void;
declare function getWebsiteFavicon(url: string): Promise<string>;
declare function checkImageExists(url: string): Promise<boolean>;
declare function createBookmarkElementWithLogo(bookmark: Bookmark): Promise<HTMLElement>;
declare function createBookmarkElement(bookmark: Bookmark): HTMLElement;
declare function createAddBookmarkButton(): HTMLElement;
declare function initSidebar(): void;
declare function initModals(): void;
declare function clearIconSelection(): void;
declare function initBottomBarIcons(): void;
declare function createQuickLinkElement(link: {
    title: string;
    url: string;
    emoji: string;
}): Promise<HTMLElement>;
declare function initAnimeBackground(): void;
interface AppSettings {
    autoChangeBackground: boolean;
    backgroundInterval: number;
    showClock: boolean;
    showDate: boolean;
    theme: 'auto' | 'light' | 'dark';
    searchEngine: SearchEngine;
    searchSuggestions: boolean;
    openInNewTab: boolean;
}
declare function loadSettingsData(): void;
declare function saveSettingsData(): void;
declare function resetSettingsData(): void;
declare function applySettings(settings: Partial<AppSettings>): void;
declare function exportConfiguration(): void;
declare function downloadConfigFile(configData: ConfigData): void;
declare function importConfiguration(file: File): void;
declare function validateConfigData(data: any): data is ConfigData;
declare function getSelectedImportMode(): 'replace' | 'merge';
declare function replaceConfiguration(configData: ConfigData): void;
declare function mergeConfiguration(configData: ConfigData): void;
declare function saveConfigurationToStorage(configData: ConfigData, callback: () => void): void;
declare let currentSyncStatus: SyncStatus;
declare function initGitHubSync(): void;
declare function toggleGitHubSync(): void;
declare function loadGitHubSyncSettings(): void;
declare function testGitHubConnection(): Promise<void>;
declare function syncNow(): Promise<void>;
declare function getCurrentSettings(): Promise<SyncData>;
declare function getOrCreateGist(token: string): Promise<string | null>;
declare function syncWithGist(token: string, gistId: string, localData: SyncData): Promise<void>;
declare function mergeData(localData: SyncData, remoteData: SyncData): SyncData;
declare function updateSyncStatus(status: SyncStatus, message: string): void;
declare function updateLastSyncTime(): void;
//# sourceMappingURL=newtab.d.ts.map