const express = require('express');
const router = express.Router();
const panelController = require('../controllers/panel');
const indexController = require('../controllers/index');
const userController = require('../controllers/user');
const {
  catchErrors,
  upload,
  saveFile,
  deleteCoverImageID,
} = require('../controllers/helpers');

router.param('bookId', indexController.getBookByID);

router.get(
  '/panel',
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
    catchErrors(deleteCoverImageID),
    catchErrors(panelController.deleteBook)
  )
  .put(
    userController.checkAuth,
    upload.fields([{ name: 'coverImage', maxCount: 1 }]),
    catchErrors(saveFile),
    catchErrors(deleteCoverImageID),
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
  catchErrors(panelController.getProducts)
);

module.exports = router;
