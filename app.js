var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mqttHandler = require('./mqtt_handler');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

var mqttClient = new mqttHandler();
mqttClient.connect();

// Routes
app.post("/send-mqtt", multipartMiddleware, function(req, res) {
  console.log('Processing request')
  var data = JSON.parse(req.body.json).data;
  var results = data.results;
  var topic = 'plate-recognizer/detection'
  if (!!results?.length) {
    var plate = results[0].plate?.toUpperCase()
    mqttClient.sendMessage(`${topic}/detail`, results[0]);
    mqttClient.sendMessage(`${topic}/plate`, plate);
    console.log(data.timestamp_local)
    console.log(`Recognized plate: ${plate}`)
  };
  console.log('Request finished')
  console.log('----------------')
  res.status(200).send('OK');
});

var server = app.listen(6000, function () {
    console.log("app running on port.", server.address().port);
});
