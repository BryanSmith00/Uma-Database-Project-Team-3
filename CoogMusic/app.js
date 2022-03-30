const express = require('express');
const app = express();
const port = 3000;


app.get('/', function(request, response) {
    app.use(express.static(__dirname));
    response.statusCode = 200;
    response.sendFile(__dirname + "/index.html");
});

app.post("/", (request, response) => {
    res.send("Thank you for subscribing");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(__dirname);
    console.log(__dirname + '\\styles');
});
