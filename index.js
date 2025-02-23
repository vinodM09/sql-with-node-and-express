const express = require("express");
const app = express();
const port = 3000; // non-privileged ports like 3000, 8080, 5000, 4200, 8000 for local development to avoid permission issues/ freely available
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const {v4: uuidv4} = require("uuid");
const path = require("path"); // path is required to join paths of two folders here we are joining views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
const methodOverride = require("method-override"); // this package is required to send PATCH and DELETE requests as we cant send them directly like GET or POST
app.use(express.urlencoded({ extended: true })); // to decrypt request body
app.use(methodOverride("_method"));

// ABOUT
// I have tried to use MySQL with Node.js and Express.js to create a web page where you can create a account, edit account info, delete accout with the security of password, like when you create an account, you will have to make a password which will then be required for operations like edit user info in the database and delete user from the database

// OUTPUT
// VS Code Terminal (Advised)
// To run the server, use the command "node index.js"
// Make another terminal using '+' icon in the terminal top right corner to work with MySQL
// To start working with MySQL, make sure you are in MySQL environment and if you are not then
// Use this command to use SQL from CLI: "/usr/local/mysql/bin/mysql -u root -p"

// Device Terminal
// If you are trying to run from the device terminal, make sure you are in the project directory ( project directory contains all the required modules, folders and files ), here it is named "NODESQL02"

// COMMON MISTAKES : for writing the code
// make sure you have require all the necessary packages
// make sure the spelling is correct
// make sure the query is correct
// don't forget to restart the server after changing something in the code
// it will be good if you make comments with the code so that you dont have any problem in recalling it again after some time

// INSTRUCTIONS : for reading the comments
// /*** important ***/
// I have also metioned the block name where I am referencing it
// Every block have its use and package name written above it



// Using Faker : a function which will return a random user
let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password()
    ];
};

// 1.1 pushing the users in bulk
let data = []; // decalring an empty array
for(let i=1; i<=100; i++){
    data.push(getRandomUser()); // will push the array from the function getRandomUser() to our empty array
};

// Using MySQL2
const connection = mysql.createConnection({ // creating a connection between this file and our database from mysql workbench
    host: "localhost",
    user: "root",
    database: "twitter", // name of the database, this will give us the database, now after here we will work only with the tables from this database
    password: "newpass@123" // mysql root password
});

// try { // making a connecttion query for the first time
//     connection.query("SHOW TABLES", (err, result) => {
//         if (err) throw err;
//         let myResult = result;
//         console.log("Succesfully Connected.");
//     });
// } catch (err) {
//     console.log("Error connecting to the database!", err);
// };

// 1.2 Inserting new data
// let q = "INSERT INTO new_user (id, username, email, `password`) VALUES ?"; // storing our query in the q variable
// let users = [
//     ["999", "999_newuser", "999@gmail.com", "999"],
//     ["888", "888_newuser", "888@gmail.com", "888"],
// ];

// connection.query(q, [users], (err, result) => {  // here we have defined the user ourself block 1.2
// connection.query(q, [data], (err, result) => { // this is the data variable which we used to store our random users from faker in above block 1.1
//     if (err) {
//         console.log("Error connecting to the database.", err);
//         return;
//     } else {
//         console.log("Successfully Connected.", result);
//     };
// });


// Home Route
app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM new_user`; // sql query to get the count of list members
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            // console.log("Succesfully Connected.", result);
            // res.send(result);
            // console.log("Succesfully Connected.", result[0]);
            // res.send(result[0]); // it will only show the number
            let count = result[0]["count(*)"]; // result[0] is an array, ["count(*)" : this accesses the value of the column named "count(*)" from the first row
            // res.send("Success"); // since result is an object we can use key to get its value
            res.render("home.ejs", {count});
        });
    } catch (err) {
        console.log("Error connecting to the database!", err); // if you have any error in the connection query, this block will catch it and let us konw that something is wrong
        res.send("Some error in database.");
    };
});


// Show Route
app.get("/user", (req, res) => {
    let q = `SELECT * FROM new_user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let users = result; // here we are getting all the users (100 in this case) so thats why we are using the result as it is
            res.render("userlist.ejs", { users }); // res.render is used where we have to send a file while res.send is used just to send a messege
        });
    } catch (err) {
        console.log("There was an error connecting to database.");
    }
});


