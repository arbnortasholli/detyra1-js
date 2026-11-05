'use strict';

function buildSearchTree(start, successors, goal, { maxDepth = 4 } = {}) {
  const root = { state: start, children: [] };
  const expand = (node, path, depth) => {
    if (depth >= maxDepth || goal(node.state)) return;
    for (const state of successors(node.state)) {
      if (path.has(JSON.stringify(state))) continue;
      const child = { state, children: [] };
      node.children.push(child);
      const nextPath = new Set(path);
      nextPath.add(JSON.stringify(state));
      expand(child, nextPath, depth + 1);
    }
  };
  expand(root, new Set([JSON.stringify(start)]), 0);
  return root;
}

const eightPuzzleSuccessors = (state) => {
  const blank = state.indexOf(0);
  const row = Math.floor(blank / 3);
  const column = blank % 3;
  const successors = [];
  for (const [rowDelta, columnDelta] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nextRow = row + rowDelta;
    const nextColumn = column + columnDelta;
    if (nextRow < 0 || nextRow >= 3 || nextColumn < 0 || nextColumn >= 3) continue;
    const nextIndex = nextRow * 3 + nextColumn;
    const next = state.slice();
    [next[blank], next[nextIndex]] = [next[nextIndex], next[blank]];
    successors.push(next);
  }
  return successors;
};

const missionariesSuccessors = (state) => {
  const [missionaries, cannibals, boat] = state;
  const safe = (m, c) => m === 0 || m >= c;
  const result = [];
  for (let m = 0; m <= 2; m += 1) {
    for (let c = 0; c <= 2; c += 1) {
      if (m + c < 1 || m + c > 2) continue;
      const nextM = boat === 0 ? missionaries - m : missionaries + m;
      const nextC = boat === 0 ? cannibals - c : cannibals + c;
      if (nextM < 0 || nextM > 3 || nextC < 0 || nextC > 3) continue;
      if (safe(nextM, nextC) && safe(3 - nextM, 3 - nextC)) {
        result.push([nextM, nextC, 1 - boat]);
      }
    }
  }
  return result;
};

const workforceSuccessors = (state) => {
  const nextWorker = state.assignments.length;
  if (nextWorker >= state.workers.length) return [];
  return state.workers[nextWorker].shifts.map((shift) => ({
    workers: state.workers,
    assignments: [...state.assignments, shift],
  }));
};

function countNodes(tree) {
  return 1 + tree.children.reduce((total, child) => total + countNodes(child), 0);
}

if (require.main === module) {
  const eightPuzzle = buildSearchTree([1, 2, 3, 4, 0, 6, 7, 5, 8], eightPuzzleSuccessors,
    (state) => state.join(',') === '1,2,3,4,5,6,7,8,0', { maxDepth: 4 });
  const missionaries = buildSearchTree([3, 3, 0], missionariesSuccessors,
    (state) => state.join(',') === '0,0,1', { maxDepth: 4 });
  const workforceStart = {
    workers: [{ name: 'Ana', shifts: ['morning', 'afternoon'] },
      { name: 'Blerim', shifts: ['morning', 'afternoon'] }],
    assignments: [],
  };
  const workforce = buildSearchTree(workforceStart, workforceSuccessors,
    (state) => state.assignments.length === state.workers.length, { maxDepth: 2 });
  console.log(`8-Puzzle tree nodes: ${countNodes(eightPuzzle)}`);
  console.log(`Missionaries and Cannibals tree nodes: ${countNodes(missionaries)}`);
  console.log(`Rotating Workforce Scheduling tree nodes: ${countNodes(workforce)}`);
}

module.exports = {
  buildSearchTree,
  eightPuzzleSuccessors,
  missionariesSuccessors,
  workforceSuccessors,
  countNodes,
};
