export interface Config {
  drupal: {
    path: string;
    themeName: string;
  };
  prettier?: {
    path: string;
  };
  js: {
    enabled: boolean;
    path: string;
    type: commonjs | module;
  };
  css: {
    enabled: boolean;
    path: string;
    element: string;
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
    path: string;
    themeName: string;
  };
  prettier?: {
    path: string;
  };
  js?: {
    enabled?: boolean;
    path?: string;
    type?: commonjs | module;
  };
  css?: {
    enabled?: boolean;
    path?: string;
    element?: string;
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
  identifier: string;
  value: string;
}

export interface units {
  length: string[];
  resolution: string[];
}
