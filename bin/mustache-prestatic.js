#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const promisify = require('lagden-promisify');
const yargs = require('yargs');

const mustachePrestatic = require('../src/index.js');
const writeFile = promisify(fs.writeFile);

const argv = yargs
  .usage(`\nUsage: $0 templateFiles [options]
Compile pages of static HTML from mustache templates, data and partials.`)
  .demand(1, 'Missing required templateFiles argument.')
  .showHelpOnFail(false)

  .option('help', {
    alias: 'h',
    type: 'boolean'
  }).help('help', 'Show help text.')

  .option('version', {
    alias: 'v',
    type: 'boolean'
  }).version()

  .option('data', {
    alias: 'd',
    describe: 'Input mustache template data files.',
    type: 'array'
  })

  .option('partials', {
    alias: 'p',
    describe: 'Input mustache partial files.',
    type: 'array'
  })

  .option('output', {
    alias: 'o',
    default: '.',
    describe: 'Output directory, defaults to current directory.',
    type: 'string'
  })

  .option('verbose', {
    describe: 'Log extra information about the process to stdout.',
    type: 'boolean'
  })
  .argv;


const transform = function (templateFiles) {
  const log = require('./verbose-log')(argv.verbose);

  log('templateFiles', templateFiles);
  log('data', argv.data);
  log('partials', argv.partials, '\n');

  mustachePrestatic(templateFiles, argv.data, argv.partials)
    .then(function (htmlResults) {
      return templateFiles.forEach(function (filePath, index) {
        let outputFileName = path.parse(filePath).name;
        let outputPath = path.join(argv.output, outputFileName) + '.html';

        writeFile(outputPath, htmlResults[index], 'utf8')
          .catch(console.error);
      });
    });
};

transform(argv._);

process.title = 'mustache-prestatic';
