// inside /users/userRoutes.js <- this can be place anywhere and called anything
const express = require("express");

const router = express.Router(); // notice the Uppercase R

const Links = require("../../data/model/links-model");

// this file will only be used when the route begins with "/links"
// because of our apiRoutes file
// so we can remove that from the URLs, so "/links" becomes simply "/"

// Create Link
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
    Links.findByPlaceId(payload.place_id)
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

                Links.doWhilePromise(review_link)
                    .then((resolved_value) => {
                        console.log("Resolved Value: ", resolved_value);

                        payload.review_link = resolved_value;
                        // insert new business into db
                        Links.createLink(payload)
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
