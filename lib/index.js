const deepmerge = require("deepmerge");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
const prettier = require("prettier");
const TYPES = require("./types");
const UNITS = require("./cssUnits");
const DEFAULT_CONFIG = require("./defaultConfig");
const MESSAGES = require("./messages");

module.exports = class Breakpoints {
  /**
   * @type {TYPES.USER_CONFIG}
   */
  #userConfig = DEFAULT_CONFIG;

  /**
   * @type {Object<string, TYPES.BREAKPOINT>}
   */
  #breakpoints = {};

  /**
   * @type {string[]}
   */
  #groups = [];

  /**
   * @type {Map<string, TYPES.BREAKPOINT[]>}
   */
  #breakpointsMap = new Map();

  /**
   * @type {Array}
   */
  #customProperties = [];

  /**
   * @type {string}
   */
  #userConfigName = "breakpoints.config.yml";

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
    this.#getBreakpoints();
    this.#getGroups();
    this.#setGroupedBreakpoints();
    this.#generateCustomProperties();
    if (this.#userConfig.css?.enabled) {
      this.#generateAndWriteCSS();
    }
    if (this.#userConfig.js?.enabled) {
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
        this.#userConfig,
        Breakpoints.readYamlFile(userConfigPath)
      );
      if (!this.#userConfig.css?.enabled && !this.#userConfig.js?.enabled) {
        console.warn(MESSAGES.noOutput(this.#userConfig));
      }
      if (Object.values(this.#userConfig.options).every((option) => option)) {
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
      this.#userConfig.drupal.path
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
            return this.#userConfig.drupal.themeName;
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
      if (group === this.#userConfig.drupal.themeName) {
        this.#breakpointsMap.set(
          group,
          Object.values(this.#breakpoints).filter(
            (options) =>
              !options.group ||
              options.group === this.#userConfig.drupal.themeName
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
        if (this.#userConfig.options.mediaQuery) {
          this.#customProperties.push({
            identifier: `${baseName}-mediaQuery`,
            value: option.mediaQuery,
          });
        }
        if (this.#userConfig.options.resolution) {
          this.#customProperties.push({
            identifier: `${baseName}-resolution`,
            value: Breakpoints.getResolutions(option),
          });
        }
        if (
          this.#userConfig.options.minWidth &&
          Breakpoints.getMinWidths(option).length
        ) {
          this.#customProperties.push({
            identifier: `${baseName}-minWidth`,
            value: Breakpoints.getMinWidths(option),
          });
        }
        if (
          this.#userConfig.options.maxWidth &&
          Breakpoints.getMaxWidths(option).length
        ) {
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
    const filePath = path.resolve(process.cwd(), this.#userConfig.css.path);
    let string = "";
    this.#customProperties.forEach((customProperty) => {
      string += `--${customProperty.identifier}: "${customProperty.value}";`;
    });
    Breakpoints.writeFile(
      filePath,
      prettier.format(`${this.#userConfig.css.element} {${string}}`, {
        parser: "css",
      }),
      () => console.error(MESSAGES.writeCSSFile(filePath))
    );
  }

  /**
   * Generate, format and write the JS file
   */
  #generateAndWriteJS() {
    const filePath = path.resolve(process.cwd(), this.#userConfig.js.path);
    const strings = this.#customProperties.map(
      (customProperty) =>
        `"${customProperty.identifier}": "${customProperty.value}"`
    );
    if (this.#userConfig.js.es6) {
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
   * @param {object} options -
   * @returns {Array}
   */
  static getMinWidths(options) {
    const regex = new RegExp(
      `min-width:\\s*(\\d+(\\.\\d+)?\\s*(${UNITS.join("|")}))`,
      "g"
    );
    return [...options.mediaQuery.matchAll(regex)].map((match) => match[1]);
  }

  /**
   * Parse mediaQuery to extract max-widths values
   *
   * @param {object} options
   * @returns {Array}
   */
  static getMaxWidths(options) {
    const regex = new RegExp(
      `max-width:\\s*(\\d+(\\.\\d+)?\\s*(${UNITS.join("|")}))`,
      "g"
    );
    return [...options.mediaQuery.matchAll(regex)].map((match) => match[1]);
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
