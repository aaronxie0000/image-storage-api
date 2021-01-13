const express = require("express");
const app = express();
require("dotenv").config();

const cors = require("cors");

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

const imagePost = require("./routes/imagePost");
app.use("/add", imagePost);

const imageGet = require("./routes/imageGet");
app.use("/get", imageGet);

app.listen(3000, () => console.log("listening on 3000"));

