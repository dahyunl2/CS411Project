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

app.get('/api/User', function(req, res) {
    var userID = req.query.userID; 
    console.log("userIDinfo:",userID);
    var sql;
    if (userID) {
        sql = `SELECT UserID, UserName, Password FROM User WHERE UserID = ?`;
    } else {
        console.error('Please enter your UserID');
    }
    
    connection.query(sql,[userID],function(err, results) {
        if (err) {
            console.error('Error fetching user data:', err);
            res.status(500).send({ message: 'Error fetching user data', error: err });
            return;
        }
        res.json(results);
    });
});


app.post('/api/User/passwordChange/:userID', function(req, res) {
    var userID = req.params.userID;
    var newPassword=req.body.newPassword;
   
    
    console.log('userIDInsert:',userID);
    console.log('newPassword:',newPassword);
   
    if (!userID) {
        res.status(400).send({ message: 'User ID is required to modify the password' });
        return;
    }

    var sql = `UPDATE User SET Password = ? WHERE UserID = ?`;
    var sql_trigger =
    `CREATE TRIGGER UserName
    BEFORE INSER ON User
    FOR EACH ROW
    BEGIN
        IF NEW.Password IS NULL THEN
            SET NEW.Password = old.Password;
        END IF;
    END;`

    connection.execute(sql_trigger, function(err) {
            if (err) {
                console.error('Error creating trigger:', err);
                return;
            }
            console.log('Trigger created successfully');
        });
    
    connection.query(sql, [newPassword, userID], function(err, result) {
        if (err) {
          console.error('Error changing password:', err);
          res.status(500).send({ message: 'Error changing password:', error: err });
          return;
        }
        if(result.affectedRows === 0) {
          // No rows were affected, meaning no record was found with that ID
          res.status(404).send({ message: 'Record not found' });
        } else {
          res.send({ message: 'Password changed successfully' });
        }
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
    var newRecipeTitle=req.body.newRecipeTitle;
    var newIngredients=req.body.newIngredients;
    var newDirections=req.body.newDirections;
    
    console.log('userIDInsert:',userID);
    console.log('newRecipeTitle:',newRecipeTitle);
    console.log('newIngredients:',newIngredients);
    console.log('newDirections:',newDirections);
    
    if (!userID) {
        res.status(400).send({ message: 'User ID is required to insert a new recipe' });
        return;
    }

    var sql = `INSERT INTO MyRecipes (UserID, RecipeTitle, Ingredients, Directions)
    VALUES (?, ?, ?, ?);`;
    
    connection.query(sql, [userID, newRecipeTitle, newIngredients, newDirections], function(err, result) {
        if (err) {
          console.error('Error inserting recipe record:', err);
          res.status(500).send({ message: 'Error inserting recipe record', error: err });
          return;
        }
        if(result.affectedRows === 0) {
          // No rows were affected, meaning no record was found with that ID
          res.status(404).send({ message: 'Record not found' });
        } else {
          res.send({ message: 'Recipe inserted successfully' });
        }
      });
});

app.delete('/api/MyRecipes/delete/:userID', function(req, res) {
    var userID = req.params.userID;
    var recipeTitleDelete = req.query.recipeTitleDelete;
    console.log('userIDdelete:',userID);
    console.log('recipeTitleDelete:',recipeTitleDelete);
    
    var sql = 'DELETE FROM MyRecipes WHERE UserID = ? and RecipeTitle = ?';
    
    connection.query(sql, [userID, recipeTitleDelete], function(err, result) {
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

// app.get('/api/GetNumRecipes', function(req, res) {
//     var ingredient = req.query.ingredient;
//     var category = req.query.category;
//     var nutrition = req.query.nutrition;
//     var greaterThan = req.query.greaterThan;
//     var lessThan = req.query.lessThan;

//     var sql = 'CALL GetNumRecipes(?, ?, ?, ?, ?)';

//     getNumRecipes(ingredient, category, nutrition, greaterThan, lessThan, function(err, numRecipes) {
//         if (err) {
//             res.status(500).send({ message: 'Error fetching number of recipes', error: err });
//             return;
//         }
//         res.json({ numRecipes: numRecipes });
//     });
// });


// function getNumRecipes(ingredient, category, nutritionGreaterThan, nutritionLessThan, callback) {
//     var sql = 'CALL GetNumRecipes(?, ?, ?, ?, ?)';
    
//     connection.query(sql, [ingredient, category, nutritionGreaterThan, nutritionLessThan], function(err, results) {
//         if (err) {
//             console.error('Error calling stored procedure:', err);
//             callback(err, null);
//             return;
//         }
//         callback(null, results[0][0].numRecipes);
//     });
// }


app.get('', function(req, res) {
    res.render('index', { title: 'CS411 Project' });
});

app.listen(80, function () {
    console.log('Node app is running on port 80');
});
module.exports = app;