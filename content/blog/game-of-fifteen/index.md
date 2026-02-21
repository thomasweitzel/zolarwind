+++
date = "2020-06-11"
title = "The Game of Fifteen"
description = "A playable online game. Not every possible starting position is solvable, so we have to take special care."
authors = ["Thomas Weitzel"]
[taxonomies]
tags = ["javascript"]
[extra]
math = false
image = "banner.webp"
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
    <button id="playButton" class="py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-neutral-950 bg-primary-300 shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-950 active:bg-primary-600 transition duration-150 ease-in-out">
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

```javascript
// for (let i = 0; i < limit; i += 1) {...} vs
// range0(limit).forEach((i) => {...})
const range0 = (limit) => [...Array(limit).keys()];

const isEvenPermutation = (p) => parity(p) % 2 === 0;

const parity = (p) => range0(p.length)
  .map((i) => range0(p.length)
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

<div class="hidden bg-primary-300 bg-primary-500 bg-primary-600 bg-primary-800 bg-primary-950 bg-warn-700 text-neutral-950 text-fail-200 border-primary-700 border-warn-600 border-transparent focus:ring-primary-500 focus:ring-offset-neutral-950"></div>

<script src="game-of-fifteen.js" integrity="sha384-JxrdBI5c+wPKQv/3jeIZHhvFK5u658hFW/SaEFvVQZkE3Obo6boo+t3mu8dXS/ts"></script>
