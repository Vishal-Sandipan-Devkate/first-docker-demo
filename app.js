const http = require("http");
const server = http.createServer((req, res) => {
	res.end("Hello Vishal from Docker server");
});
server.listen(3000);


