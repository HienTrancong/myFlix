

// creating variable http, assign http module to it, used to create new server
const http =  require('http'),
  fs = require ('fs'),
  url = require ('url');


// on the http vaible, create createServer object, within that is another function with 2 arguments
// this funcsion or request handler is called everytime HTTP request is made against that server
http.createServer(function(request, response) {
    let addr = request.url, //variable for the request URL
        q = url.parse(addr, true), //parse request query URL
        filePath = ''; //used to store path of the file

    //appendFile append string to file 'file, string, error action'
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Added to log.');
      }
    }); //'\n' to add new line


    if (q.pathname.includes('documentation')) {
      filePath = (__dirname + '/documentation.html'); //__dirname environment variable tells absolute path of the directory containing the currently executing file.
    } else {
      filePath = 'index.html'; // if user makes request to URL that does not exist on the server, return to index
    }

    fs.readFile(filePath, (err,data) => {
      if (err) {
        throw err;
      }
      // tells server to add a header to the response, along with HTTP code 200 for "OK" in 1st argument, 2nd argument is an object containing the response headers
      // end the reponse and sends back the message Hello Node
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data);
      response.end();
    })
}).listen(8080); //the server object listens on port 8080
console.log('My first Node test server is running on Port 8080.');
