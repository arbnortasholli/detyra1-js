'use strict';

function latinObjective(square) {
  const size = square.length;
  let conflicts = 0;
  for (let index = 0; index < size; index += 1) {
    conflicts += size - new Set(square[index]).size;
    conflicts += size - new Set(square.map((row) => row[index])).size;
  }
  return conflicts;
}

function validateLatin(square) {
  const size = square.length;
  const expected = new Set(Array.from({ length: size }, (_, index) => index + 1));
  return size > 0 && square.every((row) => row.length === size &&
    new Set(row).size === size && row.every((value) => expected.has(value))) &&
    Array.from({ length: size }, (_, column) => new Set(square.map((row) => row[column])))
      .every((values) => values.size === size && [...values].every((value) => expected.has(value)));
}

function solveLatinSquare(size) {
  if (!Number.isInteger(size) || size <= 0) throw new Error('n must be a positive integer');
  const stats = { nodesVisited: 0, backtracks: 0 };
  let board;

  function depthLimitedSearch(depth, limit) {
    stats.nodesVisited += 1;
    if (depth === size * size) return true;
    if (depth >= limit) return false;
    const row = Math.floor(depth / size);
    const column = depth % size;
    for (let value = 1; value <= size; value += 1) {
      if (board[row].includes(value) ||
          board.some((line, index) => index < row && line[column] === value)) continue;
      board[row][column] = value;
      if (depthLimitedSearch(depth + 1, limit)) return true;
      board[row][column] = 0;
    }
    stats.backtracks += 1;
    return false;
  }

  for (let limit = 1; limit <= size * size; limit += 1) {
    board = Array.from({ length: size }, () => Array(size).fill(0));
    if (depthLimitedSearch(0, limit)) {
      return { square: board, depth: limit, objective: latinObjective(board), stats };
    }
  }
  return { square: null, depth: size * size, objective: null, stats };
}

if (require.main === module) {
  const result = solveLatinSquare(5);
  console.log(result.square.map((row) => row.join(' ')).join('\n'));
  console.log(`Objective (duplicates): ${result.objective}`);
}

module.exports = { latinObjective, validateLatin, solveLatinSquare };
