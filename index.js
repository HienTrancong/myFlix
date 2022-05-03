const express = require('express'); //import express framework
const bodyParser = require('body-parser');//express's middleware 'bodyParser' to parse request bodies before handlers, parse json format
const app = express(); //App variable to encapsulates Express functionality to app as instance
const morgan = require('morgan'); //express's middleware 'morgan' to log changes, using 'common' format
const mongoose = require('mongoose'); // mongoose package
const Models = require('./models.js'); // import models file
const cors = require('cors'); // node.js package for cross origin resouce sharing
const { check, validationResult } = require('express-validator'); //JS library for validation in back-end
const uuid = require('uuid'); //package to generate Universal Unique ID


const Movies = Models.Movie; //import model Movie
const Users = Models.User; //import model Users

//OLD method to connect mongoose to local MongoDB
//mongoose.connect('mongodb://localhost:27017/myFlixMongoDB', {useNewUrlParser: true, useUnifiedTopology: true});

//NEW method to connect mongoose to MongoDB Atlas database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//CORS
/*
let allowedOrigins = ['http://localhost:8080','http://localhost:1234','http://testsite.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1){ //If a specific origin isn't found on the list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));
*/

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200
}

app.use(cors(corsOptions));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});


app.use(morgan('common')); // morgan using 'common' format
app.use(bodyParser.json()); //parse parse JSON into JS variables
app.use(bodyParser.urlencoded({ extended: true })); //parse URL-encoded requests, extended: true for values of any type iso just string
app.use(express.static('public')); //Express built-in middle ware to serve static file from a directory

let auth = require('./auth.js')(app); //call 'auth.js' file, 'app' argument ensures Express is available in auth.js as well
const passport = require('passport'); //express compatible middle ware 'passport' to authenticate requests
require('./passport.js'); //call passport file

// Welcome to page
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

//Documentation
app.get('/documentation', (req, res) => {
  res.sendFile('/public/documentation.html', { root: __dirname })
});

//1. GET list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies
    .find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//2. GET data about a movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies
    .findOne({ Title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//3. GET data about a genre by genreName
app.get('/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies
    .findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//4. GET data about a director by name
app.get('/director/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies
    .findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// GET data of a single user by name
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users
    .findOne({ Username: req.params.Username })
    .then((user) => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(400).send('User with username' + req.params.Username + ' is not found');
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//5. GET list of all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => { //Json-Web-Token euthentication calling from auth.js
  Users
    .find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//6. ADD new user
/*Expect JSON in this format
{
Username: String, (required)
Password: String,(required)
Email: String,(required)
Birthday: Date
}
*/
//back-end validation logic
app.post('/users',
  [
    check('Username', 'Username is required, with at least 5 characters').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does now appear to be valid').isEmail(),
  ], (req, res) => {
    // error-handling function, if any error send a JSON object as HTTP response
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password); //hash password entered by user before storing in MongoDB
    Users.findOne({ Username: req.body.Username }) //Search to see if user with requested username already exists
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exist');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(Error);
        res.status(500).send('Error: ' + error);
      });
  });

//7. UPDATE user information by username
/*
 Username: String, (required)
 Password: String,(required)
 Email: String,(required)
 Birthday: Date
*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  //back-end validation logic ?
  [
    check('Username', 'Username is required, with at least 5 characters').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does now appear to be valid').isEmail(),
  ], (req, res) => {
    // error-handling function, if any error send a JSON object as HTTP response
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password); //hash password entered by user before storing in MongoDB
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }, //Option, make sure the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

//8. DELETE a user by userName
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove
    ({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' is deleted.')
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//9. ADD a movie to user's list of favorites
app.post('/users/:userName/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.userName },
    {
      $push: {
        FavoriteMovies: req.params.movieID
      }
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//10. DELETE a movie to user's list of favorites
app.delete('/users/:userName/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.userName },
    {
      $pull: {
        FavoriteMovies: req.params.movieID
      }
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Listener
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});