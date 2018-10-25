var express = require('express');
var router = express.Router();

const passport = require('../module/passport');
const requireAuth = passport.authenticate('jwt', {session: false});

const yarnHandler = require('../handler/yarnHandler');

router.get('/cluster/metrics', yarnHandler.getClusterMetrics);
router.get('/cluster/info', yarnHandler.getClusterInfo);

router.get('/apps', yarnHandler.getApplicationList);
router.post('/apps', yarnHandler.submitNewApplication);
router.get('/apps/new-application', yarnHandler.getNewAppId);

router.get('/apps/:id/state', yarnHandler.getAppState);
router.put('/apps/:id/state', yarnHandler.killApp);

module.exports = router;