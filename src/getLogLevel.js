'use strict'
const log = require('logger')
const { botSettings } = require('./botSettings')

module.exports = async(req, res)=>{
  try{
    if(!req?.body?.setName) res.sendStatus(400)
    let logStatus = { logLevel: null }
    if(botSettings?.map?.logLevel && botSettings?.map?.logLevel[req.body.setName]) logStatus.logLevel = botSettings?.map?.logLevel[req.body.setName]
    res.status(200).json(logStatus)
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
}
