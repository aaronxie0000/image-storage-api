const path = require("path");
const fs = require("fs");
const { v1: uuidv1 } = require("uuid");

const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");

const pool = require("./models/db.js");
require("dotenv").config();



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.FILE_DIR);
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

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));




//add files
app.post("/images", upload.array("imageOrigin"), async (req, res) => {
  //req.file
  // req.body.imageTags (text content of the form is in req.body)

  const filesName = [];
  const tagArr = req.body.imageTags.split(" ");
  const folder = process.env.FILE_DIR;


  for (let i = 0; i < req.fileID.length; i++) {
    const id = req.fileID[i];
    

    const name = req.files[i].originalname;
    filesName.push(name);
    const file = req.allFileName[i];


    await pool.query(
      "INSERT INTO uploadedimages(id, name, folder, file, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, name, folder, file, tagArr]
    );
  }

  res.json({ message: "Submitted", files: filesName });
});




//get image meta info 
app.get("/images/:targetName/meta", async (req, res) => {
  const rawData = await pool.query("SELECT * FROM uploadedimages WHERE name LIKE $1", [req.params.targetName + '.%']);

  const allMatches = [];

  for (let i=0; i<rawData.rows.length; i++){
    

    const match = {
      name: rawData.rows[i].name,
      tags: rawData.rows[i].tags,
      create_at: rawData.rows[i].timestamp,
    }
    allMatches.push(match);

  }

  res.json({response: allMatches});


});


//get image as base64 string
app.get("/images/:targetName/img", async(req,res)=>{
  const rawData = await pool.query("SELECT * FROM uploadedimages WHERE name LIKE $1", [req.params.targetName + '.%']);

  if(rawData.rows.length > 1){
    res.send({Message: 'Error, more than 1 file matched'});
  }
  else{
    const imgLoc = path.join(rawData.rows[0].folder, rawData.rows[0].file);
    console.log(imgLoc);

    const orgFile = fs.readFileSync(imgLoc);
    const base64String = new Buffer.from(orgFile).toString('base64');
    res.send({base64: base64String});
  }
  

});



//if was hosting on same server;
// app.get('/', express.static('./../client'), (req, res)=>{
//   res.end();
// })

app.listen(3000, () => console.log("listening on 3000"));



