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
declare function completeWorkspaceInit(): Promise<void>;
declare function getDefaultWorkspaces(): Workspaces;
declare function updateWorkspaceList(): void;
declare function switchWorkspace(workspaceId: string): Promise<void>;
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
//# sourceMappingURL=newtab.d.ts.map