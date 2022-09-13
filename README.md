# [Drupal](https://www.11ty.dev) Breakpoints to CSS

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
 */
```

## Usage

Just run `yarn drupal-breakpoints-css start` or `npm run drupal-breakpoints-css start`. Thats it :)

## Acknowledgements

This **Script** uses open source software and would not have been possible without the excellent work of the [Drupal](https://www.drupal.org), [Eslint](https://babeljs.io/team), [Prettier](https://unifiedjs.com/community/member/) and [debug-js](https://github.com/debug-js/debug) teams! Thanks a lot!

## Sponsored by

<a href="https://factorial.io"><img src="https://logo.factorial.io/color.png" width="40" height="56" alt="Factorial"></a>
