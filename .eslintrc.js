module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 13,
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/semi": ["error", "always", { "omitLastInOneLineBlock": true }],
    "comma-dangle": ["error", "always-multiline"],
    "eqeqeq": ["error", "always"],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "semi": "off", // conflicts with TS' semi rule; see https://github.com/typescript-eslint/typescript-eslint/issues/123
    "no-trailing-spaces": "error",
  },
};
