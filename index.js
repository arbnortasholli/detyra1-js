'use strict';

module.exports = {
  ...require('./social-golfers'),
  ...require('./sudoku'),
  ...require('./latin-square'),
  ...require('./search-trees'),
  ...require('./search-algorithms'),
};

if (require.main === module) {
  const { solveSocialGolfers } = module.exports;
  const { solveSudoku, PUZZLES } = module.exports;
  const { solveLatinSquare } = module.exports;
  const { buildSearchTree, eightPuzzleSuccessors, missionariesSuccessors,
    workforceSuccessors, countNodes } = module.exports;

  const golfers = solveSocialGolfers({ weeks: 5 });
  console.log(`Social Golfers: ${golfers.schedule.length}/${golfers.requestedWeeks} weeks`);
  console.log(`Sudoku easy: ${solveSudoku(PUZZLES.easy).complete ? 'solved' : 'not solved'}`);
  console.log(`Latin Square 5x5 objective: ${solveLatinSquare(5).objective}`);
  console.log(`8-Puzzle tree nodes: ${countNodes(buildSearchTree(
    [1, 2, 3, 4, 0, 6, 7, 5, 8],
    eightPuzzleSuccessors,
    (state) => state.join(',') === '1,2,3,4,5,6,7,8,0',
    { maxDepth: 4 },
  ))}`);
  console.log(`Missionaries and Cannibals tree nodes: ${countNodes(buildSearchTree(
    [3, 3, 0],
    missionariesSuccessors,
    (state) => state.join(',') === '0,0,1',
    { maxDepth: 4 },
  ))}`);
  const workforceStart = {
    workers: [
      { name: 'Ana', shifts: ['morning', 'afternoon'] },
      { name: 'Blerim', shifts: ['morning', 'afternoon'] },
    ],
    assignments: [],
  };
  console.log(`Workforce tree nodes: ${countNodes(buildSearchTree(
    workforceStart,
    workforceSuccessors,
    (state) => state.assignments.length === state.workers.length,
    { maxDepth: 2 },
  ))}`);
}
