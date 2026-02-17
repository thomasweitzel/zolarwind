+++
date = 2020-06-11
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

``` js
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

<div class="hidden bg-neutral-50 bg-neutral-100 bg-neutral-200 bg-neutral-300 bg-neutral-400 bg-neutral-500 bg-neutral-600 bg-neutral-700 bg-neutral-800 bg-neutral-900 bg-neutral-950 bg-primary-50 bg-primary-100 bg-primary-200 bg-primary-300 bg-primary-400 bg-primary-500 bg-primary-600 bg-primary-700 bg-primary-800 bg-primary-900 bg-primary-950 bg-ok-50 bg-ok-100 bg-ok-200 bg-ok-300 bg-ok-400 bg-ok-500 bg-ok-600 bg-ok-700 bg-ok-800 bg-ok-900 bg-ok-950 bg-warn-50 bg-warn-100 bg-warn-200 bg-warn-300 bg-warn-400 bg-warn-500 bg-warn-600 bg-warn-700 bg-warn-800 bg-warn-900 bg-warn-950 bg-fail-50 bg-fail-100 bg-fail-200 bg-fail-300 bg-fail-400 bg-fail-500 bg-fail-600 bg-fail-700 bg-fail-800 bg-fail-900 bg-fail-950 text-neutral-50 text-neutral-100 text-neutral-200 text-neutral-300 text-neutral-400 text-neutral-500 text-neutral-600 text-neutral-700 text-neutral-800 text-neutral-900 text-neutral-950 text-primary-50 text-primary-100 text-primary-200 text-primary-300 text-primary-400 text-primary-500 text-primary-600 text-primary-700 text-primary-800 text-primary-900 text-primary-950 text-ok-50 text-ok-100 text-ok-200 text-ok-300 text-ok-400 text-ok-500 text-ok-600 text-ok-700 text-ok-800 text-ok-900 text-ok-950 text-warn-50 text-warn-100 text-warn-200 text-warn-300 text-warn-400 text-warn-500 text-warn-600 text-warn-700 text-warn-800 text-warn-900 text-warn-950 text-fail-50 text-fail-100 text-fail-200 text-fail-300 text-fail-400 text-fail-500 text-fail-600 text-fail-700 text-fail-800 text-fail-900 text-fail-950 border-neutral-50 border-neutral-100 border-neutral-200 border-neutral-300 border-neutral-400 border-neutral-500 border-neutral-600 border-neutral-700 border-neutral-800 border-neutral-900 border-neutral-950 border-primary-50 border-primary-100 border-primary-200 border-primary-300 border-primary-400 border-primary-500 border-primary-600 border-primary-700 border-primary-800 border-primary-900 border-primary-950 border-ok-50 border-ok-100 border-ok-200 border-ok-300 border-ok-400 border-ok-500 border-ok-600 border-ok-700 border-ok-800 border-ok-900 border-ok-950 border-warn-50 border-warn-100 border-warn-200 border-warn-300 border-warn-400 border-warn-500 border-warn-600 border-warn-700 border-warn-800 border-warn-900 border-warn-950 border-fail-50 border-fail-100 border-fail-200 border-fail-300 border-fail-400 border-fail-500 border-fail-600 border-fail-700 border-fail-800 border-fail-900 border-fail-950"></div>

<script src="game-of-fifteen.js" integrity="sha384-JxrdBI5c+wPKQv/3jeIZHhvFK5u658hFW/SaEFvVQZkE3Obo6boo+t3mu8dXS/ts"></script>
