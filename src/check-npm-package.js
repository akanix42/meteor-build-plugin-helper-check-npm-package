import fs from 'fs';
import semver from 'semver';
import colors from 'colors';
import logger from 'hookable-logger';
import PathHelpers from 'meteor-build-plugin-helper-path-helpers';

export default function checkNpmPackage(packageWithVersion, requestor) {
  const [ packageName, packageVersion ] = packageWithVersion.split('@');

  if (!verifyPackageExists(packageName, packageVersion, requestor)) {
    return false;
  }

  return checkNpmVersion(packageName, packageVersion, requestor);
}

function verifyPackageExists(packageName, packageVersion, requestor) {
  const packagePath = `${PathHelpers.basePath}/node_modules/${packageName}`;
  const doesPackageExist = fs.existsSync(packagePath);
  if (!doesPackageExist) {
    logger.error(colors.red.bold(`Error checking npm package: ${packageName}@${packageVersion} (requested by ${requestor}): package not found. Please ensure you have installed the package; here is the command:\n meteor npm install ${packageName}@${packageVersion} --save-dev\n or \n meteor yarn ${packageName}@${packageVersion}`));
  }

  return doesPackageExist;
}

function checkNpmVersion(name, actualVersion, requestor) {
  try {
    const currentVersion = require(`${name}/package.json`).version;
    if (semver.satisfies(currentVersion, actualVersion)) {
      return true;
    } else {
      logger.warn(colors.yellow.bold(`WARNING: version mismatch for ${name}; installed version is ${currentVersion}, but version ${actualVersion} is requested by ${requestor})`));
      return true;
    }
  } catch (e) {
    logger.error(colors.red.bold(`Error checking package: ${name}@${actualVersion} (requested by ${requestor}): ${e.message}`));
    return false;
  }
}

