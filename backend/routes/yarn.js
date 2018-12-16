var express = require('express');
var router = express.Router();

const passport = require('../module/passport');
const requireAuth = passport.authenticate('jwt', {session: false});

const yarnHandler = require('../handler/yarnHandler');

router.get('/cluster/metrics', yarnHandler.getClusterMetrics);
router.get('/cluster/info', yarnHandler.getClusterInfo);

router.get('/apps/rm', yarnHandler.getApplicationList);
router.post('/apps/rm', yarnHandler.executeSparkSubmit);

router.get('/apps/registered', yarnHandler.getRegisteredApps);
router.post('/apps/registered', yarnHandler.registerApp);

router.get('/apps/:id/state', yarnHandler.getAppState);
router.put('/apps/:id/state', yarnHandler.killApp);

router.get('/apps/:id/dependency', yarnHandler.getDependency)
router.post('/apps/:id/dependency', yarnHandler.setDependency)

module.exports = router;