const express = require("express"); // import the express package

const server = express(); // creates the server

// express built in middleware to allow parsing of JSON req.body
server.use(express.json());

// Allow Cross-Server Comms
var cors = require("cors");

server.use(cors());

// Pulls in User Routing File to Main file
const apiRoutes = require("./api/apiRoutes");

// handle requests to the root of the api, the / route
server.get("/", (req, res) => {
    res.send("Hello from Express");
});

server.use("/api", apiRoutes);

// watch for connections on port 5000
server.listen(5000, () =>
    console.log("Server running on http://localhost:5000")
);
