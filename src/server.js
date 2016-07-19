'use strict';

var fs = require('fs'),
    HydraWebService = require('./HydraWebService'),
    ini = require('ini');


var config,
    configPath,
    service;


configPath = 'src/conf/config.ini';

if (!fs.existsSync(configPath)) {
  console.error('Application configuration not found,' +
      ' run "src/lib/pre-install"');
  process.exit(1);
}

config = ini.parse(fs.readFileSync(configPath, 'utf-8'));
service = HydraWebService(config);


service.start();
