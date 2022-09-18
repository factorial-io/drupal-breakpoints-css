module.exports = {
  userConfig: (path) => `Couldn't read the userConfig from ${path}!`,
  breakpoints: (path) =>
    `Couldn't read Drupal's breakpoints file from ${path}!`,
  writeCSSFile: (path) => `Couldn't write CSS file to ${path}!`,
  writeJSFile: (path) => `Couldn't write JS file to ${path}!`,
  readFile: (path) => `Couldn't read from ${path} file!`,
  noOutput: (config) =>
    `No output with this configuration:\n${JSON.stringify(config)}`,
  defaultThemeName: (name) =>
    `Missing "userConfig.drupal.themeName". Will use "${name}" for now.`,
};
