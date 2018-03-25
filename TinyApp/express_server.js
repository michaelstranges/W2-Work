//Constants
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["topsecret"]
}))

//User Database structure
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "test": {
    id: "test",
    email: "test@test.com",
    password: bcrypt.hashSync("test", 10)
  }
}

//URL Database structure
var urlDatabase = {
  test : {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

//Basic Route Page
app.get("/", (req, res) => {
  res.end("Hello!");
});

//Json File
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// -/urls page using "urls_index" page to render
app.get("/urls", (req, res) => {
  let theUser = req.session.user_id
  let templateVars = { urls : urlDatabase, user : users[req.session.user_id] };
  if(users[req.session.user_id] === undefined){
    res.redirect("/login") //wres.redirect("/login")
  } else {
    res.render("urls_index", templateVars);
  }
})

// -/hello page
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//Page to add a new shortURL to the login users page
app.get("/urls/new", (req, res) => {
  let templateVars = { user : users[req.session.user_id]  };
// if cookies object is empty (equal 0) then go to login
  if(Object.keys(req.session.user_id).length === 0){
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

//Link edit page
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, user : users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

//POST requests to /urls helps render main index page.  Send all the data seen below.
app.post("/urls", (req, res) => {
  let newID = req.session.user_id;
  let shortURLID = generateRandomString()
  let templateVars = { urls : urlDatabase, user : users[req.session.user_id] };

  urlDatabase[req.session.user_id][shortURLID] = req.body.longURL
  res.render("urls_index", templateVars)
});

//Login page
app.get("/login", (req, res) => {
  res.render("urls_login")
});

//upon visting /u/shortURL code - anyone can access short links.  Do not need to be logged in.
app.get("/u/:shortURL", (req, res) => {
  let longURL = "";

  for (let user in urlDatabase){
    for(shortURL in urlDatabase[user]){
      if(shortURL === req.params.shortURL){
        longURL = urlDatabase[user][shortURL]
        break;
      }
    } //stopped here! try to match up URL
  }
  res.redirect(longURL);
});

//confirmation on console that server is listening
app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});

//delete page - upon clicking delete on urls, redirects to this page
app.post("/urls/:id/delete", (req, res) => {
    //console.log("I'm communicating")
    let linkID = req.params.id
    delete urlDatabase[req.session.user_id][linkID]
  res.redirect("/urls");
});

//edit page - upon clicking edit - links to this page
app.post("/urls/:id", (req, res) => {
  let longURL = "";
  let thisUser = req.session.user_id

  for(let user in urlDatabase){
    for(let shortURL in urlDatabase[user]){
      if(user === thisUser){
          if(shortURL === req.params.id){
        urlDatabase[user][shortURL] = req.body.toUpdate
        }
      }
    }
  }
res.redirect("/urls")
});


app.post("/login", (req,res) =>{

  let match = 0;
  for(let currUser in users){
    if ((req.body.email === users[currUser].email) && ((bcrypt.compareSync(req.body.password, users[currUser].password)))) {
      req.session.user_id = users[currUser].id;
      res.redirect("/urls");
      match += 1; //adds one if a match is found
    }
  }
//if no match is found will equal 0 and this status will show up
  if(match === 0) {
    res.status(403).send("403: Username or Password Invalid")
  }
});

app.post("/logout", (req,res) => {

  req.session = null
  res.redirect("/urls");

});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {

//checks if a blank was sent for email
  if(req.body.email === ""){
    res.status(400).send("400: Please enter an email");
  }
//check if a blank was sent for password
  if(req.body.password === ""){
    res.status(400).send("400: Please enter a password");
  }
//check if email already exists
  for(let existEmail in users){
    if(req.body.email === users[existEmail].email){
      res.status(400).send("400: That email already exists.  Please Try Again")
    }
  }

  let myID = generateRandomString()
  let newAcc = {};
  let newURL = {};

  newAcc.id = myID
  newAcc.email = req.body.email

  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  newAcc.password = hashedPassword;

  users[myID] = newAcc;
  urlDatabase[myID] = newURL;

  req.session.user_id = myID
  res.redirect("/urls")

});

const myshortURL = "";

//Random string generator
function generateRandomString(){
  let alpha = ["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  let alphaSplit = alpha.join("").split("");
  let myshortURL = "";
    for(let i = 0; i < 6; i++){
      let randVal = Math.floor(Math.random() * 51);
      let myLetter = alphaSplit[randVal];
      myshortURL = myshortURL + myLetter;
    }
  return myshortURL;
}
