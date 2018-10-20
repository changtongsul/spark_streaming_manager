var express = require('express');
var router = express.Router();

const userHandler = require('../handler/userHandler');

const passport = require('../module/passport');
const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignIn = passport.authenticate('local', {session: false});

router.post('/sign-up', userHandler.signUp);
router.post('/login', requireSignIn, userHandler.signIn);
router.get('/refresh-token', requireAuth, userHandler.refreshToken);

module.exports = router;
