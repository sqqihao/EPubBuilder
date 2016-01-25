var express = require('express');
var config = require('./config/config.js');
var app = express();

app.configure(function() {
    app.use(express.static(__dirname + '/src'));
});

/**
 * 视图目录和静态文件要分开， 否者会导致index.html的ejs语法不生效， 不知道是不是bug;
 * */
app.set('views', __dirname + '/src');
app.engine('html', require('ejs').renderFile);

app.use(express.urlencoded());

app.get('/', function(req, res) {
    res.render('index.html');
});


app.listen(config.Port, function() {
    console.log('Listening on port %d', config.Port);
});
