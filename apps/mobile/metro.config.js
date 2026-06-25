// Monorepo Metro config: workspace kökünü izle + paylaşılan paketi çöz.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// @hoomies/shared "exports" alanını (TS kaynak) çözebilmek için.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
