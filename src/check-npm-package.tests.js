/* eslint-env node, mocha */
import checkNpmPackage from './check-npm-package';
import chai from 'chai';
import logger from 'hookable-logger';
import PathHelpers from 'meteor-build-plugin-helper-path-helpers';

PathHelpers.basePath = './';

const expect = chai.expect;

describe('checkNpmPackage', function() {
  it('should return false if the package is not installed', function() {
    logger.test(function() {
      expect(checkNpmPackage('fake-package')).to.be.false;
    });
  });

  it('should output an error if the package is not installed', function(done) {
    logger.test(function() {
      let receivedErrorMessage = '';
      logger.error.addHook(errorMessage => {
        try {
          receivedErrorMessage += errorMessage + '\n';
          return false;
        } catch (e) {
          done(e);
        }
      });

      checkNpmPackage('fake-package@0.0.1', 'somePackage');
      const expectedMessage = 'Error checking npm package: fake-package@0.0.1 (requested by somePackage): package not found. Please ensure you have installed the package; here is the command:\n meteor npm install fake-package@0.0.1 --save-dev\n or \n meteor yarn fake-package@0.0.1\n';
      expect(receivedErrorMessage).to.have.string(expectedMessage);
      done();
    });
  });

  it('should return true if an invalid version of the package is installed', function() {
    logger.test(function() {
      expect(checkNpmPackage('mocha@1.0.0')).to.be.true;
    });
  });

  it('should output a warning if an invalid version of the package is installed', function(done) {
    logger.test(function() {
      logger.warn.addHook(errorMessage => {
        try {
          expect(errorMessage).to.have.string('WARNING: version mismatch for mocha; installed version is 3.2.0, but version 1.0.0 is requested by somePackage)');
          done();
          return false;
        } catch (e) {
          done(e);
        }
      });

      checkNpmPackage('mocha@1.0.0', 'somePackage');
    });
  });

  it('should return true if a matching package version is installed', function() {
    expect(checkNpmPackage('mocha@^3.2.0')).to.be.true;
  });
});
