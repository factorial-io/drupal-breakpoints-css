const UNITS = require("./units");

module.exports = {
  maxWidth: `max-width:\\s*((\\d+(\\.\\d+)?)\\s*(${UNITS.length.join("|")}))`,
  minWidth: `min-width:\\s*((\\d+(\\.\\d+)?)\\s*(${UNITS.length.join("|")}))`,
  resolution: `(\\d+)\\s*(${UNITS.resolution.join("|")})`,
};
