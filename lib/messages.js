module.exports = {
  breakpoints: (path) =>
    `Couldn't read Drupal's breakpoints file from ${path}!`,
  defaultThemeName: (name) =>
    `Missing "userConfig.drupal.themeName". Will use "${name}" for now.`,
  noOutput: (config) =>
    `No output with this configuration:\n${JSON.stringify(config)}`,
  prettierConfig: (path) => `Couldn't read prettier config from ${path}!`,
  readFile: (path) => `Couldn't read from ${path} file!`,
  resolutionRangeError: (option) =>
    `There is a problem parsing the resolution values from: ${JSON.stringify(
      option
    )}`,
  userConfig: (path) => `Couldn't read the userConfig from ${path}!`,
  widthRangeError: (option) =>
    `There is a problem parsing the min/max-Width values from the following mediaQuery:\n${JSON.stringify(
      option
    )}`,
  writeCSSFile: (path) => `Couldn't write CSS file to ${path}!`,
  writeJSFile: (path) => `Couldn't write JS file to ${path}!`,
};
