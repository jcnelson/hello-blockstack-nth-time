const express = require('express')
const app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Content-Length");
  next();
});

app.get('/login', function(req, res) {
   var authresp = req.query.authResponse;
   res.redirect(`/?authResponse=${authresp}`);
});

app.use('/', express.static(__dirname + '/public'))
app.listen(5000, (err) => {
  console.log('server is listening on port 5000')
})
