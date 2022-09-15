module.exports = {
  drupal: {
    path: "./.breakpoints.config.yml",
    themeName: "themeName",
  },
  js: {
    enabled: true,
    path: "./breakpoints.js",
    es6: true,
  },
  css: {
    enabled: true,
    path: "./breakpoints.css",
    element: ":root",
  },
  options: {
    mediaQuery: true,
    resolution: true,
    minWidth: true,
    maxWidth: true,
  },
};
