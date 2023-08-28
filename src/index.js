'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
const app = require('./express')
const PORT = +process.env.PORT || 3000
const server = app.listen(PORT, ()=>{
  log.info(`Kube bridge is listening on port ${server.address().port}`)
})
server.keepAliveTimeout = 60000;
