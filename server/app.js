const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const { v1: uuidv1 } = require("uuid");


app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));




app.post("/images", async (req, res) => {
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
  }
);

app.listen(3000, () => console.log("listening on 3000"));
