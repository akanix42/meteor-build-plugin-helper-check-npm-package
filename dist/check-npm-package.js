'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = checkNpmPackage;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _hookableLogger = require('hookable-logger');

var _hookableLogger2 = _interopRequireDefault(_hookableLogger);

var _meteorBuildPluginHelperPathHelpers = require('meteor-build-plugin-helper-path-helpers');

var _meteorBuildPluginHelperPathHelpers2 = _interopRequireDefault(_meteorBuildPluginHelperPathHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkNpmPackage(packageWithVersion, requestor) {
  var _packageWithVersion$s = packageWithVersion.split('@'),
      _packageWithVersion$s2 = _slicedToArray(_packageWithVersion$s, 2),
      packageName = _packageWithVersion$s2[0],
      packageVersion = _packageWithVersion$s2[1];

  if (!verifyPackageExists(packageName, packageVersion, requestor)) {
    return false;
  }

  return checkNpmVersion(packageName, packageVersion, requestor);
}

function verifyPackageExists(packageName, packageVersion, requestor) {
  var packagePath = `${_meteorBuildPluginHelperPathHelpers2.default.basePath}/node_modules/${packageName}`;
  var doesPackageExist = _fs2.default.existsSync(packagePath);
  if (!doesPackageExist) {
    _hookableLogger2.default.error(_colors2.default.red.bold(`Error checking npm package: ${packageName}@${packageVersion} (requested by ${requestor}): package not found. Please ensure you have installed the package; here is the command:\n meteor npm install ${packageName}@${packageVersion} --save-dev\n or \n meteor yarn ${packageName}@${packageVersion}`));
  }

  return doesPackageExist;
}

function checkNpmVersion(name, actualVersion, requestor) {
  try {
    var currentVersion = require(`${name}/package.json`).version;
    if (_semver2.default.satisfies(currentVersion, actualVersion)) {
      return true;
    } else {
      _hookableLogger2.default.warn(_colors2.default.yellow.bold(`WARNING: version mismatch for ${name}; installed version is ${currentVersion}, but version ${actualVersion} is requested by ${requestor})`));
      return true;
    }
  } catch (e) {
    _hookableLogger2.default.error(_colors2.default.red.bold(`Error checking package: ${name}@${actualVersion} (requested by ${requestor}): ${e.message}`));
    return false;
  }
}
//# sourceMappingURL=check-npm-package.js.map
