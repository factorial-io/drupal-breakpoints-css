export interface Config {
  drupal: {
    breakpointsPath: string;
    themeName: string;
  };
  prettier?: {
    configPath: string;
  };
  js: {
    enabled: boolean;
    path: string;
    type: "commonjs" | "module";
  };
  css: {
    enabled: boolean;
    path: string;
    element: string;
    customMedia: boolean;
    customProperty: boolean;
  };
  options: {
    mediaQuery: boolean;
    resolution: boolean;
    minWidth: boolean;
    maxWidth: boolean;
  };
}

export interface UserConfig {
  drupal: {
    breakpointsPath: string;
    themeName: string;
  };
  prettier?: {
    configPath: string;
  };
  js?: {
    enabled?: boolean;
    path?: string;
    type?: "commonjs" | "module";
  };
  css?: {
    enabled?: boolean;
    path?: string;
    element?: string;
    customMedia?: boolean;
    customProperty?: boolean;
  };
  options?: {
    mediaQuery?: boolean;
    resolution?: boolean;
    minWidth?: boolean;
    maxWidth?: boolean;
  };
}

// https://www.drupal.org/docs/theming-drupal/working-with-breakpoints-in-drupal#s-breakpoint
export interface Breakpoint {
  label: string;
  mediaQuery: string;
  weight: number;
  multipliers: string[];
  group?: string;
}

export interface customProperty {
  mediaFeature: "minWidth" | "maxWidth" | "resolution" | "mediaQuery";
  name: string;
  value: string;
}

export interface units {
  length: string[];
  resolution: string[];
}
