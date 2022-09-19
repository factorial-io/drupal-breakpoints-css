const deepmerge = require("deepmerge");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
const prettier = require("prettier");
const UNITS = require("./units");
const DEFAULT_CONFIG = require("./defaultConfig");
const MESSAGES = require("./messages");

module.exports = class Breakpoints {
  /**
   * @type {import('./types').Config}
   */
  #defaultConfig = DEFAULT_CONFIG;

  /**
   * @type {import('./types').Config}
   */
  #config;

  /**
   * @typedef {import("./types").Breakpoint} Breakpoint
   */
  /**
   * @type {Object<string, Breakpoint>}
   */
  #breakpoints = {};

  /**
   * @type {string[]}
   */
  #groups = [];

  /**
   * @type {Map<string, Breakpoint[]>}
   */
  #breakpointsMap = new Map();

  /**
   * @type {import("./types").customProperty[]}
   */
  #customProperties = [];

  /**
   * @type {string}
   */
  #configName = "breakpoints.config.yml";

  /**
   *
   */
  constructor() {
    this.#init();
  }

  /**
   * Calls all necessary methods
   */
  #init() {
    this.#getUserConfig();
    const isValid = this.#isValidUserConfig();
    if (!isValid) {
      return;
    }
    this.#getBreakpoints();
    this.#getGroups();
    this.#setGroupedBreakpoints();
    this.#generateCustomProperties();
    if (this.#config.css?.enabled) {
      this.#generateAndWriteCSS();
    }
    if (this.#config.js?.enabled) {
      this.#generateAndWriteJS();
    }
  }

  /**
   * Receives the userConfig
   */
  #getUserConfig() {
    const userConfigPath = path.resolve(process.cwd(), this.#configName);
    try {
      this.#config = deepmerge(
        this.#defaultConfig,
        Breakpoints.readYamlFile(userConfigPath)
      );
    } catch (error) {
      console.error(MESSAGES.userConfig(userConfigPath));
    }
  }

  /**
   * Checks if config is valid
   *
   * @returns {boolean}
   */
  #isValidUserConfig() {
    if (
      !this.#config.drupal?.path ||
      (!this.#config.css?.enabled && !this.#config.js?.enabled) ||
      !Object.values(this.#config.options).includes(true)
    ) {
      console.error(MESSAGES.noOutput(this.#config));
      return false;
    }
    if (!this.#config.drupal?.themeName) {
      console.warn(MESSAGES.defaultThemeName());
    }
    return true;
  }

  /**
   * Read drupals breakpoints file
   */
  #getBreakpoints() {
    const breakpointsPath = path.resolve(
      process.cwd(),
      this.#config.drupal.path
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
            return this.#config.drupal.themeName;
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
      if (group === this.#config.drupal.themeName) {
        this.#breakpointsMap.set(
          group,
          Object.values(this.#breakpoints).filter(
            (options) =>
              !options.group || options.group === this.#config.drupal.themeName
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
   */
  #generateCustomProperties() {
    this.#breakpointsMap.forEach((options, group) => {
      options.forEach((option) => {
        const baseName = `${Breakpoints.convertToPascalCaseish(
          group
        )}-${option.label.replace(/\s+/g, "").toLowerCase()}`;
        if (this.#config.options.mediaQuery) {
          this.#customProperties.push({
            identifier: `${baseName}-mediaQuery`,
            value: option.mediaQuery,
          });
        }
        if (
          this.#config.options.resolution &&
          Breakpoints.getResolutions(option)
        ) {
          this.#customProperties.push({
            identifier: `${baseName}-resolution`,
            value: Breakpoints.getResolutions(option),
          });
        }
        if (this.#config.options.minWidth && Breakpoints.getMinWidths(option)) {
          this.#customProperties.push({
            identifier: `${baseName}-minWidth`,
            value: Breakpoints.getMinWidths(option),
          });
        }
        if (this.#config.options.maxWidth && Breakpoints.getMaxWidths(option)) {
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
    const filePath = path.resolve(process.cwd(), this.#config.css.path);
    let string = "";
    this.#customProperties.forEach((customProperty) => {
      string += `--${customProperty.identifier}: "${customProperty.value}";`;
    });
    Breakpoints.writeFile(
      filePath,
      prettier.format(`${this.#config.css.element} {${string}}`, {
        parser: "css",
      }),
      () => console.error(MESSAGES.writeCSSFile(filePath))
    );
  }

  /**
   * Generate, format and write the JS file
   */
  #generateAndWriteJS() {
    const filePath = path.resolve(process.cwd(), this.#config.js.path);
    const strings = this.#customProperties.map(
      (customProperty) =>
        `"${customProperty.identifier}": "${customProperty.value}"`
    );
    if (this.#config.js.type === "module") {
      Breakpoints.writeFile(
        filePath,
        prettier.format(
          `const BREAKPOINTS = {${strings.join(
            ","
          )}}; export default BREAKPOINTS;`,
          { parser: "babel" }
        ),
        () => console.error(MESSAGES.writeJSFile(filePath))
      );
    } else {
      Breakpoints.writeFile(
        filePath,
        prettier.format(`module.exports = {${strings.join(",")}};`, {
          parser: "babel",
        }),
        () => console.error(MESSAGES.writeJSFile(filePath))
      );
    }
  }

  /**
   * Parse mediaQuery to extract min-widths values
   *
   * @param {object} option -
   * @returns {string}
   */
  static getMinWidths(option) {
    const regex = new RegExp(
      `min-width:\\s*((\\d+(\\.\\d+)?)\\s*(${UNITS.length.join("|")}))`,
      "g"
    );
    const width = [...option.mediaQuery.matchAll(regex)][0];
    if (!width) {
      return "";
    }
    if (!Number.isFinite(width[2]) && !UNITS.length.includes(width[4])) {
      throw new RangeError(MESSAGES.widthRangeError(option));
    }
    return width[2] + width[4];
  }

  /**
   * Parse mediaQuery to extract max-widths values
   *
   * @param {object} option
   * @returns {string}
   */
  static getMaxWidths(option) {
    const regex = new RegExp(
      `max-width:\\s*((\\d+(\\.\\d+)?)\\s*(${UNITS.length.join("|")}))`,
      "g"
    );
    const width = [...option.mediaQuery.matchAll(regex)][0];
    if (!width) {
      return "";
    }
    if (!Number.isFinite(width[2]) && !UNITS.length.includes(width[4])) {
      throw new RangeError(MESSAGES.widthRangeError(option));
    }
    return width[2] + width[4];
  }

  /**
   * Read multipliers and return last one or 1x
   * Ref: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution#units
   *
   * @param {object} option
   * @returns {string} -
   */
  static getResolutions(option) {
    if (!option.multipliers || !option.multipliers.length) {
      return "1x";
    }
    const largestResolution = [...option.multipliers].sort().pop();
    const regex = new RegExp(`(\\d+)\\s*(${UNITS.resolution.join("|")})`);
    const resolution = [...largestResolution.matchAll(regex)][0];
    if (!resolution) {
      return "";
    }
    if (
      !Number.isFinite(resolution[1]) &&
      !UNITS.resolution.includes(resolution[2])
    ) {
      throw new RangeError(MESSAGES.resolutionRangeError(option));
    }
    return resolution[1] + resolution[2];
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
