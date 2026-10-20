import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/** Project-wide rule overrides; usable on top of any preset that already registers typescript-eslint. */
export const sharedRules = {
  rules: {
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  },
};

/** Presets for plain TypeScript packages. Apps with their own TS preset (e.g. Next) use `sharedRules` instead. */
export const baseConfig = [js.configs.recommended, ...tseslint.configs.recommended, sharedRules];

export const prettierConfig = prettier;
