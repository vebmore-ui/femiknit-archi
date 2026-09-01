import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  {
    ignores: [
      "build/**",
      "dist/**",
      "node_modules/**",
    ],
  },
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
      },
    },
    plugins: {
      react,
      "react-compiler": reactCompiler,
      "react-hooks": reactHooks,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react-compiler/react-compiler": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "error",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "error",
      "react-hooks/purity": "error",
    },
  },
]);

export default eslintConfig;
