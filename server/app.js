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

app.listen(process.env.BACKEND_PORT, () => console.log(`server listening on ${process.env.BACKEND_PORT}`));

