const http = require('http');
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.end('Hello World');
});
server.listen(4001, () => {
    console.log('Test Server running on 4001');
});
