// inside /users/userRoutes.js <- this can be place anywhere and called anything
const express = require("express");

// Allows to hash and verify hashed passwords
const bcrypt = require("bcryptjs");

// JSON Webtoken
const jwt = require("jsonwebtoken");

// JWT Signature
const secrets = require("../../config/secrets");

// Db/Knex config file
const db = require("../../data/db-config");

const router = express.Router(); // notice the Uppercase R

// LOGIN EndPoint
router.post("/login", (req, res) => {
    const credentials = req.body;

    console.log("Login Credentials: ", credentials);

    db.select()
        .table("users")
        .where("email", credentials.email)
        .first()
        .then(
            (user) => {
                if (user) {
                    res.status(200).json(user);
                } else {
                    res.status(201).json({ message: "No user Found" });
                }
            },
            (error) => {
                res.status(501).json({
                    message: error,
                });
            }
        )
        .catch((err) => {
            res.status(500).json({ message: "Failed to find  user" });
        });
});

// SIGN-UP Endpoint
router.post("/signup", (req, res) => {
    const credentials = req.body;

    console.log("Sign Up Credentials: ", credentials);

    const hash = bcrypt.hashSync(credentials.password, 14);

    credentials.password = hash;

    db("users")
        .insert(credentials)
        .then(
            (newUser) => {
                // res.status(200).json({ hello: "from the GET /users endpoint" });

                const userObj = {
                    id: newUser,
                    name: credentials.name,
                };

                const token = generateToken(userObj); // new line

                res.status(201).json({
                    message: {
                        id: newUser,
                        token,
                    },
                });
            },
            (error) => {
                res.status(501).json({
                    message: error,
                });
            }
        )
        .catch((err) => {
            res.status(500).json({ message: "Failed to insert new user" });
        });
});

// JSON Web Token Generator
function generateToken(user) {
    const payload = {
        subject: user.id, // sub in payload is what the token is about
        username: user.name,
        // ...otherData
    };

    const options = {
        expiresIn: "1d", // show other available options in the library's documentation
    };

    // extract the secret away so it can be required and used where needed
    return jwt.sign(payload, secrets.jwtSecret, options); // this method is synchronous
}
// after the route has been fully configured, then we export it so it can be required where needed
module.exports = router; // standard convention dictates that this is the last line on the file
