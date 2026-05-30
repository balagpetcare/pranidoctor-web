import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/app/admin/**/*.{ts,tsx}",
      "src/components/admin/**/*.{ts,tsx}",
      "src/lib/admin/**/*.{ts,tsx}",
      "src/lib/admin-auth/**/*.{ts,tsx}",
      "src/lib/monitoring/**/*.{ts,tsx}",
      "src/components/legal/**/*.{ts,tsx}",
    ],
    rules: {
      // Admin panels intentionally fetch on mount via async loaders.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
      // Legacy admin modules — release lint gate focuses on errors.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
]);

export default eslintConfig;
