module.exports = {
  drupal: {
    breakpointsPath: "",
    themeName: "",
  },
  js: {
    enabled: true,
    path: "./breakpoints.js",
    type: "module",
  },
  css: {
    enabled: true,
    path: "./breakpoints.css",
    element: ":root",
    customMedia: true,
    customProperty: true,
  },
  options: {
    mediaQuery: true,
    resolution: true,
    minWidth: true,
    maxWidth: true,
  },
};
