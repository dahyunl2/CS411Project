var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');

var app = express();

// set up ejs view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var connection = mysql.createConnection({
    host: '34.71.39.78',
    user: 'root',
    password: 'team035!',
    database: 'recipe'
});

connection.connect(function(err) {
    if (err) {
        console.log(err);
    }
    console.log("connected");
});
app.get('/api/Recipe', function(req, res) {
    var sql = 'SELECT * FROM Recipe';
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

app.get('/api/Food', function(req, res) {
    var sql = 'SELECT * FROM Food';
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

app.get('/api/User', function(req, res) {
    var sql = 'SELECT * FROM User';
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

app.get('/api/Favorites', function(req, res) {
    var sql = 'SELECT * FROM Favorites';
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

app.get('/api/MyRecipes', function(req, res) {
    var sql = 'SELECT * FROM MyRecipes';
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

app.get('', function(req, res) {
    res.render('index', { title: 'CS411 Project' });
});

app.listen(80, function () {
    console.log('Node app is running on port 80');
});
module.exports = app;