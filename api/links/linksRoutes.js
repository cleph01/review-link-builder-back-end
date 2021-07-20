// inside /users/userRoutes.js <- this can be place anywhere and called anything
const express = require("express");

// Db/Knex config file
const db = require("../../data/db-config");

const router = express.Router(); // notice the Uppercase R

// Helper function to while-Loop through the DB "Check Slug Available" call
// Need helper function cause DB call resolves to a Promise
// * Refactor to include "Action Function" as a 3rd argument.
// The Action Function would be a .find() model function defined in
// an external db model file *

const incrementSlug = (prevSlug_arr) => {
    if (isNaN(Number(prevSlug_arr.slice(-1)))) {
        prevSlug_arr.push("1");

        console.log("Increment by Push :", prevSlug_arr);
    } else {
        console.log("Else Increment by Increment");

        prevSlug_arr[prevSlug_arr.length - 1] =
            Number(prevSlug_arr[prevSlug_arr.length - 1]) + 1;
    }

    return prevSlug_arr.join("-");
};

// Fetch Availability in DB
const checkAvaility = async (slug) => {
    console.log("Slug in Check Availability: ", slug);

    return await db
        .select()
        .table("business")
        .where("review_link", slug)
        .first();
};

let unAvailable = true;

let count = 0;

const doWhilePromise = (slug, condition) => {
    var loop = async (slug) => {
        let temp_slug = slug;
        let newSlug = null;

        console.log("Whilst Slug: ", slug);

        console.log("Count: ", count);

        count++;

        const db_response = await checkAvaility(temp_slug);

        console.log("db_response before loop return: ", db_response);

        if (!db_response) {
            unAvailable = false;
            newSlug = temp_slug;
        } else {
            const newSlug = incrementSlug(temp_slug.split("-"));

            temp_slug = newSlug;
        }

        console.log("Unavaillable: ", unAvailable);

        return unAvailable
            ? new Promise((resolve, reject) => {
                  resolve(loop(temp_slug));
              })
            : new Promise((resolve, reject) => {
                  newSlug = temp_slug;
                  resolve(newSlug);
              });
    };
    return loop(slug);
};

// this file will only be used when the route begins with "/links"
// because of our apiRoutes file
// so we can remove that from the URLs, so "/links" becomes simply "/"
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
    db.select()
        .table("business")
        .then((business) => {
            // res.status(200).json({ hello: "from the GET /users endpoint" });
            res.status(200).json(business);
        })
        .catch((err) => {
            res.status(500).json({ message: "Failed to get business info" });
        });
});

router.post("/", async (req, res) => {
    const payload = req.body;

    // Check if business name has Invisable Unicode character
    const business_name = payload.business_name;
    if (business_name.charCodeAt(business_name.length - 1) === 8203) {
        // Re-assign Business_Name in Payload
        payload.business_name = business_name.substring(
            0,
            business_name.length - 1
        );
    }

    // First, Check if Place_ID/Business exists in database
    db.select()
        .table("business")
        .where("place_id", payload.place_id)
        .first()
        .then((placeIdExists) => {
            if (placeIdExists) {
                res.status(200).json({
                    message: "Place ID Exists",
                    review_link: placeIdExists.review_link,
                    business_id: placeIdExists.business_id,
                });
            } else {
                // If Place Id doesn't exist
                // verify that the Review-Link Slug they want
                // is available -- Transform Business Name to Slug

                const review_link = payload.business_name
                    .trim()
                    .replace(/\s+/g, " ")
                    .trim()
                    .replaceAll(" ", "-")
                    .replaceAll("&", "n");

                // Feed slug to Availability While Loop

                doWhilePromise(review_link, unAvailable)
                    .then((resolved_value) => {
                        console.log("Resolved Value: ", resolved_value);

                        payload.review_link = resolved_value;
                        // insert new business into db
                        db.insert(payload)
                            .table("business")
                            .then((id) => {
                                res.status(200).json({
                                    message: "Successfully Created Link",
                                    review_link: resolved_value,
                                });
                            })
                            .catch((err) => {
                                console.log("Rejected New Biz insert: ", err);
                                res.status(500).json({
                                    message:
                                        "Rejected New Business Insert: " + err,
                                });
                            });
                    })
                    .catch((err) => {
                        console.log("Rejected: ", err);
                        res.status(500).json({
                            message: "Rejected: " + err,
                        });
                    });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Failed to Complete Initial Link Search: " + err,
            });
        });
});

// .. and any other endpoint related to the user's resource

// after the route has been fully configured, then we export it so it can be required where needed
module.exports = router; // standard convention dictates that this is the last line on the file
