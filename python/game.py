import random

# Initialize the matrix
initial_matrix = [
    ['A', 'B', 'G', 'C', 'F'],
    ['D', 'A', 'M', 'N', 'M'],
    ['B', 'D', 'E', 'F', 'O'],
    ['F', 'M', 'C', 'C', 'C'],
    ['K', 'L', 'M', 'M', 'M']
]

# Function to display the matrix
def display_matrix(matrix):
    for row in matrix:
        print(' '.join(row))
    print()

# Function to update the matrix after a word is formed
def update_matrix(matrix, word):
    for letter in word:

        print(letter)
        col_index = matrix[-1].index(letter)
        for row in range(len(matrix) - 2, -1, -1):
            matrix[row + 1][col_index] = matrix[row][col_index]
        matrix[0][col_index] = ' '


# Main game loop
def play_game():
    matrix = [row[:] for row in initial_matrix]  # Create a copy of the initial matrix
    score = 0

    while True:
        display_matrix(matrix)
        word = input("Enter a word using the last row's letters: ").strip().upper()

        if not word.isalpha():
            print("Invalid input. Enter a valid word.")
            continue

        if all(letter in matrix[-1] for letter in word):
            score += len(word)
            update_matrix(matrix, word)
        else:
            print("Invalid word. Use only letters from the last row.")

        # Check if the game should end (e.g., after a certain number of turns)
        # You can add your own end game condition here

# Start the game
if __name__ == "__main__":
    play_game()