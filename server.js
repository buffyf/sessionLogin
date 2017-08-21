const express = require("express");
const mustacheExpress = require("mustache-express");
const session = require("express-session");
const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const sessionConfig = require("./sessionConfig");
const users = require("./data");
const checkAuth = require("./middlewares/checkAuth");
const app = express();
const port = process.env.PORT || 8000;

//templating engine
app.engine("mustache", mustacheExpress());
app.set("views", "./views");
app.set("view engine", "mustache");

//middleware
app.use(express.static(path.join(__dirname, "./public")));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionConfig));

//endpoints
app.get("/", (req, res) => {
    console.log(req.session);
    if (req.session.user) {
        res.render("home", { user: req.session.user });
    } else {
        res.render("login");
    }
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", (req, res) => {
    let newUser = req.body;

    console.log("newUser: ", newUser);
    users.push(newUser);
    console.log("users: ", users);
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/login", (req, res) => {
    let reqUsername = req.body.username;
    let reqPassword = req.body.password;

    let foundUser = users.find(user => user.username === reqUsername);
    if (!foundUser) {
        return res.render("login", { errors: ["User does not exist"] });
    }

    if (foundUser.password === reqPassword) {
        delete foundUser.password;
        req.session.user = foundUser;
        res.redirect("/");


    } else {
        return res.render("login", { errors: ["Password does not match"] });
    }
});

// app.get("/", checkAuth, (req, res) => {
//     res.render("home", { user: req.session.user });
// });

app.get("/profile", checkAuth, (req, res) => {
    res.render("profile", { user: req.session.user });
});



app.listen(port, () => {
    console.log(`running on port: ${port}`);
});