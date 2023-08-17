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
var app = express();
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
// Function to update the matrix after a word is formed
function restartMatrix(matrix) {
    // Reset the matrix to its original state
    for (var row = 0; row < matrix.length; row++) {
        for (var col = 0; col < matrix[row].length; col++) {
            matrix[row][col] = initialMatrix[row][col];
        }
    }
}
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use("/css", express.static("./node_modules/bootstrap/dist/css"));
app.use("/js", express.static("./node_modules/bootstrap/dist/js"));
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
    app.get('/restart-game', function (req, res) {
        restartMatrix(matrix);
        score = 0;
        // Send both matrix and score in a single response
        res.json({ matrix: matrix, score: score });
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
        var lastRowLetters = matrix[matrix.length - 1];
        // Create a copy of lastRowLetters to track available letters
        var availableLetters = lastRowLetters.slice();
        // Check if each letter in the submitted word can be formed using the letters of the last row
        var isValidWord = sanitizedWord.split('').every(function (letter) {
            var index = availableLetters.indexOf(letter);
            if (index !== -1) {
                availableLetters.splice(index, 1); // Remove the letter from available letters
                return true;
            }
            return false;
        });
        // Check if the submitted word can be formed using the letters of the last row
        if (isValidWord) {
            // Valid word: Update matrix, calculate score, etc.
            updateMatrix(matrix, sanitizedWord); // Implement the updateMatrix function
            score += sanitizedWord.length * 4; // update score
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
    });
}
// Start the game
playGame();