// Edit Route
app.get("/user/:id/edit", (req, res) => { // if you see /:abc, it means we are getting the id with the request itself
    let {id} = req.params; // to access the things we are getting along with the requst, most of the time we send id with params
    let q = `SELECT * FROM new_user WHERE id='${id}'`; // selecting user from the table 'new_user' in the 'twitter' database
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0]; // here we dont want the result array, we just need the element which it have, so using result[0], since it will only have one user because we have set id as primary key (in the database) so with every id you can only have one user
            res.render("editform.ejs", { user }); // rendering the editform.ejs along with the user info which will help us show the user details in the edit form page
        });
    } catch (err) {
        console.log("There was an error connecting to database.");
    }
});


// Update DB route
app.patch("/user/:id", (req, res) => { // we have got this request from the form in the file editform.ejs
    let { id } = req.params; // we have the id in the request itself
    let {username : formName, password : formPass} = req.body; // since the request was made using a form, the form data can come in many formats but automatically it comes in the request body
    //*** the syntax username: formName is key:value pair, to make the pair the name of the element in the form sould be the same as we naming key here, ie.. "username" is the name="username" in the form input field which is taking the input for user name in the editform.ejs, similarly with the password is the name="password" in the input field of password in the editform.ejs ***/
    let q = `SELECT * FROM new_user WHERE id = '${ id }'`;
    try{
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            if(formPass != user.password){ // checking if the password user have entered in the form matches the original in the database
                res.send("Wrong Details");
            } else {
                let q2 = `UPDATE new_user SET username = '${formName}' WHERE id = '${id}'`;
                connection.query(q2, (err, result) => {
                    if(err) throw err;
                    res.redirect("/user");
                });
            }
        });
    } catch (err) {
        console.log("There was an error connecting to database in Update DB route");
    };
});

// Join Route
app.get("/join", (req, res) => {
    let id = uuidv4();
    // console.log("here is your id", {id});
    res.render("join.ejs", {id});
});


// Join push
app.post("/join/:id", (req, res) => {
    let {id } = req.params;
    // console.log("i got the id and pass");
    let {username, email, password} = req.body;
    let q = `INSERT INTO new_user VALUES ('${id}', '${username}', '${email}', '${password}')`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.redirect("/");
        });
    } catch (err) {
        res.send("Error connecting to the DB in the join/push route!");
    }
});

// Destroy Route
app.delete("/user/:id", (req, res) => {
    // res.send("Delete route working fine");
    let {id} = req.params;
    let q = `SELECT * FROM new_user WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            // console.log("connected to database here is your requierd info : ", result[0]);
            res.render("delete.ejs", {user});
        });
    } catch (err) {
        console.log("There was an error connecting to the DB in destroy route!");
    }
    // res.render("delete.ejs");
});

// Delete from DB
app.post("/user/:id/delete", (req, res) => {
    let {id} = req.params; // extracting user id from req.params
    let {password : formPass, c_password : c_formPass} = req.body; // getting the password and confirm password the user have entered in the form
    let q = `SELECT * FROM new_user WHERE id='${id}'`; // sending the request to db table "new_user" to get the user info using its id
    try {
        connection.query(q, (err, result) => { // sending the query connection request to the db to get the user info
            if (err) throw err; // if there is an error connecting to the database, this will throw it, which we will catch later
            let user = result[0]; // declaring a variable user which will store our user; since result is an array of arrays, using result[0] will give us the child/inner array
            if(formPass !== c_formPass || formPass != user.password){ // checking if the password user entered is matching with entered confirm password and also with the password of the user in the database
                console.log("Something went wrong. Try again!"); // if the passwords do not matches
                res.send("password sahi se daal love day");
                return;
            } else { // now if the password have matched
                let q2 = `DELETE FROM new_user WHERE id='${id}'`; // sending a query which will delete the user from the database
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    console.log("Connected to DB! and kicked the user out of our database.");
                    res.redirect("/"); // this will redirect us to the home page
                });
            };
        });
    } catch (err) {
        console.log("There was an error connecting to the DB in delete from db route!"); // if there is some error thrown from above block, this block will catch it
    };
});

// app.post("/delete", (req, res) => {
//     res.send("delete request recieved");
// });

// connection.query("SHOW TABLES", (err, result) => {
//     if (err) {
//         console.log("Error connecting to the database.", err);
//         return;
//     } else {
//         console.log("Successfully Connected.", result);
//         console.log("Number of tables in the database are: ", result.length);
//         console.log("First table: ", result[0]);
//         console.log("Second table: ",result[1]);
//     };
// });


// Exoress server which will listen to the requsts, make sure you write it at the bottom of the code otherwise it will consume all the requests and server will return just this message "App is listening at 'port_name'"
app.listen(port, () => {
    console.log(`App is listening at ${port}`); // `tield` sign allow us to write variables with the message use ${variable} .
});

// IT WAS WONDERFUL WRITING AND LEARNING ABOUT THIS CODE :)