// Wordle in JavaScript in 20 minutes https://youtu.be/oKM2nQdQkIU

// Setup service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
        reg.onupdatefound = () => {
            const newWorker = reg.installing;
            newWorker.onstatechange = () => {
                if (newWorker.state === 'activated') {
                    window.location.reload();
                }
            };
        };
    });
}
// Create a "Clear Cache" or "Check for Update" button for manual control

// const dict = ['earth','plane','crane','audio','house'];
import { words, all_words } from './wordle_words.js';

const keyboardKeys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'del']
];

// let pos = 1;
let pos = Number(localStorage.getItem('pos')) || 1;

const state = {
    // secret: words[Math.floor(Math.random() * words.length)], // choose random word from list of words
    // secret: shuffleArray(words)[0], // shuffle list of words and get first
    secret: words[0],
    grid: array5x6(),
    currentRow: 0,
    currentCol: 0,
};

/* function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
    return arr;
}*/

function updateGrid() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            box.textContent = state.grid[i][j];
        }
    }
}

function drawBox(container, row, col, letter='') {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    box.textContent = letter;

    container.appendChild(box);
    return box;
}

function drawGrid(container) {
    const grid = document.createElement('div');
    grid.className = 'grid';

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            drawBox(grid, i, j);
        }
    }

    container.appendChild(grid);
}

function addLetter(letter) {
    if (state.currentRow === 6 || state.currentCol >= 5) return;

    state.grid[state.currentRow][state.currentCol] = letter;
    state.currentCol++;
}

function getCurrentWord() {
    return state.grid[state.currentRow].reduce((prev,curr) => prev + curr);
}

function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}

function isWordValid(all_words, word) {
    return all_words.includes(word);
}

function removeLetter() {
    if (state.currentCol === 0) return;
    state.grid[state.currentRow][state.currentCol -1] = '';
    state.currentCol--;
}

function revealWord(guess) {
    const row = state.currentRow;
    const animation_duration = 500;

    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`box${row}${i}`);
        const letter = box.textContent;

        setTimeout(() => {
            let boxClass = '';
            
            if (letter === state.secret[i]) {
                boxClass = 'right';
            }
            else if (state.secret.includes(letter)) {
                boxClass = 'wrong';
            }
            else {
                boxClass = 'empty';
            }

            box.classList.add(boxClass);

            // Update keyboard key color
            const keyButton = document.querySelector(`button[data-key="${letter.toLowerCase()}"]`);
            if (keyButton) updateKeyColor(keyButton, boxClass);
        }, ((i+1) * animation_duration) / 2);

        box.classList.add('animated');
        box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
    }

    const isWinner = state.secret === guess;
    const isGameOver = state.currentRow === 5;

    setTimeout(() => {
        if (isWinner) {
            console.log('Well Done!');
        }
        else if (isGameOver) {
            console.log(`Better luck next time! The word was ${state.secret}.`);
        }
    }, 3 * animation_duration);

    if (isWinner || isGameOver) {
        setTimeout(() => {
            state.secret = words[pos++];
            localStorage.setItem('pos', pos);
            state.currentRow = 0;
            state.currentCol = 0;
            state.grid = array5x6();
            startup();
        }, 3000);
    }
}

function array5x6() {
    return Array(6)
        .fill()
        .map(() => Array(5).fill(''));
}

function updateKeyColor(button, newClass) {
    const priority = { right: 3, wrong: 2, empty: 1 };
    const existingClass = ['right', 'wrong', 'empty'].find(cls => button.classList.contains(cls));

    // console.log(existingClass); // undefined

    // Only update if new class has higher priority
    if (!existingClass || priority[newClass] > priority[existingClass]) {
        button.classList.remove('right', 'wrong', 'empty');
        button.classList.add(newClass);
    }
}

function handleKeyInput(key) {
    if (key === 'enter') {
        if (state.currentCol === 5) {
            const word = getCurrentWord();
            
            if (isWordValid(all_words, word)) {
                revealWord(word);
                state.currentRow++;
                state.currentCol = 0;
            }
            else {
                // invalid word
                console.log('Invalid: ', word);
            }
        }
    }
    else if (key === 'del') {
        removeLetter();
    }
    else if (isLetter(key)) {
        addLetter(key);
    }

    if (state.currentCol < 6) {
        updateGrid();
    }
}

function registerKeyboardEvents() {
    document.body.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
        
        const key = e.key.toLowerCase();

        // Normalize special keys
        if (key === 'backspace' || key === 'del') {
            handleKeyInput('del');
        }
        else if (key === 'enter') {
            handleKeyInput('enter');
        }
        else if (isLetter(key)) {
            handleKeyInput(key);
        }
    };
}

const specialKeys = {
    enter: { label: 'Enter', class: 'wide-button' },
    del: { label: 'Del', class: 'wide-button' }
};

const keyboardDiv = document.getElementById('keyboard');

// drawKeyboard(keyboardKeys);

function drawKeyboard(keyboardKeys) {
    keyboardDiv.innerHTML = '';
    
    keyboardKeys.forEach((rowKeys, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
      
        // Add spacer for second row
        if (rowIndex === 1) {
            const spacerLeft = document.createElement('div');
            spacerLeft.classList.add('spacer-half');
            rowDiv.appendChild(spacerLeft);
        }
      
        rowKeys.forEach(key => {
            const btn = document.createElement('button');
            btn.setAttribute('data-key', key);
    
            // Check for special key
            if (specialKeys[key]) {
                btn.textContent = specialKeys[key].label;
                btn.classList.add(specialKeys[key].class);
            } else {
                btn.textContent = key;
            }
    
            rowDiv.appendChild(btn);
        });
      
        // Add spacer for second row
        if (rowIndex === 1) {
            const spacerRight = document.createElement('div');
            spacerRight.classList.add('spacer-half');
            rowDiv.appendChild(spacerRight);
        }
      
        keyboardDiv.appendChild(rowDiv);
    });
}

const keys = document.querySelectorAll('.keyboard-row button');
    
for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = ({ target }) => {
        const key = target.getAttribute('data-key');
        handleKeyInput(key);
    }
}

function startup() {
    const game = document.getElementById('game');
    game.innerHTML = '';
    drawGrid(game);
    drawKeyboard(keyboardKeys);
    registerKeyboardEvents();
    
    console.log(state.secret);
}

startup();

// https://youtu.be/j7OhcuZQ-q8?t=878
// https://youtu.be/oKM2nQdQkIU?t=910
