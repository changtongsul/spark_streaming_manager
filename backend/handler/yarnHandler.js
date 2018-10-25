const rp = require('request-promise');
const exec = require('child_process').exec;

const StreamingApp = require('../module/sequelize').models.StreamingApp;

const resourceManagerUrl = `http://${process.env.RM_URL}:${process.env.RM_PORT}/ws/v1`;

exports.getApplicationList = function(req, res) {
    StreamingApp.findAll()
    .then((appList)=>{
        res.status(200).json(appList);
    })
    .catch((err)=>{
        console.error('Error getting application list: ', err);
        res.sendStatus(500);
    });
}

exports.getNewAppId = function(req, res) {
    rp({url:resourceManagerUrl+'/cluster/apps/new-application', method:'POST'})
    .then((newAppObj)=>{
        exec(`${process.env.SPARK_LOC}bin/spark-submit --master yarn ${process.env.SPARK_LOC}examples/src/main/python/streaming/network_wordcount.py localhost 9999`, (err, stdout, stderr)=>{
           if(err) {
               console.error(`error: ${err}`);
               return
           } 
           console.log(`stdout: ${stdout}`);
           console.log(`stderr: ${stderr}`);
        })
        res.status(200).json(newAppObj);
    })
    .catch((err)=>{
        console.error(err);
        res.sendStatus(500);
    });
}

exports.submitNewApplication = function(req, res) {
    const { appName } = req.body;
    let appInfo = {
        appId: '',
        appName
    };
    rp({
        url: resourceManagerUrl + '/cluster/apps/new-application',
        method: 'POST',
        json:true
    }).then((newAppObject)=>{
        appInfo.appId = newAppObject["application-id"];
        return rp({
            url: resourceManagerUrl + '/cluster/apps',
            method: 'POST',
            json: true,
            body: { 
                "application-id": appInfo.appId,
                "application-name": appInfo.appName,
                "unmanaged-AM": false,
                "max-app-attempts": 2,
                resource: {
                    memory: 1024,
                    vCores: 1
                },
                "application-type": "SPARK",
            }
        });
    }).then(()=>{
        return StreamingApp.create(appInfo);
    }).then((streamingApp)=>{
        res.sendStatus(200);
    }).catch((err)=>{
        console.error(`Error starting ${appName} (id: ${appInfo.appId}): ${err}`);
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