const express = require('express');
const router = express.Router();
const panelController = require('../controllers/panel');
const indexController = require('../controllers/index');
const userController = require('../controllers/user');
const {
  catchErrors,
  upload,
  saveFile,
  deleteCoverImage,
} = require('../controllers/helpers');

router.param('bookId', indexController.getBookByID);

router.get(
  '/index',
  userController.checkAuth,
  catchErrors(panelController.panel)
);

router
  .route('/create')
  .get(userController.checkAuth, panelController.createBook)
  .post(
    userController.checkAuth,
    upload.fields([{ name: 'coverImage', maxCount: 1 }]),
    catchErrors(saveFile),
    catchErrors(panelController.saveBook)
  );

router
  .route('/:bookId')
  .delete(
    userController.checkAuth,
    catchErrors(deleteCoverImage),
    catchErrors(panelController.deleteBook)
  )
  .put(
    userController.checkAuth,
    upload.fields([{ name: 'coverImage', maxCount: 1 }]),
    catchErrors(saveFile),
    catchErrors(deleteCoverImage),
    catchErrors(panelController.updateBook)
  )
  .get(userController.checkAuth, panelController.sendBookForm);

router.get(
  '/all/users',
  userController.checkAuth,
  catchErrors(panelController.getUsers)
);

router.get(
  '/all/books',
  userController.checkAuth,
  catchErrors(panelController.getBooks)
);

module.exports = router;
