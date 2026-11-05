'use strict';

const PUZZLES = {
  easy: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  medium: [
    [0, 2, 0, 6, 0, 8, 0, 0, 0],
    [5, 8, 0, 0, 0, 9, 7, 0, 0],
    [0, 0, 0, 0, 4, 0, 0, 0, 0],
    [3, 7, 0, 0, 0, 0, 5, 0, 0],
    [6, 0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 8, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 9, 8, 0, 0, 0, 3, 6],
    [0, 0, 0, 3, 0, 6, 0, 9, 0],
  ],
  hard: [
    [8, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 6, 0, 0, 0, 0, 0],
    [0, 7, 0, 0, 9, 0, 2, 0, 0],
    [0, 5, 0, 0, 0, 7, 0, 0, 0],
    [0, 0, 0, 0, 4, 5, 7, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 3, 0],
    [0, 0, 1, 0, 0, 0, 0, 6, 8],
    [0, 0, 8, 5, 0, 0, 0, 1, 0],
    [0, 9, 0, 0, 0, 0, 4, 0, 0],
  ],
};

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function boardKey(board) {
  return board.flat().join(',');
}

function candidates(board, row, column) {
  const size = board.length;
  const blockSize = Math.sqrt(size);
  const used = new Set(board[row]);
  for (let index = 0; index < size; index += 1) used.add(board[index][column]);
  const startRow = Math.floor(row / blockSize) * blockSize;
  const startColumn = Math.floor(column / blockSize) * blockSize;
  for (let r = startRow; r < startRow + blockSize; r += 1) {
    for (let c = startColumn; c < startColumn + blockSize; c += 1) used.add(board[r][c]);
  }
  return Array.from({ length: size }, (_, index) => index + 1)
    .filter((value) => !used.has(value));
}

function validateBoard(board) {
  const size = board.length;
  const blockSize = Math.sqrt(size);
  if (!Number.isInteger(blockSize) || board.some((row) => row.length !== size)) return false;
  const validUnit = (values) => {
    const nonZero = values.filter((value) => value !== 0);
    return nonZero.every((value) => Number.isInteger(value) && value >= 1 && value <= size) &&
      new Set(nonZero).size === nonZero.length;
  };
  for (let index = 0; index < size; index += 1) {
    if (!validUnit(board[index]) || !validUnit(board.map((row) => row[index]))) return false;
  }
  for (let row = 0; row < size; row += blockSize) {
    for (let column = 0; column < size; column += blockSize) {
      if (!validUnit(board.slice(row, row + blockSize)
        .flatMap((line) => line.slice(column, column + blockSize)))) return false;
    }
  }
  return true;
}

function solveSudoku(input, { maxStates = 100000 } = {}) {
  if (!Array.isArray(input) || input.length === 0 || !validateBoard(input) || maxStates <= 0) {
    throw new Error('Sudoku must be a non-empty square grid with a square block size');
  }
  const queue = [cloneBoard(input)];
  const visited = new Set([boardKey(input)]);
  const stats = { nodesVisited: 0, statesGenerated: 0, backtracks: 0 };

  while (queue.length > 0) {
    const board = queue.shift();
    stats.nodesVisited += 1;
    let bestCell = null;
    for (let row = 0; row < board.length; row += 1) {
      for (let column = 0; column < board.length; column += 1) {
        if (board[row][column] !== 0) continue;
        const values = candidates(board, row, column);
        if (values.length === 0) {
          bestCell = { row, column, values };
          break;
        }
        if (!bestCell || values.length < bestCell.values.length) {
          bestCell = { row, column, values };
        }
      }
      if (bestCell && bestCell.values.length === 0) break;
    }
    if (!bestCell) return { board, complete: true, objective: 0, stats };

    let generated = 0;
    for (const value of bestCell.values) {
      const successor = cloneBoard(board);
      successor[bestCell.row][bestCell.column] = value;
      const key = boardKey(successor);
      if (!visited.has(key) && visited.size < maxStates) {
        visited.add(key);
        queue.push(successor);
        generated += 1;
      }
    }
    stats.statesGenerated += generated;
    if (generated === 0) stats.backtracks += 1;
  }
  return { board: null, complete: false, objective: null, stats };
}

if (require.main === module) {
  for (const level of ['easy', 'medium', 'hard']) {
    const result = solveSudoku(PUZZLES[level]);
    console.log(`${level}: ${result.complete ? 'solved' : 'not solved'} (${result.stats.nodesVisited} nodes)`);
    console.log(result.board.map((row) => row.join(' ')).join('\n'));
  }
}

module.exports = { PUZZLES, candidates, validateBoard, solveSudoku };
