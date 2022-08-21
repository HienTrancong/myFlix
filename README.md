# myFlix movie API

## Purpose

It is the server-side component of a “movies” web application. The web application will provide users with access to information about different movies, directors, and genres. Users will be able to sign up, update their personal information, and create a list of their favorite movies.

## Key features

1. Return a list of ALL movies to the user
2. Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
3. Return data about a genre (description) by name/title (e.g., “Thriller”)
4. Return data about a director (bio, birth year, death year) by name
5. Allow new users to register
6. Allow users to update their user info (username, password, email, date of birth)
7. Allow users to add a movie to their list of favorites
8. Allow users to remove a movie from their list of favorites
9. Allow existing users to deregister

## Technological dependencies

- node.js
- express, express-validator
- passport, passport-jwt, passport-local
- Body-parser
- bcrypt
- cors
- jsonwebtoken
- mongoose
- morgan
- uuid

## Technical requirements

- The API is a Node.js and Express application.
- The API uses RESTful architecture, with URL endpoints corresponding to the data operations listed above
- The API uses at least three middleware modules, such as the body-parser package for reading data from requests and morgan for logging.
- The API uses a “package.json” file.
- The database is built using MongoDB.
- The business logic is modeled with Mongoose.
- The API provides movie information in JSON format.
- The API is tested in Postman.
- The API includes user authentication and authorization code.
- The API include data validation logic.
- The API meets data security regulations.
- The API source code is deployed to a publicly accessible platform like GitHub.
- The API is deployed to Heroku.

## API details

For details about the API including Business logic, URL, HTTP methods and data format, visit [Documentation.html](https://hientrancong.github.io/meet/)
