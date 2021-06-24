export type PageMetadata = {
  title: string;
  description?: string;
  sourceCodeUrl?: string;
  maxHeadingDepth?: number;
  /* If the page should not show up in the Algolia Docsearch results */
  hideFromSearch?: boolean;
  hideTOC?: boolean;
  headings?: {
    title?: string;
    level?: number;
    type?: string;
    _processed?: boolean; // internal HeadingManager property
  }[];
};

/**
 * Utility type. Extracts `T` type from `T[]` array.
 */
export type ElementType<T extends any[]> = T extends (infer U)[] ? U : never;

export type Url = {
  pathname: string;
};

export type NavigationRoute = {
  name: string;
  href: string;
  as?: string;
  weight?: number;
  sidebarTitle?: string;
  children?: NavigationRoute[];
  posts?: NavigationRoute[];
};
