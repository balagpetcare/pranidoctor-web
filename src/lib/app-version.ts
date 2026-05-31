import packageJson from "../../package.json";

/** Web app semver shown on public auth surfaces (admin login, etc.). */
export const APP_VERSION = packageJson.version;
