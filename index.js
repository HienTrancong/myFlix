
const
  express = require ('express'), //import express framework
  bodyParser = require('body-parser'), //middleware to parse request bodies before handlers
  morgan = require ('morgan'); //Logging middleware for Express

const
  app = express(); //variable to encapsulates Express functionality

// Array of objects containing data about top10 movies
// Credit to https://editorial.rottentomatoes.com/guide/2021-best-movies/
let topMovies = [
  {
    title: '76 Days',
    rank: 1,
    director: 'Hao Wu, Weixi Chen',
    genre: ['Documentary','Drama']
  },
  {
    title: 'Drive My Car',
    rank: 2,
    director: 'Ryûsuke Hamaguchi',
    genre: 'Drama'
  },
  {
    title: 'Quo Vadis, Aida?',
    rank: 3,
    director: 'Jasmila Zbanic',
    genre: ['War','Drama']
    },
  {
    title: 'Slalom',
    rank: 4,
    director: 'Charlène Favier',
    genre: ['Drama','Narrative']
  },
  {
    title: 'The Worst Person In The World',
    rank: 5,
    director: 'Joachim Trier',
    genre: ['Romance','Drama']
  },
  {
    title: 'Parallel Mothers',
    rank: 6,
    director: 'Pedro Almodóvar',
    genre: 'Drama'
  },
  {
    title: 'Luzzu',
    rank: 7,
    director: 'Alex Camilleri',
    genre: 'Drama'
  },
  {
    title: 'Sabaya',
    rank: 8,
    director: 'Hogir Hirori',
    genre: 'Documentary'
  },
  {
    title: 'Mayor',
    rank: 9,
    director: 'David Osit',
    genre: 'Documentary'
  },
  {
    title: 'Paper Spiders',
    rank: 10,
    director: 'Inon Shampanier',
    genre: 'Drama'
  },
];

//morgan middleware common logger format
app.use(morgan('common')); 

// Welcome to page
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

// GET list of all movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// GET data about a movie by title
app.get('/movies/:title', (req, res) => {
  res.json(topMovies.find((movie) => {
    return movie.title === req.params.title
  }));
});

// GET  data about a genre by genreName
app.get('/genres/:genreName', (req, res) => {
  res.send('Sucessfully GET JSON object about data of a genre');
});

// GET data about a director by directorname
app.get('/directors/:directorName', (req, res) => {
  res.send('Sucessfully GET JSON object about data of a director');
});

// ADD new user
app.post('/users', (req, res) => {
  res.send('Sucessfully ADD a new user');
});

// UPDATE user info
app.put('/users/:userName', (req, res) => {
  res.send('Sucessfully UPDATE data of a user');
});

// ADD a movie to user's list of favorites
app.post('/favourites/:userName/:movieName', (req, res) => {
  res.send('Sucessfully ADD a movie to user\'s favorite movies list');
});

// DELETE a movie from a user's list of favorites
app.delete('/favourites/:userName/:movieName', (req, res) => {
  res.send('Sucessfully DELETE data of a movie from user\'s favorite movies list');
});

// DELETE a user by userName
app.delete('/users/:userName', (req, res) => {
  res.send('Sucessfully REMOVE the user');
});

//express function to route all requests for static files to files within certain folder on server
app.use(express.static('public')); 

//express error handling middleware (whatever unexpected errors)
app.use((err,req,res,next) => { 
    console.error(err.stack);
    res.status(500).send('Something broken!');
});

// Listener
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
