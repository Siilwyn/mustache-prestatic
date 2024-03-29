'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const promiseAllProps = require('promise-all-props');
const tape = require('tape');

const { render, mapTemplates } = require('../src/index.js');
const readFile = promisify(fs.readFile);

const templateFiles = [
  'tests/input/views/blog.mustache',
  'tests/input/views/home.mustache'
];
const dataFiles = [
  'tests/input/data/home.json'
];
const partialFiles = [
  'tests/input/partials/article.mustache',
  'tests/input/partials/header.mustache'
];

/**
* testCompile() runs tests based on the passed parameters
* and the amount of paths in the templateFiles by comparing
* the output to fixtures
*
* @param {Object} t
* @param {Array} dataFiles
* @param {Array} partialFiles
* @param {String} fixtureKey
* @param {String} message
*/
const testCompile = function (t, dataFiles, partialFiles, customTags, unescaped, fixtureKey, message) {
  render(templateFiles, dataFiles, partialFiles, customTags, unescaped)
    .then(function (results) {
      var fileExtension = fixtureKey + '.html';

      results.forEach(function (html, index) {
        let fileName = path.parse(templateFiles[index]).name;
        let filePath = path.join('tests/fixtures/', fileName) + fileExtension;

        readFile(filePath, 'utf8')
          .then(function (data) {
            t.deepEqual(
              results[index],
              data,
              message
            );
          });
      });
    });
};

tape('`render` should compile HTML from given files.', function (t) {
  // Execute five tests, each test tests all templateFiles
  t.plan(templateFiles.length * 5);

  testCompile(t, dataFiles, partialFiles, [], false, '', 'Use templates, data and partials.');
  testCompile(t, dataFiles, [], [], true, '-unescaped', 'Use templates and unescaped data.');
  testCompile(t, dataFiles, [], [], false, '-data', 'Use templates and data.');
  testCompile(t, [], partialFiles, [], false, '-partial', 'Use templates and partials.');
  testCompile(t, dataFiles, [], ['[%%', '%%]'], false, '-tags', 'Use customTags.');
});

tape('`mapTemplates` should reject on invalid file.', function (t) {
  t.plan(1);

  promiseAllProps(mapTemplates(['tests/input/views'], []))
    .catch(() => t.pass('Reject on directory.'));
});
