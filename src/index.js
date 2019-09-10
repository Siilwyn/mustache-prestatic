'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const promiseAllProps = require('promise-all-props');
const mustache = require('mustache');

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
      'template': readFile(template, 'utf8'),
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
const compileMustache = function (templatesMap, partialsMap) {
  var compiledHtml = [];

  for (let templateName in templatesMap) {
    let template = templatesMap[templateName].template;
    let templateData = templatesMap[templateName].data;

    compiledHtml.push(mustache.render(template, templateData, partialsMap));
  }

  return compiledHtml;
};

module.exports = function (templateFiles, dataFiles, partialFiles) {
  dataFiles = dataFiles || [];
  partialFiles = partialFiles || [];

  return Promise.all([
    promiseAllProps(mapTemplates(templateFiles, dataFiles)),
    promiseAllProps(mapFiles(partialFiles))
  ])
    .then(function (mustacheData) {
      return compileMustache(mustacheData[0], mustacheData[1]);
    })
    .catch(function (error) {
      throw error;
    });
};
