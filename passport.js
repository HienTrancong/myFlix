//express compatible middleware 'passport' to authenticate requests, passport use plugins call strategies
const passport = require('passport');

//define variable stratefy of basic HTTP autehntication 
//local strategy take usename & password from request body, and use mongoose to check for user with same username (password is not checked here)
const LocalStrategy = require('passport-local').Strategy;

//import user model
const Models = require('./models.js');

//define variable strategy for authenticating with JSON web token, used in RESTful endpoints without sessions.
const passportJWT = require('passport-jwt');


let Users = Models.User;
let JWTStrategy = passportJWT.Strategy; 
let ExtractJWT = passportJWT.ExtractJwt; 

//default parameters usernameField; passwordField
//the fields define the name of properties in POST body sent to server
passport.use(new LocalStrategy({
    usernameField: 'Username', 
    passwordField: 'Password'
    }, (username, password, callback) => {
    console.log(username + ' ' + password);
    Users.findOne({Username: username}, (error, user) => {
        if (error) {  //if error occur, error is passed to the callback
            console.log(error);
            return callback(error);
        }
        if (!user) { //if user can't be found in db, message is passed to to the callback
            console.log('incorrect username');
            return callback(null, false, {message: 'Incorrect username or password'}); //? format of parameter
        }
        if (!user.validatePassword(password)) { //Hash password when user login before comparing to passwords stored in MongoDB
            console.log('incorrect password');
            return callback(null, false, {message: 'Incorrect password'});
        }
        console.log('finished');// if there is a user matching, callback provide a user
        return callback(null,user);
    });
}));

//JWT is extracted from header of HTTP request, this JWT is called "bearer token"
    //secret key to verify the signature of the JWT, this signature verifies the sender identity, also to verify that the JWT hasn'T been altered   
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), 
    secretOrKey: 'your_jwt_secret'}, (jwtPayload, callback) => {
        return Users.findById(jwtPayload._id) //Mongoose function to find a document by _id
            .then((user) => {
                return callback(null, user);
            })
            .catch((error) => {
                return callback(error);
            });
}));