const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index');
const userController = require('../controllers/user');
const { catchErrors, sendFiles } = require('../controllers/helpers');

router.get('/', catchErrors(indexController.getBooks));

router.param('id', userController.getUserByID);

router
  .route('/borrow/:id')
  .get(userController.checkAuth, catchErrors(indexController.getBorrowed))
  .post(userController.checkAuth, catchErrors(indexController.postBorrowed));

router.post(
  '/borrow-delete-item',
  userController.checkAuth,
  catchErrors(indexController.postReturnBorrowedBook)
);

router.get('/files/:id', sendFiles);

router.param('id', indexController.getBookByID);

router.post(
  '/search',
  userController.checkAuth,
  catchErrors(indexController.searchBook),
  indexController.sendBookDetails
);

router
  .route('/:id')
  .get(userController.checkAuth, indexController.sendBookDetails);

module.exports = router;
