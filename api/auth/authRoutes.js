// inside /users/userRoutes.js <- this can be place anywhere and called anything
const express = require("express");

// Model - DB Access Function file
const User = require("../../data/model/auth-model");

const router = express.Router(); // notice the Uppercase R

// Allows to hash and verify hashed passwords
const bcrypt = require("bcryptjs");
// JSON Webtoken
const jwt = require("jsonwebtoken");
// JWT Signature
const secrets = require("../../config/secrets");

// LOGIN EndPoint
router.post("/login", (req, res) => {
    const credentials = req.body;

    console.log("Login Credentials: ", credentials);

    User.getUserByEmail(credentials.email)
        .then(
            (user) => {
                // Check if password matches

                console.log("Found User: ", user);

                if (
                    user &&
                    bcrypt.compareSync(credentials.password, user.password)
                ) {
                    const userObj = {
                        id: user.id,
                        name: user.name,
                    };

                    // Generated a JWT to send to client for
                    // Authentication purposes as they continue
                    // accessing server-side API
                    const token = generateToken(userObj); // new line

                    res.status(200).json({
                        id: user.userId,
                        name: user.name,
                        token: token,
                    });
                } else {
                    res.status(401).send("Invalid Credentials");
                }
            },
            (error) => {
                res.status(501).json(error);
            }
        )
        .catch((err) => {
            res.status(500).json({ message: "Error: " + err });
        });
});

// SIGN-UP Endpoint
router.post("/signup", (req, res) => {
    const credentials = req.body;

    console.log("Sign Up Credentials: ", credentials);

    User.getUserByEmail(credentials.email)
        .then(
            (user) => {
                if (user) {
                    res.status(201).json({
                        error: "User Already Has an Account",
                        user,
                    });
                } else {
                    // Hashes the password received from client
                    const hash = bcrypt.hashSync(credentials.password, 14);

                    // Mutates the original password to hashed password
                    credentials.password = hash;

                    // Inserts New user into DB
                    User.addUser(credentials)
                        .then(
                            (newUser) => {
                                // If successful, create a userObject with
                                // id and name of new User as keys
                                const userObj = {
                                    id: newUser,
                                    name: credentials.name,
                                };

                                // Generated a JWT to send to client for
                                // Authentication purposes as they continue
                                // accessing server-side API
                                const token = generateToken(userObj); // new line

                                // Send back response object with "created" 201 status code
                                // with new user ID and JWT token as payload
                                res.status(201).json({
                                    message: {
                                        id: newUser,
                                        token: token,
                                        name: credentials.name,
                                    },
                                });
                            },
                            // If DB Insert fails, send back response object with
                            // "Not Implemented" 501 status code w/ Error message
                            // payload
                            (error) => {
                                res.status(501).json({
                                    message:
                                        "Error: Failed to Create New User: " +
                                        error,
                                });
                            }
                        )
                        .catch((err) => {
                            res.status(500).json({
                                message: "Failed to insert new user",
                            });
                        });
                }
            },
            (error) => {
                res.status(501).json({
                    message: error,
                });
            }
        )
        .catch((err) => {
            res.status(500).json({ message: "Failed to signup user: " + err });
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
