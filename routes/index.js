const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index');
const userController = require('../controllers/user');
const { catchErrors, sendFiles } = require('../controllers/helpers');

router.get('/', catchErrors(indexController.getBooks));

router.param('userId', userController.getUserByID);

router.param('bookId', indexController.getBookByID);

router
  .route('/borrowed/:userId')
  .get(userController.checkAuth, catchErrors(indexController.getBorrowed));

router
  .route('/borrow')
  .post(userController.checkAuth, catchErrors(indexController.postBorrowed));

router.post(
  '/return/:bookId',
  userController.checkAuth,
  catchErrors(indexController.postReturnBorrowedBook)
);

router.post(
  '/return-both',
  userController.checkAuth,
  catchErrors(indexController.postReturnBothBorrowedBook)
);

router.get('/files/:filename', sendFiles);

router.post(
  '/search',
  userController.checkAuth,
  catchErrors(indexController.searchBook),
  indexController.sendBookDetails
);

router
  .route('/:bookId')
  .get(userController.checkAuth, indexController.sendBookDetails);

module.exports = router;
