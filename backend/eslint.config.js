import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Node.js and Express globals
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        // Express-specific
        next: "readonly",
        req: "readonly",
        res: "readonly",
      },
    },
  },
  js.configs.recommended,
  {
    plugins: {
      prettier,
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": "on",
      "prettier/prettier": "error",
    },
  },
  prettierConfig,
];
