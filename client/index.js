const express = require("express");
const app = express();
require("dotenv").config();


app.get('/', express.static('./'), (req, res)=>{
    res.end();
  })
  
app.listen(process.env.FRONTEND_PORT, () => console.log(`client listening on ${process.env.FRONTEND_PORT}`));


