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

// const promiseWhile = (slug, condition) => {
//     let whilst = (slug) => {
//         console.log("unAvailable: ", condition);

//         return condition
//             ? db
//                   .select()
//                   .table("business")
//                   .where("review_link", slug)
//                   .first()
//                   .then(whilst)
//             : Promise.resolve(slug);
//     };

//     return whilst(slug);
// };

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

let db_count = 0;

// Fetch Availability in DB
const checkAvailitiy = (slug) => {
    const response = db
        .select()
        .table("business")
        .where("review_link", slug)
        .first();
    return response;
};

const doWhilePromise = async (slug) => {
    let unAvailable = true;
    let newSlug = null;

    // Checks if last element in array is a number
    // If not, push a 1 -- otherwise increment
    // Purpose = to manage businesses with identical names
    // which would cause duplicate/non-unique review links
    // ** Consider Refactor as Recursion **

    await checkAvailitiy(slug).then((db_response) => {
        console.log("While Response: ", db_response, " For Slug: ", slug);

        ++db_count;

        const next_slug = incrementSlug(slug.split("-"));

        if (typeof db_response !== "undefined") {
            console.log("In If part: ", db_count);
            doWhilePromise(next_slug);
        } else {
            console.log(
                "In Else part: ",
                db_count,
                " \n Next Slug: ",
                next_slug
            );
            newSlug = "bla";
        }
    });

    console.log("Outside While: ", db_count);

    return newSlug;
};

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

router.post("/", (req, res) => {
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
                const slug = doWhilePromise(review_link);

                console.log("Final Slug: ", slug);
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
