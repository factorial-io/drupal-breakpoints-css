# Drupal breakpoints to CSS

<img 
  style="margin:2rem"
  height="60px"
  alt="Drupal Logo"
  src="https://www.drupal.org/files/Wordmark_blue_RGB.png">

To eliminate the need for different places for breakpoints and only maintain a single source of truth for those, this `node_module` extracts the breakpoints defined in the currently used drupal themes breakpoint file and generates grouped `customProperties` and a separate `js` object with all necessary parameters.

If the draft `@custom-media` (See: https://www.w3.org/TR/mediaqueries-5/#at-ruledef-custom-media) or PostCSS (See: https://github.com/postcss/postcss) Custom-media (See: https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-media) plugin is already used, media queries can be written with `customProperties`. So any declaration of media queries within stylesheets is omitted and maintainability is increased.

## Installation

Install as a `devDependency` with `yarn` or `npm` like:

```sh
yarn add --dev `@factorial-io/drupal-breakpoints-css`
# or
npm install --save `@factorial-io/drupal-breakpoints-css`
```

## Configuration

In your themes root folder, besides your already defined breakpoints file from drupal, add a `.breakpoints.yml` configuration file. The following properties are mandatory:

```js
/**
 * @type {object}
 * @property {object} paths - Relativ to the themes root folder ...
 * @property {string} paths.breakpoints - ...path to drupals breakpoint file
 * @property {string} paths.css - ...path to your final css file
 * @property {string} paths.js - ...path to your final js file
 * @property {string} themeName - Drupals custom theme name
 * @property {string} extractTo
 * @property {boolean} js - (default true), should generate js file?
 * @property {boolean} css - (default true), should generate css file?
 */
```

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
/* Generated css file */
html {
  --ThemeName-small-query: "only screen and (max-width: 47.9375rem)";
  --ThemeName-small-resolution: "2x";
  --ThemeName-small-maxWidth: "47.9375rem";
  --ThemeName-medium-query: "only screen and (min-width: 48rem) and (max-width: 63.9375rem)";
  --ThemeName-medium-resolution: "2x";
  --ThemeName-medium-minWidth: "48rem";
  --ThemeName-medium-maxWidth: "63.9375rem";
  --ThemeName-Group-large-query: "only screen and (min-width: 64rem) and (max-width: 89.9375rem)";
  --ThemeName-Group-large-resolution: "2x";
  --ThemeName-Group-large-minWidth: "64rem";
  --ThemeName-Group-large-maxWidth: "89.9375rem";
}
```

```js
// Generated js file
const BREAKPOINTS = {
  "ThemeName-small-query": "only screen and (max-width: 47.9375rem)",
  "ThemeName-small-resolution": "2x",
  "ThemeName-small-maxWidth": "47.9375rem",
  "ThemeName-medium-query":
    "only screen and (min-width: 48rem) and (max-width: 63.9375rem)",
  "ThemeName-medium-resolution": "2x",
  "ThemeName-medium-minWidth": "48rem",
  "ThemeName-medium-maxWidth": "63.9375rem",
  "ThemeName-Group-large-query":
    "only screen and (min-width: 64rem) and (max-width: 89.9375rem)",
  "ThemeName-Group-large-resolution": "2x",
  "ThemeName-Group-large-minWidth": "64rem",
  "ThemeName-Group-large-maxWidth": "89.9375rem",
};
export default BREAKPOINTS;
```

## Acknowledgements

This **Script** uses open source software and would not have been possible without the excellent work of the [Drupal](https://www.drupal.org), [Eslint](https://babeljs.io/team), [Prettier](https://unifiedjs.com/community/member/) and [debug-js](https://github.com/debug-js/debug) teams! Thanks a lot!

## Sponsored by

<a href="https://factorial.io"><img src="https://logo.factorial.io/color.png" width="40" height="56" alt="Factorial"></a>
