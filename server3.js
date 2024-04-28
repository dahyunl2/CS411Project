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

app.get('/api/Filtered', function(req, res) {
    var sql = `
        (
        SELECT r.RecipeTitle, r.Ingredients, r.Directions
        FROM Recipe r
        JOIN Food f ON r.Ingredients LIKE CONCAT('%', f.FoodName, '%') 
        WHERE f.Category = 'Dairy products'
        )
        INTERSECT
        (
        SELECT r.RecipeTitle, r.Ingredients, r.Directions
        FROM Recipe r
        JOIN Food f ON r.Ingredients LIKE CONCAT('%', f.FoodName, '%') 
        WHERE f.Category LIKE '%Seafood'
        ) LIMIT 15;        
    `;
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

app.get('/api/MyRecipe', function(req, res) {
    var sql = `
        SELECT r.RecipeTitle, r.Ingredients, r.Directions
        FROM MyRecipe r
        WHERE r.UserID = 'a00001'    
    `;
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

// Query for loading the recipes by favorite ranking

app.get('/api/Fav_Ranking', function(req, res) {
    var sql = `
        SELECT 
            c.RecipeTitle, 
            COUNT(c.FavoriteID) AS FavoriteCount
        FROM 
            Contains c
        JOIN 
            Favorites f ON c.FavoriteID = f.FavoriteID
        GROUP BY 
            c.RecipeTitle
        ORDER BY 
            FavoriteCount DESC
        LIMIT 15;
       
    `;
    
    connection.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

// // Query for loading users by number of recipes favorites

// app.get('/api/Users_Ranking', function(req, res) {
//     var sql = `
//     SELECT 
//         User.UserName,
//         COUNT(MyRecipes.RecipeTitle) AS RecipesUploaded
//     FROM 
//         User
//     RIGHT JOIN
//         MyRecipes ON User.UserID = MyRecipes.UserID
//     GROUP BY 
//         MyRecipes.UserID
//     ORDER BY 
//         RecipesUploaded DESC;
//     `;
    
//     connection.query(sql, function(err, results) {
//         if (err) {
//             console.error('Error fetching attendance data:', err);
//             res.status(500).send({ message: 'Error fetching attendance data', error: err });
//             return;
//         }
//         res.json(results);
//     });
// });

app.get('', function(req, res) {
    res.render('index', { title: 'CS411 Project' });
});

app.listen(80, function () {
    console.log('Node app is running on port 80');
});
module.exports = app;