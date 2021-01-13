const express = require("express");
const app = express();


app.get('/', express.static('./'), (req, res)=>{
    res.end();
})


app.listen(3003, () => console.log("listening on 3003"));

