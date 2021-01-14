const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const pool = require("../models/db.js");

//get
//image meta info
//need query string acesscode
router.get("/byname/:targetName/meta", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE name LIKE $1`,
    [req.params.targetName + ".%"]
  );

  const allMatches = [];

  for (let i = 0; i < rawData.rows.length; i++) {
    let accessed = false;

    if (rawData.rows[i].private) {
      const tryAccessCode = req.query.accesscode;

      if (!tryAccessCode) {
        res.json({
          message: "Please enter access code as query on: accesscode",
        });
        return;
      }

      accessed = await bcrypt.compare(
        tryAccessCode,
        rawData.rows[i].accesscode
      );
    } else {
      accessed = true;
    }

    if (!accessed) {
      res.json({ message: "Incorrect access code" });
      return;
    }

    const match = {
      name: rawData.rows[i].name,
      tags: rawData.rows[i].tags,
      create_at: rawData.rows[i].timestamp,
    };
    allMatches.push(match);
  }

  res.json({ response: allMatches });
});

//get
//image as base64 string
//need query string acesscode
router.get("/byname/:targetName/oneimg", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE name LIKE $1`,
    [req.params.targetName + ".%"]
  );

  if (!rawData) {
    
    res.json({ message: "Error, no image found" });

  } else if (rawData.rows.length > 1) {
    
    res.json({ Message: "Error, more than 1 file matched" });

  } else {

    const auth = checkAuth(rawData.rows[0].private, req.query.accesscode, rawData.rows[0].accesscode)

    let accessed = false;

    if (rawData.rows[0].private) {
      const tryAccessCode = req.query.accesscode;
      if (!tryAccessCode) {
        res.json({
          message: "Please enter access code as query on: accesscode",
        });
        return;
      }

      accessed = await bcrypt.compare(
        tryAccessCode,
        rawData.rows[0].accesscode
      );
    } else {
      accessed = true;
    }

    if (!accessed) {
      res.json({ message: "Incorrect Access Code" });
      return;
    }

    const imgLoc = path.join(rawData.rows[0].folder, rawData.rows[0].file);

    if (!fs.existsSync(imgLoc)) {
      res.json({ message: "Error, no image found" });
      return;
    }

    const orgFile = fs.readFileSync(imgLoc);
    const base64String = new Buffer.from(orgFile).toString("base64");
    res.json({ base64: base64String });
  }
});


async function checkAuth(isPrivate, accessCode, correctCode){
    if(!isPrivate) return true;

    const match = await bcrypt.compare(
      accessCode,
      correctCode
    );

    return match;
}



//get
//image get by tag
//need query string acesscode
router.get("/bytag/:targetTag/img", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE tags @> ARRAY[$1]`,
    [req.params.targetTag]
  );

  if (!rawData) {
    res.json({ message: "Error, no image found" });
  } else {
    const matchedImg = [];

    for (let i = 0; i < rawData.rows.length; i++) {
      if (rawData.rows[i].private) {
        continue;
      }

      const imgLoc = path.join(rawData.rows[i].folder, rawData.rows[i].file);

      if (!fs.existsSync(imgLoc)) {
        matchedImg.push({ base64Img: "Error, Image Not Found" });
        continue;
      }

      const orgFile = fs.readFileSync(imgLoc);
      const base64String = new Buffer.from(orgFile).toString("base64");
      matchedImg.push({ base64Img: base64String });
    }
    res.json({ allImages: matchedImg });
  }
});



//get
//image get by date
//need query string acesscode
router.get("/bytime/:targetDate/img", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE timestamp::date = $1::date`,
    [req.params.targetDate]
  );

  console.log(rawData);

  if (!rawData) {
    res.json({ message: "Error, no image found" });
  } else {
    const matchedImg = [];

    for (let i = 0; i < rawData.rows.length; i++) {
      if (rawData.rows[i].private) {
        continue;
      }

      const imgLoc = path.join(rawData.rows[i].folder, rawData.rows[i].file);

      if (!fs.existsSync(imgLoc)) {
        matchedImg.push({ base64Img: "Error, Image Not Found" });
        continue;
      }

      const orgFile = fs.readFileSync(imgLoc);
      const base64String = new Buffer.from(orgFile).toString("base64");
      matchedImg.push({ base64Img: base64String });
    }
    res.json({ allImages: matchedImg });
  }
});

module.exports = router;
