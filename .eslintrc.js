module.exports = {
  root: true,
  ignorePatterns: [".eslintrc.js"],
  extends: [
    "airbnb-base",
    "plugin:prettier/recommended",
    "plugin:jsdoc/recommended",
  ],
  plugins: ["prettier", "jsdoc"],
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {
    "prettier/prettier": "error",
    "no-use-before-define": ["error", { functions: false }],
    "no-console": ["error", { allow: ["warn", "error"] }],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
        optionalDependencies: true,
        peerDependencies: true,
      },
    ],
    "jsdoc/require-jsdoc": [
      "warn",
      {
        require: {
          MethodDefinition: true,
        },
      },
    ],
    "jsdoc/require-param-description": 0,
    "jsdoc/require-returns-description": 0,
  },
};
