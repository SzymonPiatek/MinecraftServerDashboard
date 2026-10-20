import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { prettierConfig, sharedRules } from "../../eslint.config.base.mjs";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  sharedRules,
  prettierConfig,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
