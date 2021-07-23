// Db/Knex config file
const db = require("../db-config");

//
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

const doWhilePromise = (slug) => {
    let unAvailable = true;

    let count = 0;

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

// START Access Functions

function findByPlaceId(place_id) {
    return db.select().table("business").where("place_id", place_id).first();
}

function createLink(business_data) {
    return db.insert(business_data).table("business");
}
// END Access Functions

module.exports = {
    findByPlaceId,
    createLink,
    doWhilePromise,
};
