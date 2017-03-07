import fs from 'fs';
import semver from 'semver';
import colors from 'colors';
import logger from 'hookable-logger';
import PathHelpers from 'meteor-build-plugin-helper-path-helpers';

const VERSION_RESULT={
  SATISFIED: 0,
  MISMATCH: 1,
  MISSING: 2
}
export default function checkNpmPackage(packageWithVersion, requestor, suppressLogs = true) {
  const [ packageName, packageVersion ] = packageWithVersion.split('@');

  if (!verifyPackageExists(packageName, packageVersion, requestor)) {
    if (!suppressLogs)
      logger.error(colors.red.bold(`Error checking npm package: ${packageName}@${packageVersion} (requested by ${requestor}): package not found. Please ensure you have installed the package; here is the command:\n meteor npm install ${packageName}@${packageVersion} --save-dev\n or \n meteor yarn ${packageName}@${packageVersion}`));
    return false;
  }

  const versionCheck = checkNpmVersion(packageName, packageVersion, requestor);
  if (versionCheck.result === VERSION_RESULT.MISSING) {
    if (!suppressLogs)
      logger.error(colors.red.bold(`Error checking package: ${packageName}@${packageVersion} (requested by ${requestor}): ${versionCheck.err.message}`));
    return false;
  }
  if (versionCheck.result === VERSION_RESULT.MISMATCH) {
    if (!suppressLogs)
      logger.warn(colors.yellow.bold(`WARNING: version mismatch for ${packageName}; installed version is ${versionCheck.currentVersion}, but version ${packageVersion} is requested by ${requestor})`));
  }

  return true;
}

function verifyPackageExists(packageName) {
  const packagePath = `${PathHelpers.basePath}/node_modules/${packageName}`;
  const doesPackageExist = fs.existsSync(packagePath);

  return doesPackageExist;
}

function checkNpmVersion(name, actualVersion, requestor) {
  try {
    const currentVersion = require(`${name}/package.json`).version;
    if (semver.satisfies(currentVersion, actualVersion)) {
      return {result: VERSION_RESULT.SATISFIED};
    } else {
      return {result: VERSION_RESULT.MISMATCH, currentVersion};
    }
  } catch (err) {
    return {result: VERSION_RESULT.MISSING, err};
  }
}

