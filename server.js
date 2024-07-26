/*********************************************************************************
*  WEB700 – Assignment 4
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Pamela Daisy Ferrao   Student ID: 138230230    Date: 2024-07-22

*Online (vercel) link: https://assignment-5-roan.vercel.app/

********************************************************************************/

var express = require("express"); // Importing the express module
var path = require("path"); // Importing the path module
var exphbs = require("express-handlebars"); // Importing the express-handlebars module
var data = require("./modules/collegeData.js"); // Importing custom data module

var app = express(); // Creating an express application

var HTTP_PORT = process.env.PORT || 8080; // Defining the port for the server

// Setting up the handlebars view engine with custom helpers
app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs'); // Setting the view engine to handlebars

app.use(express.static("public")); // Serving static files from the "public" directory
app.use(express.urlencoded({extended: true})); // Parsing URL-encoded bodies

// Middleware to set the active route for navigation
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});

// Route for the home page
app.get("/", (req,res) => {
    res.render("home");
});

// Route for the about page
app.get("/about", (req,res) => {
    res.render("about");
});

// Route for the HTML demo page
app.get("/htmlDemo", (req,res) => {
    res.render("htmlDemo");
});

// Route to display students, with optional course filtering
app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else {
        data.getAllStudents().then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    }
});

// Route to display the add student form
app.get("/students/add", (req,res) => {
    res.render("addStudent");
});

// Route to handle adding a student
app.post("/students/add", (req, res) => {
    data.addStudent(req.body).then(()=>{
        res.redirect("/students");
    });
});

// Route to display a specific student by student number
app.get("/student/:studentNum", (req, res) => {
    data.getStudentByNum(req.params.studentNum).then((data) => {
        res.render("student", { student: data }); 
    }).catch((err) => {
        res.render("student", {message: "no results"})
    });
});

// Route to handle updating a student
app.post("/student/update", (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

// Route to display courses
app.get("/courses", (req,res) => {
    data.getCourses().then((data)=>{
        res.render("courses", {courses: data});
    }).catch(err=>{
        res.render("courses", {message: "no results"});
    });
});

// Route to display a specific course by ID
app.get("/course/:id", (req, res) => {
    data.getCourseById(req.params.id).then((data) => {
        res.render("course", { course: data }); 
    }).catch((err) => {
        res.render("course",{message:"no results"}); 
    });
});

// Default route for handling 404 errors
app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});

// Initialize the data and start the server
data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
