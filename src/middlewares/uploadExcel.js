import multer from "multer";

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return cb(new Error("Solo archivos Excel"));
    }
    cb(null, true);
  }
});

export default upload;
