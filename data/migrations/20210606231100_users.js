exports.up = function (knex, Promise) {
    // don't forget the return statement
    return knex.schema.createTable("users", (tbl) => {
        // creates a primary key called id
        tbl.increments("userId");
        // creates a text field called name which is required
        tbl.text("name", 128).notNullable();
        // creates a text field called email which is both required and unique
        tbl.text("email", 128).unique().notNullable();
        // creates a text field called password which is required
        tbl.text("password").notNullable();
    });
};

exports.down = function (knex, Promise) {
    // drops the entire table
    return knex.schema.dropTableIfExists("users");
};
