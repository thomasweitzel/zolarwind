+++
date = 2020-06-11
title = "The Game of Fifteen"
description = "A playable online game. Not every possible starting position is solvable, so we have to take special care."
authors = ["Thomas Weitzel"]
[taxonomies]
tags=["javascript"]
[extra]
math = false
image = "banner.jpg"
+++

The Game of Fifteen is a sliding puzzle that consists of a square with tiles numbered from 1 to 15 in random order with one tile missing.
To solve the puzzle, you must place the tiles in order by moving tiles to the empty space.

## How to play

Play the game online by clicking/tapping on the tile you want to move.
Only tiles neighboring the empty space can be moved.
Once you solve the puzzle, the tiles will not move anymore.
Just play a new game by clicking the button.
I can guarantee you that every game presented here is solvable.
Read below for an explanation.

Hint: if your browser doesn't display the board correctly, try clearing your browser cache and try again.

<div id="board">
    <div class="m-4 grid grid-flow-row grid-cols-4 grid-rows-4 h-64 w-64 gap-1">
        <div id="f0"  class=""></div>
        <div id="f1"  class=""></div>
        <div id="f2"  class=""></div>
        <div id="f3"  class=""></div>
        <div id="f4"  class=""></div>
        <div id="f5"  class=""></div>
        <div id="f6"  class=""></div>
        <div id="f7"  class=""></div>
        <div id="f8"  class=""></div>
        <div id="f9"  class=""></div>
        <div id="f10" class=""></div>
        <div id="f11" class=""></div>
        <div id="f12" class=""></div>
        <div id="f13" class=""></div>
        <div id="f14" class=""></div>
        <div id="f15" class=""></div>
    </div>
</div>
<div class="mt-4">
    <button id="playButton" class="py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-500 focus:outline-none focus:shadow-outline active:bg-blue-600 transition duration-150 ease-in-out" onclick="play()" >
        new game
    </button>
</div>

## Parity of a permutation

For the Game of Fifteen, a permutation of the numbers 1 to 15 is a state of the game if read line by line - like a book.
Some smart people have figured out, that an even parity (is dividable by 2, like 42) is an invariant of a solvable permutation of the Game of Fifteen.
In computer science, an invariant is a condition that is always true, i.e. doesn't change for a section of code. 

The parity of a permutation is simply the number of inversions.
An inversion happens when an element with a lower index has a higher value than a value at a higher index.

Examples:
- `1, 2, 3` has no inversions, all elements are in order
- `2, 3, 1` has two inversions, because `2` is greater than `1` and `3` is greater than `1` 
- `1, 3, 2` has only one inversion, `3` is greater than `2`

There are about 1.3 Trillion (Billion for us people in Central Europe) possible permutations of the numbers 1 to 15.
Only half of them have an even parity.
When we calculate a random permutation for the start of a game, it then makes sense to filter out all the permutations with an odd parity.
Because we do not want to present an unsolvable game.

Here is a fragment of source code that calculates the parity and checks if it's even for the examples from above.

``` js
const size = 3;

// for (let i = 0; i < limit; i += 1) {...} vs
// range0(size).forEach((i) => {...})
const range0 = (limit) => [...Array(limit).keys()];

const isEvenPermutation = (p) => parity(p) % 2 === 0;

const parity = (p) => range0(size)
  .map((i) => range0(size)
    .filter((j) => i < j && p[i] > p[j])
    .length
  )
  .reduce((agg, v) => agg + v, 0);

// true, 0 inversions
console.log(isEvenPermutation([1, 2, 3]));
// true, 2 inversions
console.log(isEvenPermutation([2, 3, 1]));
// false, 1 inversion
console.log(isEvenPermutation([1, 3, 2]));
```

## Source code

