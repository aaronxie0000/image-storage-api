const express = require("express");
const router = express.Router();

const path = require("path");
const { v1: uuidv1 } = require("uuid");
const multer = require("multer");
const bcrypt = require("bcrypt");
const pool = require("../models/db.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.IMG_FOLDER);
  },
  filename: function (req, file, cb) {
    const uniID = uuidv1();
    const fileName = uniID + path.extname(file.originalname);

    req.fileID = [...(req.fileID || []), uniID];
    req.allFileName = [...(req.allFileName || []), fileName];

    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

//post
//add files to folder and postgres
router.post("/", upload.array("imageOrigin"), async (req, res) => {
  const privateAccess = req.body.isPrivate === "on";
  let hashedAccessCode = null;

  if (privateAccess) {
    hashedAccessCode = await bcrypt.hash(req.body.accessCode, 10);
  }

  const filesName = [];
  const tagArr = req.body.imageTags.split(" ");
  const thisFolder = process.env.IMG_FOLDER;

  for (let i = 0; i < req.fileID.length; i++) {
    const thisID = req.fileID[i];

    const thisName = req.files[i].originalname;
    filesName.push(thisName);
    const thisFile = req.allFileName[i];

    await pool.query(
      `INSERT INTO ${process.env.PGSQL_TABLE} (id, name, folder, file, private, accesscode, tags) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        thisID,
        thisName,
        thisFolder,
        thisFile,
        privateAccess,
        hashedAccessCode,
        tagArr,
      ]
    );
  }

  res.json({ message: "Submitted", files: filesName });
});

module.exports = router;
