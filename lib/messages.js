module.exports = {
  userConfig: (path) => `Couldn't read the userConfig from ${path}!`,
  breakpoints: (path) => `Couldn't read drupals breakpoints file from ${path}!`,
  writeCSSFile: (path) => `Couldn't write css file to ${path}!`,
  writeJSFile: (path) => `Couldn't write js file to ${path}!`,
  readFile: (path) => `Couldn't read from ${path} file!`,
};