I have created this [GitHub Gist](https://gist.github.com/thomasweitzel/3fd3197616f0299a2935972edd68bd4a) with the complete HTML page including the JavaScript source code.
It runs in the browser and uses just [Tailwind CSS](https://tailwindcss.com) for styling and plain ES6-style JavaScript.
The source code can be used for all square board sizes, not only 4 by 4.
You have to adjust the boards GUI or dynamically generate it - it's easy. 

<script>
  const size = 16;
  const boardSize = 4;
  const tileClasses = 'p-2 h-full w-full text-center align-middle text-3xl leading-normal text-red-900 font-bold bg-white border rounded shadow cursor-pointer select-none';
  const winClasses = 'mt-4 bg-yellow-300 inline-block border border-gray-500 rounded-lg shadow-lg';
  const playClasses = 'mt-4 bg-blue-300 inline-block border border-gray-500 rounded-lg shadow-lg';
  const boardDiv = document.getElementById('board');
  const emptyClasses = '';
  const Direction = {
    RIGHT: 1,
    UP: 2,
    LEFT: 3,
    DOWN: 4,
  };
  const range0 = (limit) => [...Array(limit).keys()];
  const init = () => {
    range0(size).forEach((i) => document.getElementById(`f${i}`).addEventListener("click", move(i)));
  };
  const move = (id) => (_) => {
    if (!hasWon()) {
      const emptyIndex = getEmptyIndex();
      swapIfPossible(id, emptyIndex, Direction.UP);
      swapIfPossible(id, emptyIndex, Direction.LEFT);
      swapIfPossible(id, emptyIndex, Direction.DOWN);
      swapIfPossible(id, emptyIndex, Direction.RIGHT);
      drawElement(id);
      drawElement(emptyIndex);
      drawBoard();
    }
  };
  const swapIfPossible = (id, emptyId, direction) => {
    const emptyCoords = indexToCoords(emptyId);
    const neighborCoords = getNeighbor(direction, emptyCoords);
    if (neighborCoords !== null && coordsToIndex(neighborCoords) === id) {
      const temp = permutation[emptyId];
      permutation[emptyId] = permutation[id];
      permutation[id] = temp;
    }
  };
  const drawElement = (id) => {
    const element = document.getElementById(`f${id}`);
    if (permutation[id] === size - 1) {
      element.innerHTML = '';
      element.className = emptyClasses;
    } else {
      element.innerHTML = `${permutation[id] + 1}`;
      element.className = tileClasses;
    }
  };
  const hasWon = () => range0(size).every((i) => permutation[i] === i);
  const drawBoard = () => {
    if (hasWon()) {
      boardDiv.className = winClasses;
    } else {
      boardDiv.className = playClasses;
    }
  };
  const draw = () => {
    drawBoard();
    range0(size).forEach((i) => drawElement(i));
  };
  const getRandomPermutation = () => {
    const permutation = [];
    const set = new Set(range0(size - 1));
    while (set.size !== 0) {
      const randomIndex = Math.floor(Math.random() * Math.floor(set.size));
      const element = [...set][randomIndex];
      permutation.push(element);
      set.delete(element);
    }
    permutation.push(size - 1);
    return permutation;
  };
  const parity = (p) => range0(size)
    .map((i) => range0(size)
      .filter((j) => i < j && p[i] > p[j])
      .length
    )
    .reduce((agg, v) => agg + v, 0);
  const isEvenPermutation = (p) => parity(p) % 2 === 0;
  const getEvenPermutation = () => {
    let p;
    do {
      p = getRandomPermutation();
    } while (!isEvenPermutation(p))
    return p;
  };
  const indexToCoords = (i) => ({ row: Math.trunc(i / boardSize), column: i % boardSize });
  const coordsToIndex = (coords) => coords.row * boardSize + coords.column;
  const getCellOrNull = (coords) => {
    if (coords.row < 0 || coords.row >= boardSize || coords.column < 0 || coords.column >= boardSize) {
      return null;
    }
    return coords;
  };
  const getNeighbor = (direction, coords) => {
    let result;
    switch (direction) {
      case Direction.RIGHT:
        result = getCellOrNull({ row: coords.row - 1, column: coords.column });
        break;
      case Direction.UP:
        result = getCellOrNull({ row: coords.row + 1, column: coords.column });
        break;
      case Direction.LEFT:
        result = getCellOrNull({ row: coords.row, column: coords.column + 1 });
        break;
      case Direction.DOWN:
        result = getCellOrNull({ row: coords.row, column: coords.column - 1 });
        break;
    }
    return result;
  };
  const getEmptyIndex = () => range0(size).filter((i) => permutation[i] === size - 1)[0];
  const play = () => {
    permutation = getEvenPermutation();
    draw();
  }
  // Lets play ...
  let permutation;
  init();
  play();
</script>
