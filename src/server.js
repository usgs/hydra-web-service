'use strict';

var fs = require('fs'),
    HydraWebService = require('./HydraWebService');


var config,
    configPath,
    service;


configPath = 'src/conf/config.json';

if (!fs.existsSync(configPath)) {
  console.error('Application configuration not found,' +
      ' run "node src/lib/pre-install"');
  process.exit(1);
}

config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
service = HydraWebService(config);


service.start();
