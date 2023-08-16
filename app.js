"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var readline = require("readline");
var app = express();
// Function to display the matrix
function displayMatrix(matrix) {
    for (var _i = 0, matrix_1 = matrix; _i < matrix_1.length; _i++) {
        var row = matrix_1[_i];
        console.log(row.join(' '));
    }
    console.log();
}
// Initialize the matrix
var initialMatrix = [
    ['A', 'B', 'G', 'C', 'F'],
    ['D', 'A', 'M', 'N', 'M'],
    ['B', 'D', 'E', 'F', 'O'],
    ['F', 'M', 'C', 'C', 'C'],
    ['K', 'L', 'M', 'M', 'M']
];
// Function to update the matrix after a word is formed
function updateMatrix(matrix, word) {
    for (var _i = 0, word_1 = word; _i < word_1.length; _i++) {
        var letter = word_1[_i];
        var colIndex = matrix[matrix.length - 1].indexOf(letter);
        for (var row = matrix.length - 2; row >= 0; row--) {
            matrix[row + 1][colIndex] = matrix[row][colIndex];
        }
        matrix[0][colIndex] = ' ';
    }
}
// Create a readline interface for user input
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
// Set up EJS as the view engine
app.set('view engine', 'ejs');
// Main game loop
function playGame() {
    var matrix = initialMatrix.map(function (row) { return __spreadArray([], row, true); }); // Create a copy of the initial matrix
    var score = 0;
    app.get('/', function (req, res) {
        var sanitizedMatrix = matrix.map(function (row) { return row.join(' '); }).join('\n');
        res.render('index', { matrix: sanitizedMatrix });
    });
    // Add a new endpoint to send the updated matrix as JSON
    app.get('/updated-matrix', function (req, res) {
        var sanitizedMatrix = matrix.map(function (row) { return row.join(' '); });
        res.json(sanitizedMatrix);
    });
    // Add a new endpoint to send the updated matrix as JSON
    app.get('/updated-score', function (req, res) {
        res.json(score);
    });
    // Endpoint to handle user-submitted word and update the matrix
    app.get('/submit-word', function (req, res) {
        var userWord = req.query.word; // Extract the submitted word
        var sanitizedWord = userWord.trim().toUpperCase();
        // Check if the submitted word can be formed using the letters of the last row
        if (sanitizedWord.split('').every(function (letter) { return matrix[matrix.length - 1].includes(letter); })) {
            // Valid word: Update matrix, calculate score, etc.
            updateMatrix(matrix, sanitizedWord); // Implement the updateMatrix function
            score += sanitizedWord.length;
            // Send a success response back to the client
            res.sendStatus(200);
        }
        else {
            // Invalid word: Send an error response back to the client
            res.status(400).send('Invalid word');
        }
    });
    var port = process.env.PORT || 8888;
    app.listen(port, function () {
        console.log("Server is listening on port ".concat(port));
        askForWord();
    });
    function askForWord() {
        displayMatrix(matrix);
        rl.question("Enter a word using the last row's letters: ", function (word) {
            var sanitizedWord = word.trim().toUpperCase();
            if (!sanitizedWord.match(/^[A-Z]+$/)) {
                console.log("Invalid input. Enter a valid word.");
                askForWord();
                return;
            }
            if (sanitizedWord.split('').every(function (letter) { return matrix[matrix.length - 1].includes(letter); })) {
                score += sanitizedWord.length;
                updateMatrix(matrix, sanitizedWord);
            }
            else {
                console.log("Invalid word. Use only letters from the last row.");
            }
            // Continue playing or end the game based on your own conditions
            askForWord();
        });
    }
    askForWord();
}
// Start the game
playGame();
