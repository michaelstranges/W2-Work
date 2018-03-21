const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls : urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
})

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  //console.log(req.body);  // debug statement to see POST parameters
  let newID = generateRandomString()
  //console.log(req.body)
  urlDatabase[newID] = req.body.longURL
  //console.log(urlDatabase);
  res.redirect(`http://localhost:8080/urls/${newID}`)
  })

app.get("/u/:shortURL", (req, res) => {

  let longURL = "";

  for (let URL in urlDatabase){
    if(URL === req.params.shortURL){
      longURL = urlDatabase[URL]
    }
  }
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
  res.redirect("/urls");
})

app.post("/urls/:id", (req,res) => {
  let longURL = "";
  for(let URL in urlDatabase){
      if(URL === req.params.id){
        urlDatabase[URL] = req.body.toUpdate
      }
  }
})

app.post("/login", (req,res) =>{

  res.cookie("username", req.body.username)
  res.redirect("/urls");

})

app.post("/logout", (req,res) => {

  res.cookie("username")
  res.redirect("/urls");

})



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
