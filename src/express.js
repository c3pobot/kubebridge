'use strict'
const log = require('logger')
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const app = express()

const getLogLevel = require('./getLogLevel')
const getShardNum = require('./getShardNum')
app.use(bodyParser.json({
  limit: '500MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.use(compression());
app.get('/healthz', (req, res)=>{
  res.status(200).json({res: 'ok'})
})
app.post('/logLevel', (req, res)=>{
  getLogLevel(req, res)
})
app.post('/getNumShards', (req, res)=>{
  getNumShards(req, res)
})
module.exports = app
