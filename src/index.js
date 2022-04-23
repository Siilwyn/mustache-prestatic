'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const promiseAllProps = require('promise-all-props');
const mustache = require('mustache');
const mustacheEscapeHtmlFunction = mustache.escape;

const readFile = promisify(fs.readFile);

/**
* mapFiles() returns an object based on passed file path array
* mapping file name as key and promised content as value
*
* @param {Array} files
* @return {Object} filesMap
*/
const mapFiles = function (files) {
  return files.reduce(function (filesMap, file) {
    let fileName = path.parse(file).name;
    filesMap[fileName] = readFile(file, 'utf8');

    return filesMap;
  }, {});
};

/**
* mapTemplates() returns an object based on passed file path arrays
* mapping template file name as key and promised content of two files
* in an object as value
*
* @param {Array} templateFiles
* @param {Array} dataFiles
* @return {Object} filesMap
*/
const mapTemplates = function (templateFiles, dataFiles) {
  return templateFiles.reduce(function (templatesMap, template) {
    let templateName = path.parse(template).name;
    // Get data file with the same base name as the template file
    let dataFile = dataFiles.find(function (file) {
      return path.parse(file).name === templateName;
    });

    templatesMap[templateName] = promiseAllProps({
      'template': readFile(template, 'utf8')
        .catch(function () {
          return Promise.reject(Error(`Could not read file '${template}'`));
        }),
      'data': readFile(dataFile, 'utf8')
        // Use passed data fall back to an empty object
        .then(function (data) {
          return JSON.parse(data);
        })
        .catch(function () {
          return {};
        })
    });

    return templatesMap;
  }, {});
};

/**
* compileMustache() returns an array of HTML from the passed
* templatesMap and partialsMap in the form of two objects
*
* @param {Object} partialsMap
* @param {Object} templatesMap
* @return {Array} compiledHtml
*/

const compileMustache = function (templatesMap, partialsMap, customTags, unescaped) {
  var compiledHtml = [];

  (unescaped) ? mustache.escape = function (text) { return text; } : mustache.escape = mustacheEscapeHtmlFunction;

  for (let templateName in templatesMap) {
    let template = templatesMap[templateName].template;
    let templateData = templatesMap[templateName].data;

    compiledHtml.push(mustache.render(template, templateData, partialsMap, customTags));
  }

  return compiledHtml;
};

module.exports = {
  render: function (templateFiles, dataFiles, partialFiles, customTags, unescaped) {
    dataFiles = dataFiles || [];
    partialFiles = partialFiles || [];
    customTags = (customTags && customTags.length) ? customTags : undefined;
    unescaped = unescaped || false;

    return Promise.all([
      promiseAllProps(mapTemplates(templateFiles, dataFiles)),
      promiseAllProps(mapFiles(partialFiles)),
      customTags,
      unescaped
    ])
      .then(function (mustacheData) {
        return compileMustache(mustacheData[0], mustacheData[1], mustacheData[2], mustacheData[3]);
      })
      .catch(function (error) {
        console.error(`Fatal error: ${error.message}`);
        process.exit(1);
      });
  },
  mapTemplates,
  compileMustache,
};
