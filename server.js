var qiniu = require('qiniu');
var express = require('express');
var config = require('./config/config.js');
var app = express();

app.configure(function() {
    app.use(express.static(__dirname + '/static'));
});

/**
 * 视图目录和静态文件要分开， 否者会导致index.html的ejs语法不生效， 不知道是不是bug;
 * */
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(express.urlencoded());

app.get('/uptoken', function(req, res, next) {
    var token = uptoken.token();
    res.header("Cache-Control", "max-age=0, private, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    if (token) {
        res.json({
            uptoken: token
        });
    }
});

app.get('/', function(req, res) {
    res.render('index.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url
    });
});

qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;

var uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);


app.listen(config.Port, function() {
    console.log('Listening on port %d', config.Port);
});
