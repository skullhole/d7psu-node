var express = require('express')
    , app = express()
    , bodyParser = require('body-parser');

// Default ENV.
if (typeof process.env.NODE_ENV === 'undefined') {
    process.env.NODE_ENV = 'default';
}

// Root directory.
global.__base = __dirname;

// Configs.
var config = require('config');
console.log(config);

// Port
app.set('port', process.env.PORT || 3000);

// JSON.
app.set('json spaces', config.has('json.spaces') ? config.get('json.spaces') : 2);

// Body Parser.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Public files.
app.use('/public', express.static(__dirname + '/files/public'));
app.use('/theme', express.static(__dirname + '/files/theme'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/views', express.static(__dirname + '/views', {
    index: false,
    extensions: ['css', 'js']
}));

// Global Functions.
global.utility = require('./lib/utility');

// Controllers.
app.use('/', require('./controllers'));

// Not found.
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Init.
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});