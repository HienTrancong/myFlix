const jwtSecret = 'your_jwt_secret'; // This has to be same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); //local passport file

/**
 * Create a JWT based on username & password
 * @param {*} user 
 * @returns username encoding in the JWT, token which will expire in 7d, algorithm used to "sign" or encode the values of the JWT
 */
let generateJWTToken = (user) => { //function to create a JWT based on username & password
    return jwt.sign(user, jwtSecret, { //response to client
        subject: user.Username, // This is the username encoding in the JWT
        expiresIn: '7d', //token will expire in 7d
        algorithm: 'HS256' // This is the algorithm used to "sign" or encode the values of the JWT
    });
}

/**
 * POST login.
 * @param {*} router 
 */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token }); // shorthand for res.json({user: user, token: token})
            });
        })(req, res);
    });
}