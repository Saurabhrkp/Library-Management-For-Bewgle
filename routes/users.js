const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { catchErrors } = require('../controllers/helpers');

// Register
router
  .route('/signup')
  .get(userController.get_signup)
  .post(userController.validateSignup, catchErrors(userController.signup));

// Login
router
  .route('/signin')
  .get(userController.get_signin)
  .post(userController.signin);

// Logout
router.get('/signout', userController.signout);

router.param('id', userController.getUserByID);

router
  .route('/:id')
  .get(userController.checkAuth, userController.getAuthUser)
  .put(userController.checkAuth, catchErrors(userController.updateUser))
  .delete(userController.checkAuth, catchErrors(userController.deleteUser));

module.exports = router;
