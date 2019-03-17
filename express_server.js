var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var PORT = 8080; // default port 8080

const bcrypt = require('bcrypt');

const urlDatabaseNew = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "u112233"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  },
  ubfir: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  },
  i3jGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  },
};

let users = {
  "u112233": {
    userID: "u112233",
    email: "user@example.com",
    password: "test"
  },
  "user2RandomID": {
    userID: "user2RandomID",
    email: "user2@example.com",
    password: "test"
  }
}

function findUsersUrls(userID) {
  let obj = {};
  for (let shortUrl in urlDatabaseNew) {
    //urlDatabaseNew[shortUrl] returns whole object
    //urlDatabaseNew[shortUrl].userID return just the userID in that object
    if (urlDatabaseNew[shortUrl].userID === userID) {
      //create object to return
      obj[shortUrl] = urlDatabaseNew[shortUrl];
    }
  }
  return obj;
}

function getUrlObj(shortUrl) {
  return urlDatabaseNew[shortUrl];
}

//generate random URL
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}


const bodyParser = require("body-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

// set the view engine to ejs
app.set('view engine', 'ejs');

//dashboard
app.get("/urls", (req, res) => {
  if (req.cookies) {
    if (req.cookies["login_cookie"]) {
      templateVars = {
        user: users[req.cookies["login_cookie"]],
        urllist: findUsersUrls(req.cookies["login_cookie"])
      };
      res.render("urls_index", templateVars);
    } else {
      res.clearCookie("login_cookie");
      templateVars = {
        user: '',
        urls: []
      };
      res.redirect("login");
    }
  } else {
    res.clearCookie("login_cookie");
    templateVars = {
      urls: '',
      urls: []
    };
    res.redirect("/login");
  }
});

//form to crate a new URL
app.get("/urls/new", (req, res) => {
  if (req.cookies["login_cookie"]) {
    res.render("urls_new");
  } else {
    res.redirect("/login");
  }
});

//Displays URL
app.get("/urls/:shortURL", (req, res) => {
  //check if the current user is logged in so they can update their own urls
  if (getUrlObj(req.params.shortURL).userID === req.cookies["login_cookie"]) {
    var shortKey = req.params.shortURL; //shortKey
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabaseNew[shortKey].longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Adds and displays random url once created
app.post("/urls", (req, res) => {
  var randomID = generateRandomString();
  urlDatabaseNew[randomID] = {
    longURL: req.body.longURL,
    userID: req.cookies["login_cookie"]
  }
  res.redirect("/urls/" + randomID);
});

//delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabaseNew[req.params.shortURL];
  res.redirect("/urls");
});

//update URL
app.post("/urls/:shortURL/update", (req, res) => {

  if (getUrlObj(req.params.shortURL).userID === req.cookies["login_cookie"]) {
    urlDatabaseNew[req.params.shortURL].longURL = req.body.edit_url;
    res.redirect("/urls/");
  } else {
    res.redirect("/login");
  }
});

//inputting /u/short_url will redirect to the site
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabaseNew[req.params.shortURL].longURL);
});

//login
function authenticateUser(email, password) {
  for (var key in users) {
    if (email == users[key].email && password == users[key].password) {
      return users[key];
    }
  }
}

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {

  const email = String(req.body.username);
  const password = String(req.body.password);

  let user = authenticateUser(email, password);
  if (user) {
    //it means the user is authenticated
    res.cookie("login_cookie", user.userID);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send('E-mail or password is wrong');
  }
});

//Register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = String(req.body.email);
  const password = String(req.body.password);
  //const hashedPassword = bcrypt.hashSync(password, 10);
  if (email && password) {
    //create a new ID and add it to DB
    var userID = generateRandomString();
    users[userID] = {
      userID,
      email,
      password
    };
    res.cookie("login_cookie", userID);
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('Please enter e-mail and password');
  }
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("login_cookie");
  res.redirect("login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});