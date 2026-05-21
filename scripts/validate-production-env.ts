#!/usr/bin/env node
/**
 * Deploy-pipeline guard: fail when production env is misconfigured.
 * Usage: npm run validate:production-env
 */
import "dotenv/config";

import {
  formatProductionEnvValidation,
  validateProductionEnv,
} from "../src/lib/env/production-validation.ts";

const result = validateProductionEnv(process.env);
const output = formatProductionEnvValidation(result);
if (result.ok) {
  console.log(output);
  if (result.warnings.length > 0) {
    process.exitCode = 0;
  }
} else {
  console.error(output);
  process.exitCode = 1;
}
