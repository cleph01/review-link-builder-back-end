exports.up = function (knex, Promise) {
    // don't forget the return statement
    return knex.schema.createTable("business", (tbl) => {
        // creates a primary key called id
        tbl.increments("business_id");

        tbl.text("place_id", 128).unique().notNullable();

        tbl.text("review_link", 128).unique().notNullable();

        tbl.text("business_name", 128);

        tbl.text("street_address", 75);

        tbl.text("city", 50);

        tbl.text("state", 25);

        tbl.text("website", 75);

        tbl.integer("user_id")
            // forces integer to be positive
            .unsigned()
            .notNullable()
            .references("userId")
            // this table must exist already
            .inTable("users");
    });
};

exports.down = function (knex, Promise) {
    // drops the entire table
    return knex.schema.dropTableIfExists("business");
};
