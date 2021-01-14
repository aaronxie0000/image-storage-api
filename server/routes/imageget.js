const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const pool = require("../models/db.js");
const {checkAuth}  = require("./checkAuth.js");

router.get("/somedata/dev", (req, res) => {
  console.log(req);
  console.log(req.query);
  res.end();
});

//get
//image meta info
//need query string acesscode
router.get("/byname/:targetName/meta", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE name LIKE $1`,
    [req.params.targetName + ".%"]
  );

  if (rawData.rows.length === 0) {
    res.json({ message: "Error, no image found" });
    return;
  }

  const allMatches = [];


  for (let i = 0; i < rawData.rows.length; i++) {

    const isAuth = await checkAuth(
      rawData.rows[i].private,
      req.query.accesscode,
      rawData.rows[i].accesscode
    );

    if (!isAuth) {
      continue;
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
//need Query string acesscode if image is private
router.get("/byname/:targetName/img", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE name LIKE $1`,
    [req.params.targetName + ".%"]
  );

  if (rawData.rows.length === 0) {
    res.json({ message: "No Matches" });
    return;
  }

  const allMatches = [];

  for (let i = 0; i < rawData.rows.length; i++) {
    const isAuth = await checkAuth(
      rawData.rows[i].private,
      req.query.accesscode,
      rawData.rows[i].accesscode
    );

    if (!isAuth) {
      continue;
    }

    const imgLoc = path.join(rawData.rows[i].folder, rawData.rows[i].file);

    if (!fs.existsSync(imgLoc)) {
      res.json({ message: "Error, image not found" });
      return;
    }

    const orgFile = fs.readFileSync(imgLoc);
    const base64String = new Buffer.from(orgFile).toString("base64");

    allMatches.push(base64String);
  }

  if (allMatches.length === 0) {
    res.json({ message: "No Matches, double check your access code" });
    return;
  }

  res.json({ response: allMatches });
});

//get
//image get by tag
//need Query string acesscode or without just access public images
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
      const isAuth = await checkAuth(
        rawData.rows[i].private,
        req.query.accesscode,
        rawData.rows[i].accesscode
      );

      if (!isAuth) {
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
//need Query string acesscode or without just access public images
router.get("/bytime/:targetDate/img", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE timestamp::date = $1::date`,
    [req.params.targetDate]
  );


  if (!rawData) {
    res.json({ message: "Error, no image found" });
  } else {
    const matchedImg = [];

    for (let i = 0; i < rawData.rows.length; i++) {
      const isAuth = await checkAuth(
        rawData.rows[i].private,
        req.query.accesscode,
        rawData.rows[i].accesscode
      );

      if (!isAuth) {
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
