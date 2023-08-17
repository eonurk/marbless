import { Application } from 'express';
import express = require('express');
import * as path from 'path';

const app: Application = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use("/css",express.static("./node_modules/bootstrap/dist/css"));
app.use("/js",express.static("./node_modules/bootstrap/dist/js"));
// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Initialize the matrix
const initialMatrix: string[][] = [
    ['A', 'B', 'G', 'C', 'F'],
    ['D', 'A', 'M', 'N', 'M'],
    ['B', 'D', 'E', 'F', 'O'],
    ['F', 'M', 'C', 'C', 'C'],
    ['K', 'L', 'M', 'M', 'M']
];

// Function to update the matrix after a word is formed
function updateMatrix(matrix: string[][], word: string): void {
    for (const letter of word) {
        const colIndex = matrix[matrix.length - 1].indexOf(letter);
        for (let row = matrix.length - 2; row >= 0; row--) {
            matrix[row + 1][colIndex] = matrix[row][colIndex];
        }
        matrix[0][colIndex] = ' ';
    }
}

// Function to update the matrix after a word is formed
function restartMatrix(matrix: string[][]): void {
    // Reset the matrix to its original state
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            matrix[row][col] = initialMatrix[row][col];
        }
    }
}

// Main game loop
function playGame() {
    const matrix: string[][] = initialMatrix.map(row => [...row]); // Create a copy of the initial matrix
    let score = 0;

    app.get('/', (req, res) => {
        const sanitizedMatrix = matrix.map(row => row.join(' ')).join('\n');
        res.render('index', { matrix: sanitizedMatrix });
    });
    
    // Add a new endpoint to send the updated matrix as JSON
    app.get('/restart-game', (req, res) => {
        
        restartMatrix(matrix);
        score = 0

        // Send both matrix and score in a single response
        res.json({ matrix: matrix, score: score });
    });

    // Add a new endpoint to send the updated matrix as JSON
    app.get('/updated-matrix', (req, res) => {
        const sanitizedMatrix = matrix.map(row => row.join(' '));
        res.json(sanitizedMatrix);
    });

    // Add a new endpoint to send the updated matrix as JSON
    app.get('/updated-score', (req, res) => {
        res.json(score);
    });

    // Endpoint to handle user-submitted word and update the matrix
    app.get('/submit-word', (req, res) => {
        const userWord = req.query.word as string; // Extract the submitted word
        const sanitizedWord = userWord.trim().toUpperCase();

        const lastRowLetters = matrix[matrix.length - 1];
        // Create a copy of lastRowLetters to track available letters
        const availableLetters = lastRowLetters.slice();
        
        // Check if each letter in the submitted word can be formed using the letters of the last row
        const isValidWord = sanitizedWord.split('').every(letter => {
            const index = availableLetters.indexOf(letter);
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
        } else {
            // Invalid word: Send an error response back to the client
            res.status(400).send('Invalid word');
        }
    });

    const port = process.env.PORT || 8888;
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}

// Start the game
playGame();
