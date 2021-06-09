// inside /users/userRoutes.js <- this can be place anywhere and called anything
const express = require("express");

// Db/Knex config file
const db = require("../../data/db-config");

const router = express.Router(); // notice the Uppercase R

// this file will only be used when the route begins with "/users"
// so we can remove that from the URLs, so "/users" becomes simply "/"
router.get("/", (req, res) => {
    // db("users")
    db.select()
        .table("links")
        .then((links) => {
            // res.status(200).json({ hello: "from the GET /users endpoint" });
            res.status(200).json(links);
        })
        .catch((err) => {
            res.status(500).json({ message: "Failed to get links" });
        });
});

router.get("/:id", (req, res) => {
    res.status(200).send("hello from the GET /links/:id endpoint");
});

router.post("/", (req, res) => {
    const payload = req.body;

    console.log("Req Body: ", payload);

    db("links")
        .insert(payload)
        .then(
            (newLink) => {
                // res.status(200).json({ hello: "from the GET /users endpoint" });

                res.status(201).json({
                    message: {
                        newLink,
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
            res.status(500).json({ message: "Failed to insert new link" });
        });
});

// .. and any other endpoint related to the user's resource

// after the route has been fully configured, then we export it so it can be required where needed
module.exports = router; // standard convention dictates that this is the last line on the file
