const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const pool = require("./../models/db.js");

//get
//image meta info
router.get("/:targetName/meta", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE name LIKE $1`,
    [req.params.targetName + ".%"]
  );

  const allMatches = [];

  for (let i = 0; i < rawData.rows.length; i++) {
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
router.get("/:targetName/img", async (req, res) => {
  const rawData = await pool.query(
    `SELECT * FROM ${process.env.PGSQL_TABLE} WHERE name LIKE $1`,
    [req.params.targetName + ".%"]
  );

  if (!rawData) {
    res.json({ message: "Error, no image found" });
  } else if (rawData.rows.length > 1) {
    res.send({ Message: "Error, more than 1 file matched" });
  } else {
    //note that file location is relative to app.js
    const imgLoc = path.join(rawData.rows[0].folder, rawData.rows[0].file);

    if (!fs.existsSync(imgLoc)) {
      res.json({ message: "Error, no image found" });
    }

    const orgFile = fs.readFileSync(imgLoc);
    const base64String = new Buffer.from(orgFile).toString("base64");
    res.send({ base64: base64String });
  }
});

module.exports = router;
