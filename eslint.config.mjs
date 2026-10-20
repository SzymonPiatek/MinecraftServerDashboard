import globals from "globals";
import tseslint from "typescript-eslint";
import { baseConfig, prettierConfig } from "./eslint.config.base.mjs";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/.next/**", "**/.turbo/**", "apps/api/src/generated/**", "apps/web/**"] },
  ...baseConfig,
  { languageOptions: { globals: globals.node } },
  prettierConfig,
);
