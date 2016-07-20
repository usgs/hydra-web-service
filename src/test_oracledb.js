#! /usr/bin/env node
'use strict';


// Script to verify database configuration and dependencies.


var fs = require('fs'),
    oracledb;

try {
  oracledb = require('oracledb');
} catch (e) {
  process.stderr.write('"oracledb" not installed\n');
  process.exit(1);
}


var config,
    configPath;

configPath = 'src/conf/config.json';

if (!fs.existsSync(configPath)) {
  process.stderr.write('Application configuration not found,' +
      ' run "node src/lib/pre-install"\n');
  process.exit(1);
}

config = JSON.parse(fs.readFileSync(configPath));

// connect
oracledb.getConnection({
  connectString: config.DB_DSN,
  user: config.DB_USER,
  password: config.DB_PASS
})
// use connection
.then(function (connection) {
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
