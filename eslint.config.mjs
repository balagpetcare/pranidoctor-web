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
  // Backend-proxy type stubs — archived web DB layer; types stay loose until backend OpenAPI.
  {
    files: [
      "src/lib/admin-ai-technician-applications/**/*.ts",
      "src/lib/admin-ai-technicians/technician-admin-service.ts",
      "src/lib/admin-doctors/**/*.ts",
      "src/lib/admin-service-requests/**/*.ts",
      "src/lib/doctor-service-requests/doctor-*-service.ts",
      "src/lib/technician-service-requests/**/*.ts",
      "src/lib/knowledge-hub/service.ts",
      "src/lib/locations/location-hierarchy-validation.ts",
      "src/lib/locations/location-master-admin.ts",
      "src/lib/locations/location-master-service.ts",
      "src/lib/mobile-*/**/*.ts",
      "src/lib/notifications/**/*.ts",
      "src/lib/service-instances/*-service.ts",
      "src/lib/storage/upload-download.ts",
      "src/lib/storage/upload-service.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
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
    // Legacy modules excluded from tsconfig (see tsconfig.json exclude).
    "scripts/**",
    "src/lib/feed/**",
    "src/lib/livestock/**",
  ]),
]);

export default eslintConfig;
