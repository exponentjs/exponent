import { GenerateOptions, ModuleDescriptor, ResolveOptions, SearchOptions, SearchResults } from './types';
/**
 * Resolves autolinking search paths. If none is provided, it accumulates all node_modules when
 * going up through the path components. This makes workspaces work out-of-the-box without any configs.
 */
export declare function resolveSearchPathsAsync(searchPaths: string[] | null, cwd: string): Promise<string[]>;
/**
 * Looks up for workspace's `node_modules` paths.
 */
export declare function findDefaultPathsAsync(cwd: string): Promise<string[]>;
/**
 * Searches for modules to link based on given config.
 */
export declare function findModulesAsync(providedOptions: SearchOptions): Promise<SearchResults>;
/**
 * Merges autolinking options from different sources (the later the higher priority)
 * - options defined in package.json's `expoModules` field
 * - platform-specific options from the above (e.g. `expoModules.ios`)
 * - options provided to the CLI command
 */
export declare function mergeLinkingOptionsAsync<OptionsType extends SearchOptions>(providedOptions: OptionsType): Promise<OptionsType>;
/**
 * Verifies the search results by checking whether there are no duplicates.
 */
export declare function verifySearchResults(searchResults: SearchResults): number;
/**
 * Resolves search results to a list of platform-specific configuration.
 */
export declare function resolveModulesAsync(searchResults: SearchResults, options: ResolveOptions): Promise<ModuleDescriptor[]>;
/**
 * Generates a source file listing all packages to link.
 * Right know it works only for Android platform.
 */
export declare function generatePackageListAsync(modules: ModuleDescriptor[], options: GenerateOptions): Promise<void>;
