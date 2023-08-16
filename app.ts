import { Application } from 'express';
import * as express from 'express';
import * as path from 'path';
import * as readline from 'readline';


const app: Application = express();

// Function to display the matrix
function displayMatrix(matrix: string[][]): void {
    for (const row of matrix) {
        console.log(row.join(' '));
    }
    console.log();
}


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

// Create a readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Main game loop
function playGame() {
    const matrix: string[][] = initialMatrix.map(row => [...row]); // Create a copy of the initial matrix
    let score = 0;

    app.get('/', (req, res) => {
        const sanitizedMatrix = matrix.map(row => row.join(' ')).join('\n');
        res.render('index', { matrix: sanitizedMatrix });
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

            score += sanitizedWord.length;

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
        askForWord();
    });

    function askForWord() {
        displayMatrix(matrix);
        rl.question("Enter a word using the last row's letters: ", (word) => {
            const sanitizedWord = word.trim().toUpperCase();

            if (!sanitizedWord.match(/^[A-Z]+$/)) {
                console.log("Invalid input. Enter a valid word.");
                askForWord();
                return;
            }

            if (sanitizedWord.split('').every(letter => matrix[matrix.length - 1].includes(letter))) {
                score += sanitizedWord.length;
                updateMatrix(matrix, sanitizedWord);
            } else {
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
