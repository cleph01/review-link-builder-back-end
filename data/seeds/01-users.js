exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex("users")
        .truncate()
        .then(function () {
            // Inserts seed entries
            return knex("users").insert([
                {
                    userId: 1,
                    name: "User_1",
                    email: "user_1_@gmail.com",
                    password: "user_1_password",
                },
                {
                    userId: 2,
                    name: "User_2",
                    email: "user_2_@gmail.com",
                    password: "user_2_password",
                },
                {
                    userId: 3,
                    name: "User_3",
                    email: "user_3_@gmail.com",
                    password: "user_3_password",
                },
            ]);
        });
};
