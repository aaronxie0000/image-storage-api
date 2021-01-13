const path = require("path");
const { v1: uuidv1 } = require("uuid");

const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images')
  },
  filename: function (req, file, cb) {
    const fileID = uuidv1();
    cb(null,fileID + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage });


app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));



app.post("/images", upload.single("imageOrigin"), async (req, res) => {
    //req.file has all info 
    // req.body.imageTags (text content of the form is in req.body)
    console.log(req.body.imageTags);
    res.end();
  }
);

//if was hosting on same server;
// app.get('/', express.static('./../client'), (req, res)=>{
//   res.end();
// })

app.listen(3000, () => console.log("listening on 3000"));


