#! /usr/bin/env node
'use strict';


// Script to verify database configuration and dependencies.


var fs = require('fs'),
    HydraFactory = require('./HydraFactory');


var config,
    configPath,
    factory;

configPath = 'src/conf/config.json';

if (!fs.existsSync(configPath)) {
  process.stderr.write('Application configuration not found,' +
      ' run "node src/lib/pre-install"\n');
  process.exit(1);
}

config = JSON.parse(fs.readFileSync(configPath));

factory = HydraFactory({
  dsn: config.DB_DSN,
  password: config.DB_PASS,
  username: config.DB_USER
});

// connect and execute query
factory.getConnection().then(function (connection) {
  process.stderr.write('Connected, executing test query\n');
  return connection.execute('select \'testvalue\' from dual')
      .then(function (result) {
        if (result.rows[0][0] === 'testvalue') {
          process.stderr.write('Query successful\n');
        } else {
          process.stderr.write('Query did not return expected value');
          process.exit(1);
        }
        return connection.close();
      });
})
// something went wrong
.catch(function (err) {
  process.stderr.write('ERROR: ' + err.message + '\n');
  process.exit(1);
});
