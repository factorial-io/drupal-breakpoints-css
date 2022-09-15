/**
 * @typedef {object} USER_CONFIG
 * @property {object} drupal - Drupal settings
 * @property {string} drupal.path - Path to the breakpoint file relative to themes root folder
 * @property {string} drupal.themeName - Current drupal theme name
 * @property {object} js - Javascript settings
 * @property {boolean} js.enabled - Toggle js file generation
 * @property {string} js.path - JS path relative to themes root folder
 * @property {boolean} js.es6 - Generate export default or module.exports
 * @property {object} css - Stylesheet settings
 * @property {boolean} css.enabled - Toggle css file generation
 * @property {string} css.path - CSS path relative to themes root folder
 * @property {string} css.element - Selector to apply the customProperties
 * @property {object} options - Toggle available options
 * @property {boolean} options.mediaQuery - Toggle mediaQuery extraction
 * @property {boolean} options.resolution - Toggle resolution extraction
 * @property {boolean} options.minWidth - Toggle minWidth extraction
 * @property {boolean} options.maxWidth - Toggle maxWidth extraction
 */
/**
 * @typedef {object} BREAKPOINT - Please see https://www.drupal.org/docs/theming-drupal/working-with-breakpoints-in-drupal#s-breakpoint
 * @property {string} label - Human readable label for the breakpoint
 * @property {string} mediaQuery - Media query text proper, e.g. 'all and (min-width: 851px)'
 * @property {number} weight - Positional weight (order) for the breakpoint
 * @property {string[]} multipliers - Supported pixel resolution multipliers
 * @property {string} [group] - Optional breakpoints could be organized into groups
 */

module.exports = {};
