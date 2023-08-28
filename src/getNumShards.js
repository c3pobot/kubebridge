'use strict'
const path = require('path')
const log = require('logger')
const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const watch = new k8s.Watch(kc);

const NAME_SPACE = process.env.POD_NAMESPACE
const BOT_SET_NAME = process.env.BOT_SET_NAME || 'bot'
let NUM_SHARDS

const listFn = () => k8sAppsApi.listNamespacedStatefulSet(NAME_SPACE);
const uri = path.join('/apis/apps/v1/namespaces', NAME_SPACE, 'statefulsets')
const informer = k8s.makeInformer(kc, uri, listFn);

informer.on('add', (obj) => {
  if(obj?.metadata?.name === BOT_SET_NAME){
    log.info(`${BOT_SET_NAME} replica's detected ${obj?.spec?.replicas}`)
    NUM_SHARDS = +obj?.spec?.replicas
  }
});
informer.on('update', (obj) => {
  if(obj?.metadata?.name === BOT_SET_NAME && NUM_SHARDS !== obj?.spec?.replicas){
    log.info(`${BOT_SET_NAME} change in number of replica's from ${NUM_SHARDS} to ${obj?.spec?.replicas}`)
    NUM_SHARDS = +obj?.spec?.replicas
  }
});
informer.on('error', (err) => {
    log.error(err);
    // Restart informer after 5sec
    setTimeout(() => {
        startInformer();
    }, 5000);
});
const startInformer = async()=>{
  try{
    await informer.start()
    log.info(`informer started for statefulset ${BOT_SET_NAME}`)
  }catch(err){
    if(err?.body?.message){
      log.error(`Code: ${err.body.code}, Msg: ${err.body.message}`)
    }else{
      log.error(err)
    }
    setTimeout(startInformer, 5000)
  }
}
startInformer()
module.exports = async(req, res)=>{
  try{
    if(!BOT_SET_NAME || !NAME_SPACE) throw('k8 info not provided...')
    if(!NUM_SHARDS || !generateName || !req?.body?.podName) res.sendStatus(400)
    res.send(200).json({ totalShards: +NUM_SHARDS })
    res.sendStatus(200)
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
}
/*
module.exports.getNumShards = async()=>{
  try{
    if(!SET_NAME || !NAMESPACE) throw('k8 info not provided...')
    let replicas = await k8sAppsApi.readNamespacedStatefulSet(SET_NAME, NAMESPACE)
    return (replicas?.body?.spec?.replicas)
  }catch(e){
    throw(e)
  }
}
module.exports.getShardNum = async()=>{
  try{
    if(!POD_NAME || !SET_NAME || !NAMESPACE) throw('k8 info not provided...')
    let pod = await k8sCoreApi.readNamespacedPod(POD_NAME, NAMESPACE)
    if(!pod?.body?.metadata?.generateName) return
    let shardNum = POD_NAME?.replace(pod?.body?.metadata?.generateName, '')
    let replicas = await k8sAppsApi.readNamespacedStatefulSet(SET_NAME, NAMESPACE)
    if(+shardNum >= 0 && replicas?.body?.spec?.replicas) return { totalShards: +replicas.body.spec.replicas, shardNum: +shardNum }
  }catch(e){
    throw(e)
  }
}
*/
