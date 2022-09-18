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
   *
   * @async
   */
  async #init() {
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
      await this.#generateAndWriteCSS();
    }
    if (this.#config.js?.enabled) {
      await this.#generateAndWriteJS();
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
        Breakpoints.readAndParseYamlConfiguration(userConfigPath)
      );
    } catch (error) {
      console.error(MESSAGES.userConfig(userConfigPath));
    }
  }

  /**
   * Checks if config is valid
   *
   * @returns {boolean} - true if this is a valid userConfig
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
    if (this.#config.drupal?.themeName === DEFAULT_CONFIG.drupal.themeName) {
      console.warn(MESSAGES.defaultThemeName(DEFAULT_CONFIG.drupal.themeName));
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
      this.#breakpoints =
        Breakpoints.readAndParseYamlConfiguration(breakpointsPath);
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
   *
   * @async
   */
  async #generateAndWriteCSS() {
    const filePath = path.resolve(process.cwd(), this.#config.css.path);
    let string = "";
    this.#customProperties.forEach((customProperty) => {
      string += `--${customProperty.identifier}: "${customProperty.value}";`;
    });
    const prettierConfig = this.#config.prettier?.path
      ? await Breakpoints.getPrettierConfig(this.#config.prettier?.path)
      : {};
    await Breakpoints.writeFile(
      filePath,
      prettier.format(`${this.#config.css.element} {${string}}`, {
        ...prettierConfig,
        parser: "css",
      })
    );
  }

  /**
   * Generate, format and write the JS file
   *
   * @async
   */
  async #generateAndWriteJS() {
    const filePath = path.resolve(process.cwd(), this.#config.js.path);
    const strings = this.#customProperties.map(
      (customProperty) =>
        `"${customProperty.identifier}": "${customProperty.value}"`
    );
    const prettierConfig = this.#config.prettier?.path
      ? await Breakpoints.getPrettierConfig(this.#config.prettier?.path)
      : {};
    if (this.#config.js.type === "module") {
      await Breakpoints.writeFile(
        filePath,
        prettier.format(
          `const BREAKPOINTS = {${strings.join(
            ","
          )}}; export default BREAKPOINTS;`,
          {
            ...prettierConfig,
            parser: "babel",
          }
        )
      );
    } else {
      await Breakpoints.writeFile(
        filePath,
        prettier.format(`module.exports = {${strings.join(",")}};`, {
          ...prettierConfig,
          parser: "babel",
        })
      );
    }
  }

  /**
   *
   * @static
   * @async
   * @param {string} filePath - Path to prettier config relative to the themes root folder
   * @returns {Promise} - Prettier Config Promise
   */
  static async getPrettierConfig(filePath) {
    try {
      return await prettier.resolveConfig(filePath, { useCache: false });
    } catch (error) {
      console.error(MESSAGES.prettierConfig(filePath));
    }
    return false;
  }

  /**
   * Parse mediaQuery to extract min-widths values
   *
   * @static
   * @param {object} option - Breakpoints media query
   * @returns {string} - Min-Width or empty string
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
   * @static
   * @param {object} option - Breakpoints media query
   * @returns {string} - Max-Width or empty string
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
   * @static
   * @param {object} option - Breakpoints media query
   * @returns {string} - Actual defined resolution or 1x
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
   * @static
   * @param {string} string - String to convert to pascalish
   * @returns {string} - Pascalish string
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
   * @static
   * @async
   * @param {string} filePath - FilePath
   * @param {string} content - Content to write to file
   * @returns {Promise} - Promise
   */
  static async writeFile(filePath, content) {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    return fs.promises.writeFile(filePath, content);
  }

  /**
   * Load yaml file
   *
   * @static
   * @param {string} filePath - Path to load the configuration from
   * @returns {object} - The parsed configuration
   */
  // eslint-disable-next-line consistent-return
  static readAndParseYamlConfiguration(filePath) {
    try {
      return yaml.load(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
      console.warn(MESSAGES.readFile(filePath));
    }
  }
};
