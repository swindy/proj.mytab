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
declare function completeWorkspaceInit(): void;
declare function getDefaultWorkspaces(): Workspaces;
declare function updateWorkspaceList(): void;
declare function switchWorkspace(workspaceId: string): void;
declare function initBookmarks(): void;
declare function createBookmarkElement(bookmark: Bookmark): HTMLElement;
declare function getIconGradient(url: string, title: string): string;
declare function createAddBookmarkButton(): HTMLElement;
declare function initSidebar(): void;
declare function initModals(): void;
declare function clearIconSelection(): void;
declare function initBottomBarIcons(): void;
declare function initAnimeBackground(): void;
//# sourceMappingURL=newtab.d.ts.map