const rp = require('request-promise');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const StreamingApp = require('../module/sequelize').models.StreamingApp;

const resourceManagerUrl = `http://${process.env.RM_URL}:${process.env.RM_PORT}/ws/v1`;

exports.getApplicationList = function(req, res) {
    rp(resourceManagerUrl+'/cluster/apps')
    .then((appList)=>{
        res.status(200).json(appList);
    })
    .catch((err)=>{
        console.error('Error getting application list:', err);
        res.sendStatus(500);
    });
}

exports.executeSparkSubmit = function(req, res) {
    exec('spark-submit --master yarn ~/sample_queue_stream.py', {stdio: 'ignore'})
    .then(({stdout, stderr})=>{
        res.sendStatus(200);
    })
    .catch((err)=>{
        console.error('Error executing test application:', err);
        res.sendStatus(500);
    });
}

exports.getAppState = function(req, res) {
    const appId = req.params.id;
    rp(`${resourceManagerUrl}/cluster/apps/${appId}/state`)
    .then((appState)=>{
        res.status(200).json(appState);
    }).catch((err)=>{
        console.error('Error getting application state: ', err);
        res.sendStatus(500);
    });
}

exports.killApp = function(req, res) {
    const appId = req.params.id;
    console.log(appId);
    rp({
        url:`${resourceManagerUrl}/cluster/apps/${appId}/state`,
        method: 'PUT',
        json: true,
        body: {
            state: "KILLED"
        }
    })
    .then((appState)=>{
        console.log(appState);
        res.status(200).json(appState);
    }).catch((err)=>{
        console.error('Error getting application state: ', err);
        res.sendStatus(500);
    });
}

exports.getClusterMetrics = function(req, res) {
    rp(resourceManagerUrl+'/cluster/metrics')
    .then((metrics)=>{
        res.status(200).json(metrics);
    })
    .catch((err)=>{
        console.error('Error getting cluster metrics:', err);
        res.sendStatus(500);
    });
}

exports.getClusterInfo = function(req, res) {
    rp(resourceManagerUrl+'/cluster/info')
    .then((info)=>{
        res.status(200).json(info);
    })
    .catch((err)=>{
        console.error('Error getting cluster info:', err);
        res.sendStatus(500);
    });
}