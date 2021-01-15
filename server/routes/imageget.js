const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const pool = require("../models/db.js");
const { checkAuth } = require("./checkAuth.js");

//get
//image meta info
//access: req.query.targetName & req.query.accessCode
router.get("/byname/meta", async (req, res) => {
  try {
    const rawData = await pool.query(
      `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE name LIKE $1`,
      [req.query.targetName + ".%"]
    );

    if (rawData.rows.length === 0) {
      res.json({ message: "No Matches" });
      return;
    }

    const allMatches = [];

    for (let i = 0; i < rawData.rows.length; i++) {
      const isAuth = await checkAuth(
        rawData.rows[i].private,
        req.query.accessCode,
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

    if (allMatches.length === 0) {
      res.json({ message: "No Matches, double check your access code" });
      return;
    }

    res.json({ response: allMatches });
  } catch (err) {
    res.json({ error: err.message });
  }
});

//get
//image as base64 string
//access: req.query.targetName & req.query.accessCode
router.get("/byname/img", async (req, res) => {
  try {
    const rawData = await pool.query(
      `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE name LIKE $1`,
      [req.query.targetName + ".%"]
    );

    if (rawData.rows.length === 0) {
      res.json({ message: "No Matches" });
      return;
    }

    const allMatches = [];

    for (let i = 0; i < rawData.rows.length; i++) {
      const isAuth = await checkAuth(
        rawData.rows[i].private,
        req.query.accessCode,
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
  } catch (err) {
    res.json({ error: err.message });
  }
});

//get
//image get by tag
//access: req.query.targetTag & req.query.accessCode
router.get("/bytag/img", async (req, res) => {
  try {
    const targetTagArr = req.query.targetTag.split(" ");

    const rawData = await pool.query(
      `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE tags @> $1::text[]`,
      [targetTagArr]
    );

    if (rawData.rows.length === 0) {
      res.json({ message: "No Matches" });
    } else {
      const allMatches = [];

      for (let i = 0; i < rawData.rows.length; i++) {
        const isAuth = await checkAuth(
          rawData.rows[i].private,
          req.query.accessCode,
          rawData.rows[i].accesscode
        );

        if (!isAuth) {
          continue;
        }

        const imgLoc = path.join(rawData.rows[i].folder, rawData.rows[i].file);

        if (!fs.existsSync(imgLoc)) {
          allMatches.push({ base64Img: "Error, Image Not Found" });
          continue;
        }

        const orgFile = fs.readFileSync(imgLoc);
        const base64String = new Buffer.from(orgFile).toString("base64");
        allMatches.push({ base64Img: base64String });
      }

      if (allMatches.length === 0) {
        res.json({ message: "No Matches, double check your access code" });
        return;
      }

      res.json({ allImages: allMatches });
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

//get
//image get by date
//access: req.query.targetDate & req.query.accessCode
router.get("/bytime/img", async (req, res) => {
  try {
    const rawData = await pool.query(
      `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE timestamp::date = $1::date`,
      [req.query.targetDate]
    );

    if (rawData.rows.length === 0) {
      res.json({ message: "No Matches" });
    } else {
      const allMatches = [];

      for (let i = 0; i < rawData.rows.length; i++) {
        const isAuth = await checkAuth(
          rawData.rows[i].private,
          req.query.accessCode,
          rawData.rows[i].accesscode
        );

        if (!isAuth) {
          continue;
        }

        const imgLoc = path.join(rawData.rows[i].folder, rawData.rows[i].file);

        if (!fs.existsSync(imgLoc)) {
          allMatches.push({ base64Img: "Error, Image Not Found" });
          continue;
        }

        const orgFile = fs.readFileSync(imgLoc);
        const base64String = new Buffer.from(orgFile).toString("base64");
        allMatches.push({ base64Img: base64String });
      }

      if (allMatches.length === 0) {
        res.json({ message: "No Matches, double check your access code" });
        return;
      }

      res.json({ allImages: allMatches });
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;
