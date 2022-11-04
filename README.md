# Drupal breakpoints to CSS

<img 
  style="margin:2rem"
  height="60px"
  alt="Drupal Logo"
  src="https://www.drupal.org/files/Wordmark_blue_RGB.png">

To eliminate the need for different places for breakpoints and only maintain a single source of truth for those, this `node_module` extracts the breakpoints defined in the currently used Drupal themes breakpoint file and generates grouped `customProperties` and a separate `js` object with all necessary parameters.

If the draft [`@custom-media`](https://www.w3.org/TR/mediaqueries-5/#at-ruledef-custom-media) or [PostCSS](https://github.com/postcss/postcss) with [Custom-Media](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-media) plugin is already used, media queries can be written with `customProperties`. So any declaration of media queries within stylesheets is omitted and maintainability is increased.

## Installation

Install as a `devDependency` with `yarn` or `npm` like:

```sh
yarn add --dev `@factorial-io/drupal-breakpoints-css`
# or
npm install --sav-dev `@factorial-io/drupal-breakpoints-css`
```

## Configuration

In your themes root folder, besides your already defined breakpoints file from Drupal, add a `breakpoints.config.yml` configuration file. The following properties are mandatory:

```typescript
// ./lib/types.d.ts
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
  };
  options?: {
    mediaQuery?: boolean;
    resolution?: boolean;
    minWidth?: boolean;
    maxWidth?: boolean;
  };
}
```

### Schema Validation

You could validate your configuration files with the help of [JSON Schema Store](https://www.schemastore.org/json) and e.g [Visual Studio Code](https://code.visualstudio.com/) [YAML Extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).

### Prettier

To respect your local prettier formatting rules please add the path to the configuration file to `prettier.path`.

## Usage

Just run `yarn drupal-breakpoints-css start` or `npm run drupal-breakpoints-css start`. Thats it :)

## Examples

```yml
# Durpal breakpoints file
theme_name.s:
  label: small
  mediaQuery: "only screen and (max-width: 47.9375rem)"
  weight: 0
  multipliers:
    - 1x
    - 2x
theme_name.md:
  label: medium
  mediaQuery: "only screen and (min-width: 48rem) and (max-width: 63.9375rem)"
  weight: 2
  multipliers:
    - 1x
    - 2x
theme_name.lg:
  label: large
  mediaQuery: "only screen and (min-width: 64rem) and (max-width: 89.9375rem)"
  weight: 3
  group: theme_name.group
  multipliers:
    - 1x
    - 2x
```

```css
/* Generated CSS file */
@custom-media --Themename-small-mediaQuery (only screen and (max-width: 47.9375rem));
@custom-media --Themename-small-resolution (2x);
@custom-media --Themename-small-maxWidth (47.9375rem);
@custom-media --Themename-medium-mediaQuery (only screen and (min-width: 48rem) and (max-width: 63.9375rem));
@custom-media --Themename-medium-resolution (2x);
@custom-media --Themename-medium-minWidth (48rem);
@custom-media --Themename-medium-maxWidth (63.9375rem);
@custom-media --Themename-large-mediaQuery (only screen and (min-width: 64rem) and (max-width: 89.9375rem));
@custom-media --Themename-large-resolution (2x);
@custom-media --Themename-large-minWidth (64rem);
@custom-media --Themename-large-maxWidth (89.9375rem);

/* or with customMedia disabled */
:root {
  --ThemeName-small-mediaQuery: "only screen and (max-width: 47.9375rem)";
  --ThemeName-small-resolution: "2x";
  --ThemeName-small-maxWidth: "47.9375rem";
  --ThemeName-medium-mediaQuery: "only screen and (min-width: 48rem) and (max-width: 63.9375rem)";
  --ThemeName-medium-resolution: "2x";
  --ThemeName-medium-minWidth: "48rem";
  --ThemeName-medium-maxWidth: "63.9375rem";
  --ThemeName-Group-large-mediaQuery: "only screen and (min-width: 64rem) and (max-width: 89.9375rem)";
  --ThemeName-Group-large-resolution: "2x";
  --ThemeName-Group-large-minWidth: "64rem";
  --ThemeName-Group-large-maxWidth: "89.9375rem";
}
```

```js
// Generated JS file
const BREAKPOINTS = {
  "ThemeName-small-mediaQuery": "only screen and (max-width: 47.9375rem)",
  "ThemeName-small-resolution": "2x",
  "ThemeName-small-maxWidth": "47.9375rem",
  "ThemeName-medium-mediaQuery":
    "only screen and (min-width: 48rem) and (max-width: 63.9375rem)",
  "ThemeName-medium-resolution": "2x",
  "ThemeName-medium-minWidth": "48rem",
  "ThemeName-medium-maxWidth": "63.9375rem",
  "ThemeName-Group-large-mediaQuery":
    "only screen and (min-width: 64rem) and (max-width: 89.9375rem)",
  "ThemeName-Group-large-resolution": "2x",
  "ThemeName-Group-large-minWidth": "64rem",
  "ThemeName-Group-large-maxWidth": "89.9375rem",
};
export default BREAKPOINTS;
```

## Acknowledgements

This **Script** uses open source software and would not have been possible without the excellent work of the [Drupal](https://www.drupal.org), [Eslint](https://babeljs.io/team), [deepmerge](https://github.com/TehShrike/deepmerge) and [Prettier](https://unifiedjs.com/community/member/) teams! Thanks a lot!

## Sponsored by

<a href="https://factorial.io"><img src="https://logo.factorial.io/color.png" width="40" height="56" alt="Factorial"></a>
