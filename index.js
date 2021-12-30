
const
  express = require ('express'), //import express framework
  bodyParser = require('body-parser'), //middleware to parse request bodies before handlers
  morgan = require ('morgan'); //Logging middleware for Express

const
  app = express(); //variable to encapsulates Express functionality

let topMovies = [
  {
      "title": "The Shawshank Redemption",
      "rank": "1",
      "id": "tt0111161"
  },
  {
      "title": "The Godfather",
      "rank": "2",
      "id": "tt0068646"
  },
  {
      "title": "The Godfather: Part II",
      "rank": "3",
      "id": "tt0071562"
  },
  {
      "title": "Pulp Fiction",
      "rank": "4",
      "id": "tt0110912"
  },
  {
      "title": "The Good, the Bad and the Ugly",
      "rank": "5",
      "id": "tt0060196"
  },
  {
      "title": "The Dark Knight",
      "rank": "6",
      "id": "tt0468569"
  },
  {
      "title": "12 Angry Men",
      "rank": "7",
      "id": "tt0050083"
  },
  {
      "title": "Schindler's List",
      "rank": "8",
      "id": "tt0108052"
  },
  {
      "title": "The Lord of the Rings: The Return of the King",
      "rank": "9",
      "id": "tt0167260"
  },
  {
      "title": "Fight Club",
      "rank": "10",
      "id": "tt0137523"
  }
];

app.use(morgan('common')); //morgan middleware common logger format

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.use(express.static('public')); //express function to route all requests for static files to files within certain folder on server

app.use((err,req,res,next) => { //express error handling middleware (whatever unexpected errors)
    console.error(err.stack);
    res.status(500).send('Something broken!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
