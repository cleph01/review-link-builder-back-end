// Db/Knex config file
const db = require("../db-config");

function getUserByEmail(email) {
    return db.select().table("users").where("email", email).first();
}

function addUser(credentials) {
    return db("users").insert(credentials);
}

module.exports = {
    getUserByEmail,
    addUser,
};
