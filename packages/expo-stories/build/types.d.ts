export interface IServerConfig {
    projectRoot: string;
    port: number;
    watchRoot: string;
}
export interface IStoryManifest {
    files: Record<string, IStoryManifestItem>;
}
export interface IStoryManifestItem {
    id: string;
    fullPath: string;
    relativePath: string;
    title: string;
    stories: any[];
}
