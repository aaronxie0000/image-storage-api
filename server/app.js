const fs = require("fs/promises");
const express = require("express");
const app = express();
const cors = require("cors");
const multer  = require('multer')
const { v1: uuidv1 } = require("uuid");

//disk storage is just so can add more customization to filename and dest 
const storage = multer.diskStorage({
  destination: (req, res, cb)=>{
    cb(null,'./images');
  },
  fileName: (req,res,cb)=>{
    cb(null, req.fieDest)
  }
});
const upload = multer({storage: storage}).single('imageOrigin');

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

function fileNameParse(req, res, next){


}


app.post("/", async (req, res) => {
  const rawSrc = req.body.imgSrc;
  const fileName = req.body.fileName;

  console.log(req.body.tags);

  const ext = rawSrc.substring(
    rawSrc.indexOf("/") + 1,
    rawSrc.indexOf(";base64")
  );
  const fileType = rawSrc.substring("data:".length, rawSrc.indexOf("/"));

  const regexTarget = new RegExp(`^data:${fileType}\/${ext};base64,`, "gi");
  const base64Data = rawSrc.replace(regexTarget, "");

  const fileID = uuidv1();

  await fs.writeFile(`./images/${fileID}.${ext}`, base64Data, "base64");

  res.end();
});

app.listen(3000, () => console.log("listening on 3000"));
