const mongoose = require('mongoose'); //mongoose package
const bcrypt = require('bcrypt'); //Node.js moduleto hash password

// Define Schema for Movies collection
let movieSchema = mongoose.Schema({
    // _id: {type: String, required: true},
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

//function to hash password
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

//function to compare submitted password with hashed password stored in the database
// no arrow function (for instance methods), this refer to actual user document rather than .methods
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

// Creating models that use the schemas

let Movie = mongoose.model('Movie', movieSchema); //this will create collection called db.movies in MongoDB
let User = mongoose.model('User', userSchema); //this will create collection called db.users in MongoDB

// Export models so that index.js can import
module.exports.Movie = Movie;
module.exports.User = User;