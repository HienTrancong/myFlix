

const express = require ('express'); //import express framework, with app variable to encapsulates Express functionality to app as instance
const cors = require ('cors');
const {check, validationResult} = require('express-validator') //?
const morgan = require ('morgan'); //express's middleware 'morgan' to log changes, using 'common' format
const bodyParser = require('body-parser');//express's middleware 'bodyParser' to parse request bodies before handlers, parse json format
const app = express(); 

const uuid = require ('uuid'); //package to generate Universal Unique ID

const mongoose = require('mongoose'); // mongoose package
const Models = require('./models.js'); // import models file
const Movies = Models.Movie; //import model Movie
const Users = Models.User; //import model Users

 //method to connect mongoose to MongoDB
mongoose.connect('mongodb://localhost:27017/myFlixMongoDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(cors());
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); //?


let auth = require('./auth')(app); //call 'auth.js' file, 'app' argument ensures Express is available in auth.js as well
const passport =  require('passport'); //express compatible middle ware 'passport' to authenticate requests
require ('./passport.js'); //call passport file



// Welcome to page
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

// Documentation
app.get('/documentation',(req, res) => {
  res.sendfile('/public/documentation.html', {root:__dirname})
});

//1. GET list of all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err)=> {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//2. GET data about a movie by title
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title: req.params.title })
  .then ((movie) => {
    res.json(movie);
  })
  .catch ((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//3. GET data about a genre by genreName
app.get('/genre/:genreName', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.genreName })
  .then ((movie) => {
    res.json(movie.Genre);
  })
  .catch ((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//4. GET data about a director by name
app.get('/director/:directorName', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Director.Name': req.params.directorName })
  .then ((movie) => {
    res.json(movie.Director);
  })
  .catch ((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//5. GET list of all users
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err)=> {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//6. ADD new user
  // Expect JSON in this format
  // {
  //   Username: String,
  //   Password: String,
  //   Email: String,
  //   Birthday: Date
  // }

 app.post('/users',
  //back-end validation logic ?
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does now appear to be valid').isEmail(),
  ],
  (req, res) => {
  // error-handling function, if any error send a JSON object as HTTP response ?
  let errors = validationResult(req); 
  if (!errors.isEmpty()) {
    return res.status(422).json({error: errors.array()});
  }
  let hashedPassword = Users.hashPassword(req.body.Password); //hash password entered by user before storing in MongoDB
  Users.findOne({ Username: req.body.Username }) //Search to see if user with requested username already exists
  .then((user) => {
    if (user) { 
      return res.status(400).send(req.body.Username + 'already exist');
    } else { Users.create({
        Username: req.body.Username, 
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
        })
      .then((user) => {res.status(201).json(user)})
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      }) 
    }
  }) 
  .catch((error) => {
    console.error(Error);
    res.status(500).send('Error: ' + error);
  });
 });

//7. Update user information by username
/*
 Username: String, (required)
 Password: String,(required)
 Email: String,(required)
 Birthday: Date
*/
 app.put('/users/:Username', 
  //back-end validation logic ?
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does now appear to be valid').isEmail(),
  ],
  (req, res) => {
  // error-handling function, if any error send a JSON object as HTTP response ?
  let errors = validationResult(req); 
  if (!errors.isEmpty()) {
    return res.status(422).json({error: errors.array()});
  }
 passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    {Username: req.params.Username }, 
    {$set: {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
      }
    },
    {new: true}, //Option, make sure the updated document is returned
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
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove
  ({ Username: req.params.Username})
  .then( (user) => {
    if(!user) {
      res.status(400).send(req.params.Username + ' was not found.');
    } else {
      res.status(200).send(req.params.Username + ' is deleted.')
    }
  })
  .catch( (err) => {
    console.error(err);
    res.status(500).send('Error: '+ err);
  });
});

//9. ADD a movie to user's list of favorites
app.post('/users/:userName/movies/:movieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.userName },
    { $push: {
        FavoriteMovies: req.params.movieID
      }
    },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: '+ err);
      } else {
        res.json(updatedUser);
      }
    });
});

//10. DELETE a movie to user's list of favorites
app.delete('/users/:userName/movies/:movieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.userName },
    { $pull: {
        FavoriteMovies: req.params.movieID
      }
    },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: '+ err);
      } else {
        res.json(updatedUser);
      }
    });
});

// Listener
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});
