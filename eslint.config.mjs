import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  globalIgnores([".codex-build/**", ".next/**"]),
  ...nextVitals,
  ...nextTs,
];

export default config;
