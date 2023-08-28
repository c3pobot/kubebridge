'use strict'
process.on('unhandledRejection', (err) => {
  console.error(err)
});
require('./src')
