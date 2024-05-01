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

// app.get('/api/MyRecipes', function(req, res) {
//     var sql = 'SELECT * FROM MyRecipes';
    
//     connection.query(sql, function(err, results) {
//         if (err) {
//             console.error('Error fetching attendance data:', err);
//             res.status(500).send({ message: 'Error fetching attendance data', error: err });
//             return;
//         }
//         res.json(results);
//     });
// });

// app.get('/api/Filtered', function(req, res) {
//     var sql = `
//         (
//         SELECT r.RecipeTitle, r.Ingredients, r.Directions
//         FROM Recipe r
//         JOIN Food f ON r.Ingredients LIKE CONCAT('%', f.FoodName, '%') 
//         WHERE f.Category = 'Dairy products'
//         )
//         INTERSECT
//         (
//         SELECT r.RecipeTitle, r.Ingredients, r.Directions
//         FROM Recipe r
//         JOIN Food f ON r.Ingredients LIKE CONCAT('%', f.FoodName, '%') 
//         WHERE f.Category LIKE '%Seafood'
//         ) LIMIT 15;        
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

app.get('/api/Filtered', function(req, res) {
    // Parameters passed from the client
    var ingredient = req.query.ingredient;
    var category = req.query.category;
    var nutrition = req.query.nutrition;
    var greaterThan = req.query.greaterThan;
    var lessThan = req.query.lessThan;
   
    // Start SQL query construction
    var sql = 'SELECT DISTINCT Recipe.RecipeTitle, Recipe.Ingredients, Recipe.Directions FROM Recipe ';
    sql += 'JOIN Food ON Recipe.Ingredients LIKE CONCAT("%", Food.FoodName, "%") '; // added

    var conditions = [];

    console.log("Ingredient:", ingredient);
    console.log("Category:", category);
    
    if (ingredient) {
        conditions.push(`Recipe.Ingredients LIKE '%${ingredient}%'`);
    }
    if (category) {
        // sql += 'JOIN Food ON Recipe.Ingredients LIKE CONCAT("%", Food.FoodName, "%") '; // edited
        conditions.push(`Food.Category = '${category}'`);
    }
    if (nutrition && (greaterThan || lessThan)) {
        // sql += 'JOIN Food ON Recipe.RecipeID = Food.RecipeID '; // edited
        if (greaterThan) {
            conditions.push(`Food.${nutrition} > ${greaterThan}`);
        }
        if (lessThan) {
            conditions.push(`Food.${nutrition} < ${lessThan}`);
        }
    }


    // if (ingredient) {
    //     conditions.push(`Recipe.Ingredients LIKE ?`);
    // }
    // if (category) {
    //     sql += 'JOIN Food ON Recipe.Ingredients LIKE CONCAT("%", Food.FoodName, "%") ';
    //     conditions.push(`Food.Category = ?`);
    // }
    // if (nutrition && (greaterThan || lessThan)) {
    //     sql += 'JOIN Nutrition ON Recipe.RecipeID = Nutrition.RecipeID ';
    //     if (greaterThan) {
    //         conditions.push(`Nutrition.? > ?`);
    //     }
    //     if (lessThan) {
    //         conditions.push(`Nutrition.? < ?`);
    //     }
    // }
    
    // If there are any conditions, append them to the query
    if (conditions.length) {
        sql += 'WHERE ' + conditions.join(' AND ');
    }

    connection.query(sql, [ ingredient, category, nutrition, greaterThan, lessThan ], function(err, results) {
        if (err) {
            console.error('Error fetching filtered data:', err);
            res.status(500).send({ message: 'Error fetching filtered data', error: err });
            return;
        }
        res.json(results);
    });

    // Execute the query -- ORIGINAL
    // connection.query(sql, function(err, results) {
    //     if (err) {
    //         console.error('Error fetching filtered data:', err);
    //         res.status(500).send({ message: 'Error fetching filtered data', error: err });
    //         return;
    //     }
    //     res.json(results);
    // });
});

app.get('/api/MyRecipes', function(req, res) {
    // var userID = req.params.userID;
    var userID = req.query.userID; // Changed from req.params to req.query.
    console.log("userID:",userID);
    var sql;
    if (userID) {
        sql = `SELECT RecipeTitle, Ingredients, Directions FROM MyRecipes WHERE UserID = ?`;
    } else {
        sql = `SELECT RecipeTitle, Ingredients, Directions FROM MyRecipes`;
    }
    
    connection.query(sql,[userID],function(err, results) {
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

app.get('/api/Users_Ranking', function(req, res) {
    var sql = `
    SELECT 
        User.UserName,
        COUNT(MyRecipes.RecipeTitle) AS RecipesUploaded
    FROM 
        User
    RIGHT JOIN
        MyRecipes ON User.UserID = MyRecipes.UserID
    GROUP BY 
        MyRecipes.UserID
    ORDER BY 
        RecipesUploaded DESC;
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

app.post('/api/MyRecipes/insert/:userID', function(req, res) {
    var userID = req.params.userID;
    var newRecipeTitle=req.params.newRecipeTitle;
    var newIngredients=req.params.newIngredients;
    var newDirections=req.params.newDirections;

    if (!userID) {
        res.status(400).send({ message: 'User ID is required to insert a new recipe' });
        return;
    }

    var sql = `INSERT INTO MyRecipes (UserID, RecipeTitle, Ingredients, Directions)
    VALUES (?, ?, ?, ?);`;
    
    connection.query(sql, [UserID, RecipeTitle, Ingredients, Directions],function(err, result) {
        if (err) {
            res.send(err)
            return;
        }
        res.redirect('/success');
    });
});

// app.delete('/api/MyRecipes/delete/:userID', function(req, res) {
//     var userID = req.params.userID;
//     var recipeTitleDelete=req.params.recipeTitleDelete;
//     var sql = 'DELETE FROM MyRecipes WHERE UserID = ? and RecipeTitle = ?';

//     connection.query(sql, [userID, recipeTitleDelete], function(err, result) {
//         if (err) {
//         console.error('Error deleting recipe record:', err);
//         res.status(500).send({ message: 'Error deleting recipe record', error: err });
//         return;
//         }
//         if (result.affectedRows === 0) {
//         // No rows were affected, meaning no record was found with that ID
//         res.status(404).send({ message: 'Record not found' });
//         } else {
//         res.send({ message: 'Recipe record deleted successfully' });
//         }
//     });
// });

app.delete('/api/MyRecipes/delete/:userID/:recipeTitleChosen', function(req, res) {
    var userID = req.params.userID;
    var recipeTitleChosen = req.params.recipeTitleChosen;
    var sql = 'DELETE FROM MyRecipes WHERE UserID = ? and RecipeTitle = ?';

    connection.query(sql, [userID, recipeTitleChosen], function(err, result) {
        if (err) {
            console.error('Error deleting recipe record:', err);
            res.status(500).send({ message: 'Error deleting recipe record', error: err });
            return;
        }
        if (result.affectedRows === 0) {
            // No rows were affected, meaning no record was found with that ID
            res.status(404).send({ message: 'Record not found' });
        } else {
            res.send({ message: 'Recipe record deleted successfully' });
        }
    });
});


app.get('', function(req, res) {
    res.render('index', { title: 'CS411 Project' });
});

app.listen(80, function () {
    console.log('Node app is running on port 80');
});
module.exports = app;