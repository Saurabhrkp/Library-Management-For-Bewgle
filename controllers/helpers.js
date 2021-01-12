const mongoose = require('mongoose');
const Multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path');

let GFS;

mongoose.connection.once('open', () => {
  GFS = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: process.env.BUCKET_NAME,
  });
});

/* Error handler for async / await functions */
const catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    return {
      bucketName: process.env.BUCKET_NAME,
      filename: `${Date.now()}${path.extname(file.originalname)}`,
    };
  },
});

const upload = Multer({
  storage: storage,
  limits: {
    fileSize: 6 * 1024 * 1024, // no larger than 10mb, you can change as needed.
  },
  fileFilter: (req, file, next) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('application/')
    ) {
      next(null, true);
    } else {
      next(null, false);
    }
  },
});

const saveFile = async (req, res, next) => {
  if (!req.files) {
    return next();
  }
  if (req.files['coverImage']) {
    const { filename } = req.files['coverImage'][0];
    req.body.coverImage = filename;
  }
  return next();
};

const deleteFileFromBucket = async (coverImage) => {
  try {
    return await GFS.delete(new mongoose.Types.ObjectId(coverImage));
  } catch (error) {
    return Promise.reject(error);
  }
};

const deleteCoverImage = async (req, res, next) => {
  const { coverImage } = req.book;
  if (req.body.coverImage !== undefined || req.url.includes('DELETE')) {
    await deleteFileFromBucket(coverImage);
  }
  return next();
};

const sendFiles = async (req, res, next) => {
  try {
    const files = await GFS.find({ filename: req.params.filename }).toArray();
    if (!files[0] || files.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: 'No files available' });
    }
    if (files[0].contentType.startsWith('image')) {
      GFS.openDownloadStreamByName(req.params.fileID).pipe(res);
    } else {
      res.status(404).json({ err: 'Not a image' });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  catchErrors,
  upload,
  saveFile,
  deleteCoverImage,
  sendFiles,
};
