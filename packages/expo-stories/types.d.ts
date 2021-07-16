declare module 'expo-stories' {
  export interface IServerConfig {
    projectRoot: string;
    port: number;
    storyGlob: string;
  }
  export interface IStoryManifest {
    files: Record<string, IStoryManifestItem>;
  }
  export interface IStoryManifestItem {
    id: string;
    fullPath: string;
    relativePath: string;
  }
}
