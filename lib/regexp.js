const UNITS = require("./units");

module.exports = {
  maxWidth: `min-width:\\s*((\\d+(\\.\\d+)?)\\s*(${UNITS.length.join("|")}))`,
  minWidth: `min-width:\\s*((\\d+(\\.\\d+)?)\\s*(${UNITS.length.join("|")}))`,
  resolution: `(\\d+)\\s*(${UNITS.resolution.join("|")})`,
};
