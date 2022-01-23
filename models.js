const mongoose = require('mongoose'); //mongoose package

// Define Schema for Movies collection
let movieSchema = mongoose.Schema({
    _id: {type: String, required: true},
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: Date,
        Death: Date
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

// Define Schema for Users collection
//by default Mongoose adds an _id property to the schema
let userSchema = mongoose.Schema({
    Username: { type: String, required: true},
    Password: { type: String, required: true},
    Email: { type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

// Creating models that use the schemas

let Movie = mongoose.model('Movie', movieSchema); //this will create collection called db.movies in MongoDB
let User = mongoose.model('User', userSchema); //this will create collection called db.users in MongoDB

// Export models so that index.js can import
module.exports.Movie = Movie;
module.exports.User = User;
