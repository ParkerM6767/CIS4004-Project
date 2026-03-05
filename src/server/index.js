const express = require("express");
const {MongoClient, ObjectId} = require("mongodb");
const port = 8080;
const app = express();

// MongoDB Setup



// Cross origin handling

const cors = require("cors");
app.use(cors());

// Body parser middleware

app.use(express.json());

// Basic Hello World
app.get("/:echo", (req, res) => {

    console.log(req.headers);
    res.send("Hello world! " + req.params.echo);
})

app.listen(port, function() {
    console.log("App listening on port " + port);
})