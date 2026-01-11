const size = 16;
const boardSize = 4;
const tileClasses = 'p-2 h-full w-full text-center align-middle text-3xl leading-normal text-fail-200 font-bold bg-primary-950 border border-primary-700 rounded shadow cursor-pointer select-none';
const winClasses = 'mt-4 bg-warn-700 inline-block border border-warn-600 rounded-lg shadow-lg';
const playClasses = 'mt-4 bg-primary-800 inline-block border border-primary-700 rounded-lg shadow-lg';
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

document.getElementById("playButton").addEventListener("click", function() {
  play();
});
