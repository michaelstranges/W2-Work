const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "test": {
    id: "test",
    email: "test@test.com",
    password: "test"
  }
}

var urlDatabase = {
  test : {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//uses templateVars
app.get("/urls", (req, res) => {
  let theUser = req.cookies["user_id"]
  let templateVars = { urls : urlDatabase, user : users[req.cookies["user_id"]] };
  if(users[req.cookies["user_id"]] === undefined){
    res.redirect("/login") //when logged out go here
  } else {
    res.render("urls_index", templateVars);
  }
})

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//uses templateVars
app.get("/urls/new", (req, res) => {
  let templateVars = { user : users[req.cookies["user_id"]]  };
// if cookies object is empty (equal 0) then go to login
  if(Object.keys(req.cookies).length === 0){
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

//uses templateVars
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, user : users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // debug statement to see POST parameters
  let newID = req.cookies["user_id"];
  let shortURLID = generateRandomString()
  let templateVars = { urls : urlDatabase, user : users[req.cookies["user_id"]] };

  urlDatabase[req.cookies.user_id][shortURLID] = req.body.longURL
  res.render("urls_index", templateVars)
 // res.redirect(`http://localhost:8080/urls/${newID}`)

  })

app.get("/login", (req, res) => {

  res.render("urls_login")

})

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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.post("/urls/:id/delete", (req, res) => {
    console.log("I'm communicating")
    let linkID = req.params.id
    delete urlDatabase[req.cookies.user_id][linkID]
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  let longURL = "";
  console.log("I'm working")
  let thisUser = req.cookies.user_id
  console.log(req.params.id)

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
})


app.post("/login", (req,res) =>{

let match = 0;

  for(let currUser in users){
    if ((req.body.email === users[currUser].email) && ((req.body.password) === users[currUser].password)){
      res.cookie("user_id", users[currUser].id)
      res.redirect("/urls");
      match += 1; //adds one if a match is found
    }
  }
//if not match is found will equal 0 and this status will show up
  if(match === 0) {
    res.sendStatus(403)
  }
})

app.post("/logout", (req,res) => {

  res.clearCookie("user_id")
  res.redirect("/urls");

})

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/register", (req, res) => {

//checks if a blank was sent for email
  if(req.body.email === ""){
    res.sendStatus(400).send("Please enter an email");
  }
//check if a blank was sent for password
  if(req.body.password === ""){
    res.sendStatus(400).send("Please enter a password");
  }
//check if email already exists
  for(let existEmail in users){
    if(req.body.email === users[existEmail].email){
      res.sendStatus(400).send("That email already exists.  Please Try Again")
    }
  }

  let myID = generateRandomString()
  let newAcc = {};
  let newURL = {};

  newAcc.id = myID
  newAcc.email = req.body.email
  newAcc.password = req.body.password

  users[myID] = newAcc;
  urlDatabase[myID] = newURL;

  console.log(users)
  console.log(urlDatabase)

  //console.log(users)

  res.cookie("user_id", myID)
  res.redirect("/urls")


})

//I am testing out github branching and merging
//playing
//around
//here
//with github

const myshortURL = "";

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
