const deepmerge = require("deepmerge");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const prettier = require("prettier");
const MESSAGES = require("./messages");

const DEFAULT_CONFIG = {
  extractTo: {
    css: true,
    js: true,
  },
};

module.exports = class Breakpoints {
  /**
   * @type {object}
   * @property {object} paths - Relativ to the themes root folder ...
   * @property {string} paths.breakpoints - ...path to drupals breakpoint file
   * @property {string} paths.css - ...path to your final css file
   * @property {string} paths.js - ...path to your final js file
   * @property {string} themeName - Drupals custom theme name
   * @property {string} extractTo -
   * @property {boolean} [js] - (default true), should generate js file?
   * @property {boolean} [css] - (default true), should generate css file?
   */
  #userConfig;

  /**
   * @typedef {object} BREAKPOINT
   * @property {string} label -
   * @property {string} mediaQuery -
   * @property {number} weight -
   * @property {string[]} multipliers -
   * @property {string} [group] -
   */

  /**
   * @type {Object<string, BREAKPOINT>}
   */
  #breakpoints;

  /**
   * @type {string[]}
   */
  #groups;

  /**
   * @type {Map<string, BREAKPOINT[]>}
   */
  #breakpointsMap;

  /**
   * @type {Array}
   */
  #customProperties;

  /**
   * @type {string}
   */
  #userConfigName;

  /**
   *
   */
  constructor() {
    this.#userConfig = {};
    this.#breakpoints = {};
    this.#breakpointsMap = new Map();
    this.#customProperties = [];
    this.#groups = [];
    this.#userConfigName = ".breakpoints.yml";
    this.#init();
  }

  /**
   * Calls all necessary methods
   */
  #init() {
    this.#getUserConfig();
    this.#getBreakpoints();
    this.#getGroups();
    this.#setGroupedBreakpoints();
    this.#generateCustomProperties();
    if (this.#userConfig.extractTo?.css) {
      this.#generateAndWriteCSS();
    }
    if (this.#userConfig.extractTo?.js) {
      this.#generateAndWriteJS();
    }
  }

  /**
   * Receives the userConfig
   */
  #getUserConfig() {
    const userConfigPath = path.resolve(process.cwd(), this.#userConfigName);
    try {
      this.#userConfig = deepmerge(
        DEFAULT_CONFIG,
        Breakpoints.readYamlFile(userConfigPath)
      );
      if (!this.#userConfig.extractTo?.css && !this.#userConfig.extractTo?.js) {
        console.warn(MESSAGES.noOutput(this.#userConfig));
      }
    } catch (error) {
      console.error(MESSAGES.userConfig(userConfigPath));
    }
  }

  /**
   * Read drupals breakpoints file
   */
  #getBreakpoints() {
    const breakpointsPath = path.resolve(
      process.cwd(),
      this.#userConfig.paths.breakpoints
    );
    try {
      this.#breakpoints = Breakpoints.readYamlFile(breakpointsPath);
    } catch (error) {
      console.error(MESSAGES.breakpoints(breakpointsPath));
    }
  }

  /**
   * Extract unique groups from breakpoints file
   */
  #getGroups() {
    this.#groups = [
      ...new Set(
        Object.values(this.#breakpoints)
          .map((options) => {
            if (options.group) {
              return options.group;
            }
            return this.#userConfig.themeName;
          })
          .sort()
      ),
    ];
  }

  /**
   * Generate Map with unique groups and their breakpoints
   */
  #setGroupedBreakpoints() {
    this.#groups.forEach((group) => {
      if (group === this.#userConfig.themeName) {
        this.#breakpointsMap.set(
          group,
          Object.values(this.#breakpoints).filter(
            (options) =>
              !options.group || options.group === this.#userConfig.themeName
          )
        );
      } else {
        this.#breakpointsMap.set(
          group,
          Object.values(this.#breakpoints).filter(
            (options) => options.group === group
          )
        );
      }
    });
  }

  /**
   * Generate array with all custom properties
   *
   * --ThemeName/Group-label-query
   * --ThemeName/Group-label-minWidth
   * --ThemeName/Group-label-maxWidth
   * --ThemeName/Group-label-resolution
   */
  #generateCustomProperties() {
    this.#breakpointsMap.forEach((options, group) => {
      options.forEach((option) => {
        const baseName = `${Breakpoints.convertToPascalCaseish(
          group
        )}-${option.label.replace(/\s+/g, "").toLowerCase()}`;
        this.#customProperties.push(
          {
            identifier: `${baseName}-query`,
            value: option.mediaQuery,
          },
          {
            identifier: `${baseName}-resolution`,
            value: Breakpoints.getResolutions(option),
          }
        );
        if (Breakpoints.getMinWidths(option).length) {
          this.#customProperties.push({
            identifier: `${baseName}-minWidth`,
            value: Breakpoints.getMinWidths(option),
          });
        }
        if (Breakpoints.getMaxWidths(option).length) {
          this.#customProperties.push({
            identifier: `${baseName}-maxWidth`,
            value: Breakpoints.getMaxWidths(option),
          });
        }
      });
    });
  }

  /**
   * Generate, format and write the CSS file
   */
  #generateAndWriteCSS() {
    const filePath = path.resolve(process.cwd(), this.#userConfig.paths.css);
    let string = "";
    this.#customProperties.forEach((customProperty) => {
      string += `--${customProperty.identifier}: "${customProperty.value}";`;
    });
    Breakpoints.writeFile(
      filePath,
      prettier.format(`html {${string}}`, { parser: "css" }),
      () => console.error(MESSAGES.writeCSSFile(filePath))
    );
  }

  /**
   * Generate, format and write the JS file
   */
  #generateAndWriteJS() {
    const filePath = path.resolve(process.cwd(), this.#userConfig.paths.js);
    let string = "";
    this.#customProperties.forEach((customProperty) => {
      string += `"${customProperty.identifier}": "${customProperty.value}",`;
    });
    Breakpoints.writeFile(
      filePath,
      prettier.format(
        `const BREAKPOINTS = {${string}}; export default BREAKPOINTS;`,
        { parser: "babel" }
      ),
      () => console.error(MESSAGES.writeJSFile(filePath))
    );
  }

  /**
   * Parse mediaQuery to extract min-widths values
   *
   * @param {object} options -
   * @returns {Array}
   */
  static getMinWidths(options) {
    return [
      ...options.mediaQuery.matchAll(/min-width:\s*(\d+(\.\d+)?\s*(rem|px))/g),
    ].map((match) => match[1]);
  }

  /**
   * Parse mediaQuery to extract max-widths values
   *
   * @param {object} options
   * @returns {Array}
   */
  static getMaxWidths(options) {
    return [
      ...options.mediaQuery.matchAll(/max-width:\s*(\d+(\.\d+)?\s*(rem|px))/g),
    ].map((match) => match[1]);
  }

  /**
   * Read multipliers and return last one or 1x
   * Ref: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution#units
   *
   * @param {object} options
   * @returns {string[]} -
   */
  static getResolutions(options) {
    if (!options.multipliers || !options.multipliers.length) {
      return ["1x"];
    }
    return [[...options.multipliers].sort().pop()];
  }

  /**
   * Convert a given string to a PascalCaseish format (without using a
   * dictionary is basically impossible)
   *
   * @param {string} string -
   * @returns {string}
   */
  static convertToPascalCaseish(string) {
    return string
      .replace(/\s+/g, "")
      .split("_")
      .map((subString) =>
        subString
          .replace(
            /\w+/g,
            (word) => word[0].toUpperCase() + word.slice(1).toLowerCase()
          )
          .replace(".", "-")
      )
      .join("");
  }

  /**
   * Writes the css/js file
   *
   * @param {string} filePath -
   * @param {string} content -
   * @param {Function} handleError -
   */
  static writeFile(filePath, content, handleError) {
    fs.writeFile(filePath, content, (error) => {
      if (error !== null) {
        handleError();
      }
    });
  }

  /**
   * Load yaml file
   *
   * @param {string} filePath
   * @returns {object}
   */
  // eslint-disable-next-line consistent-return
  static readYamlFile(filePath) {
    try {
      return yaml.load(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
      console.warn(MESSAGES.readFile(filePath));
    }
  }
};
