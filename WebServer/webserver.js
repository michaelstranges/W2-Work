const http = require("http");

//request handler
//const server = http.createServer((request, response) => {
//server object is an EventEmitters

const server = http.createServer();
server.on("request", (request, response) => { //listen
//other option..."response"

const {method, url} = request;
//request is instance of IncomingMessage

//also found in request --- headers!
const { headers } = request;
const userAgent = headers["user-agent"];



});
