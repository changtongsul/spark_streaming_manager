const jwt = require('jsonwebtoken');
const User = require('../module/sequelize').models.User;

function createTokenForUser(user, callback) {
    jwt.sign(
      { sub: user.id },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXP_DATE },
      function(err, token) {
        if (err) {
          return callback(err, null);
        }
        callback(null, token);
      }
    );
}

exports.signUp = function(req, res) {
    console.log(req.body);
    const userInfo = {
      username: req.body.username,
      password: req.body.password,
    };
  
    const query = {
      where : {
        username: req.body.username
      }
    };
  
    const response = {
      success: false,
      token: null,
      message: ''
    };
  
    User.findOne(query)
      .then((result)=>{
        if(result){
          res.status(500).send('duplicate username');
        } else {
          User.create(userInfo)
            .then(function(user) {
              createTokenForUser(user, function(err, token) {
                if (err) {
                    console.log(err)
                  res.sendStatus(500);
                } else {
                  response.success = true;
                  response.token = token;
                  response.message = 'successfully created user and token';
                  res.json(response);
                }
              });
            })
            .catch(function(err) {
          console.log(err)
              res.sendStatus(500);
            });
        }
      })
      .catch((err)=>{
          console.log(err)
        res.sendStatus(500);
      });
  
};

exports.signIn = function(req, res) {
  const response = {
    success: false,
    token: null,
    userInfo: null,
    message: ''
  };

  createTokenForUser(req.user, function(err, token) {
    if (err) {
      res.sendStatus(500);
    } else {
      response.success = true;
      response.token = token;
      response.userInfo = req.user;
      response.message = 'Successfully signed in and created token';
      res.json(response);
    }
  });
};
  
exports.refreshToken = function(req, res) {
  const response = {
    success: false,
    token: null,
    is_admin: false,
    message: ''
  };

  createTokenForUser(req.user, function(err, token) {
    if (err) {
      res.sendStatus(500);
    } else {
      response.success = true;
      response.token = token;
      response.message = 'Successfully created new token';
      if (req.user.is_admin) {
        response.is_admin = true;
      }
      res.json(response);
    }
  });
};