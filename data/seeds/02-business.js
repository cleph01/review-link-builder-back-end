exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex("business")
        .del()
        .then(function () {
            // Inserts seed entries
            return knex("business").insert([
                {
                    business_id: 1,
                    place_id: "ChIJP2kKNmahwokRygjrKWBbuB4",
                    review_link:
                        "http://ThankYou.Smartseed.com/Fratelli-Market",
                    business_name: "Fratelli Market",
                    street_address: "17 Cedar Heights Road",
                    city: "Stamford",
                    state: "CT",
                    website: "https://www.fratellimarket.com/",
                    user_id: "1",
                },
                {
                    business_id: 2,
                    place_id: "ChIJtWJUnYmVwokRreE15_IsGnk",
                    review_link:
                        "http://ThankYou.Smartseed.com/Hard-Knocks-Boxing-Club",
                    business_name: "Hard Knocks Boxing Club",
                    street_address: "305 Central Ave",
                    city: "White Plains",
                    state: "NY",
                    website: "http://www.hardknocksbox.com/",
                    user_id: "1",
                },
                {
                    business_id: 3,
                    place_id: "ChIJl6uQ-FyXwokRtaDvtVKkL-4",
                    review_link:
                        "http://ThankYou.Smartseed.com/Misti-Cafe-Take-Out",
                    business_name: "Misti Cafe Take Out",
                    street_address: "100 N Main St",
                    city: "Port Chester",
                    state: "NY",
                    website: "",
                    user_id: "1",
                },
            ]);
        });
};
