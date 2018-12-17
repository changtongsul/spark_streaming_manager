const rp = require('request-promise');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const StreamingApp = require('../module/sequelize').models.StreamingApp;

const resourceManagerUrl = `http://${process.env.RM_URL}:${process.env.RM_PORT}/ws/v1`;

exports.getClusterMetrics = function(req, res) {
    rp(resourceManagerUrl+'/cluster/metrics', {json:true})
    .then((metrics)=>{
        res.status(200).json(metrics);
    })
    .catch((err)=>{
        console.error('Error getting cluster metrics:', err);
        res.sendStatus(500);
    });
}

exports.getClusterInfo = function(req, res) {
    rp(resourceManagerUrl+'/cluster/info', {json:true})
    .then((info)=>{
        res.status(200).json(info);
    })
    .catch((err)=>{
        console.error('Error getting cluster info:', err);
        res.sendStatus(500);
    });
}

exports.getApplicationList = function(req, res) {
    rp(resourceManagerUrl+'/cluster/apps', {json:true})
    .then((appList)=>{
        res.status(200).json(appList);
    })
    .catch((err)=>{
        console.error('Error getting application list:', err);
        res.sendStatus(500);
    });
}

exports.executeSparkSubmit = function(req, res) {
    exec('spark-submit --master yarn ~/sample_queue_stream.py', {stdio: 'ignore'});
    res.status(200).json({message:"sample_queue_stream.py submitted"});
}

exports.getRegisteredApps = function(req, res) {
    StreamingApp.findAll()
    .then((registeredAppList)=>{
        res.status(200).json(registeredAppList)
    })
    .catch((err)=>{
        console.error('Error getting registered applications:', err);
        res.sendStatus(500);
    });
}

exports.registerApp = function(req, res) {
    var newAppInfo = {
        appName: req.body.appName,
        depApp: req.body.depApp,
        appId: ''
    };
    const postOption = {
        method: 'POST',
        uri: resourceManagerUrl+'/cluster/apps/new-application',
        body: {},
        json: true
    };
    rp.post(postOption)
    .then((newApp)=>{
        var tempAppId = newApp["application-id"];
	console.log(tempAppId);
        var appNumber = parseInt(tempAppId.slice(-4)) + 1;
        tempAppId = tempAppId.slice(0,-4);
        var newAppNumString = "0000" + appNumber;
        newAppNumString = newAppNumString.slice(-4);
        tempAppId = tempAppId + newAppNumString;
        console.log(newAppNumString);
        newAppInfo.appId = tempAppId;
        return StreamingApp.create(newAppInfo)
    })
    .then((data)=>{
        var newApp = {
            id: data.dataValues.id,
            appName: data.dataValues.appName,
            appId: data.dataValues.appId,
            depApp: data.dataValues.depApp
        };
        res.status(200).json(newApp);
    })
    .catch((err)=>{
        console.error('Error registering new application:', err);
        res.sendStatus(500);
    })
}

exports.deleteApp = function(req, res) {
    const appId = parseInt(req.params.id);
    StreamingApp.destroy({where: {id: appId}})
    .then((delRow)=>{
        res.sendStatus(200);
    })
    .catch((err)=>{
        res.sendStatus(500);
    });
}

exports.getAppState = function(req, res) {
    const appId = req.params.id;
    rp(`${resourceManagerUrl}/cluster/apps/${appId}/state`, {json:true})
    .then((appState)=>{
        res.status(200).json(appState);
    }).catch((err)=>{
        console.error('Error getting application state: ', err);
        console.log(err.statusCode);
        if(err.statusCode == 404) {
            res.status(200).json({state:"NOT_SUBMITTED"});
        }
        else {
            res.sendStatus(500);
        }
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
        if(err.statusCode == 404) {
            res.status(200).json({state:"NOT_SUBMITTED"});
        }
        else {
            res.sendStatus(500);
        }
    });
}

exports.getDependency = function(req, res) {
    const id = req.params.id;
    StreamingApp.findAll({
        where: {id}
    }).then((data)=>{
        res.status(200).json({dependency: data.dataValues.depApp});
    }).catch((err)=>{
        console.error('Error getting application dependecny:', err);
        res.sendStatus(500);
    });
}

exports.setDependency = function(req, res) {
    const id = req.params.id;
    const depApp = req.body.dependency;
    StreamingApp.findOne({
        where: {id}
    }).then((app)=>{
        app.depApp = depApp;
        return app.save();
    }).then((data)=>{
        res.status(200).json(data);
    }).catch((err)=>{
        console.error('Error setting application dependency:', err);
    });
}
