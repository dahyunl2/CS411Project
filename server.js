
var request = require('request');
var axios = require('axios');
var csv = require('csv-parser');
var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
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


var app = express();

// set up ejs view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));

/* GET home page, respond by rendering index.ejs */
// app.get('/', function(req, res) {
// res.render('index', { title: 'CS411 Project' });
// });
app.get('/', function(req, res) {
  // Read data from multiple CSV files and aggregate it
  var allData = [];

  function fetchDataFromCSV(csvFileUrl) {
    return new Promise((resolve, reject) => {
        axios.get(csvFileUrl)
            .then(response => {
                const data = [];
                csv()
                    .on('data', (row) => {
                        data.push(row);
                        if (data.length >= 10) {
                            resolve(data);
                        }
                    })
                    .on('end', () => {
                        resolve(data);
                    })
                    .on('error', (error) => {
                        reject(error);
                    })
                    .write(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
  }

  // Array of CSV file URLs
  var csvFileUrls = [
    // 'gs://sp24-cs411-team035/Recipe.csv',
    // 'gs://sp24-cs411-team035/Food.csv',
    // 'gs://sp24-cs411-team035/User.csv',
    // 'gs://sp24-cs411-team035/Favorites.csv',
    // 'gs://sp24-cs411-team035/MyRecipe.csv'
      'https://storage.cloud.google.com/sp24-cs411-team035/Recipe.csv',
      'https://storage.cloud.google.com/sp24-cs411-team035/Food.csv',
      'https://storage.cloud.google.com/sp24-cs411-team035/User.csv',
      'https://storage.cloud.google.com/sp24-cs411-team035/Favorites.csv',
      'https://storage.cloud.google.com/sp24-cs411-team035/MyRecipe.csv'
  ];

  // Fetch data from each CSV file URL and extract the first 10 rows
  Promise.all(csvFileUrls.map(csvFileUrl => fetchDataFromCSV(csvFileUrl)))
      .then(results => {
          res.render('index', {
              title: 'CS411 Project',
              data1: results[0],
              data2: results[1],
              data3: results[2],
              data4: results[3],
              data5: results[4]
          });
      })
      .catch(error => {
          console.error('Error fetching CSV data:', error);
          res.status(500).send({ error: 'Error fetching CSV data', error: error });
      });
});


// app.get('/success', function(req, res) {
//     res.send({'message': 'Attendance marked successfully!'});
// });

// // this code is executed when a user clicks the form submit button
app.post('/api/MyRecipe/insert/', function(req, res) {
    var userID = req.params.userID;
    var newRecipeTitle=req.params.newRecipeTitle;
    var newIngredients=req.params.newIngredients;
    var newDirections=req.params.newDirections;

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

// app.get('/api/attendance', function(req, res) {
// var sql = 'SELECT * FROM attendance';

// connection.query(sql, function(err, results) {
// if (err) {
//     console.error('Error fetching attendance data:', err);
//     res.status(500).send({ message: 'Error fetching attendance data', error: err });
//     return;
// }
// res.json(results);
// });
// });

// app.post('/api/attendance/modify/:id', function(req, res) {
// var id = req.params.id;
// var present = req.body.present; // Assuming 'present' is sent in the request body

// var sql = 'UPDATE attendance SET present = ? WHERE netid = ?';

// connection.query(sql, [present, id], function(err, result) {
// if (err) {
//     console.error('Error modifying attendance record:', err);
//     res.status(500).send({ message: 'Error modifying attendance record', error: err });
//     return;
// }
// if(result.affectedRows === 0) {
//     // No rows were affected, meaning no record was found with that ID
//     res.status(404).send({ message: 'Record not found' });
// } else {
//     res.send({ message: 'Attendance record modified successfully' });
// }
// });
// });


// app.delete('/api/attendance/delete/:id', function(req, res) {
// var id = req.params.id;

// var sql = 'DELETE FROM attendance WHERE netid = ?';

// connection.query(sql, [id], function(err, result) {
//     if (err) {
//     console.error('Error deleting attendance record:', err);
//     res.status(500).send({ message: 'Error deleting attendance record', error: err });
//     return;
//     }
//     if(result.affectedRows === 0) {
//     // No rows were affected, meaning no record was found with that ID
//     res.status(404).send({ message: 'Record not found' });
//     } else {
//     res.send({ message: 'Attendance record deleted successfully' });
//     }
// });
// });


app.listen(80, function () {
    console.log('Node app is running on port 80');
});