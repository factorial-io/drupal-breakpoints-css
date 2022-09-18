/**
 * The <length> CSS data type consists of a <number> followed by
 * one of those units listed below
 *
 * Ref: https://developer.mozilla.org/en-US/docs/Web/CSS/@media
 * Ref: https://developer.mozilla.org/en-US/docs/Web/CSS/number
 * Ref: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 *
 * The <resolution> CSS data type consists of a <number> followed by
 * one of those units listed below
 *
 * Ref: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 *
 * @type {import("./types").units}
 */
module.exports = {
  length: [
    "cap",
    "ch",
    "em",
    "ex",
    "ic",
    "lh",
    "rem",
    "rlh",
    "vh",
    "vw",
    "vmax",
    "vmin",
    "vb",
    "vi",
    "px",
    "cm",
    "mm",
    "Q",
    "in",
    "pc",
    "pt",
    "%",
  ],
  resolution: ["dpi", "dpcm", "dppx", "x"],
};
