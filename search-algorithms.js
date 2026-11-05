'use strict';

function reconstructPath(parent, goalKey) {
  const path = [];
  let key = goalKey;
  while (key !== null) {
    path.push(parent.get(key).state);
    key = parent.get(key).parent;
  }
  return path.reverse();
}

function searchKey(state, key) {
  return key ? key(state) : JSON.stringify(state);
}

function depthFirstSearch(start, successors, goal, { key } = {}) {
  const stack = [{ state: start, parent: null }];
  const visited = new Set();
  const parent = new Map();
  const visitedOrder = [];

  while (stack.length > 0) {
    const node = stack.pop();
    const nodeKey = searchKey(node.state, key);
    if (visited.has(nodeKey)) continue;
    visited.add(nodeKey);
    parent.set(nodeKey, node);
    visitedOrder.push(node.state);
    if (goal(node.state)) {
      return { path: reconstructPath(parent, nodeKey), visitedOrder };
    }
    const nextStates = successors(node.state);
    for (let index = nextStates.length - 1; index >= 0; index -= 1) {
      stack.push({ state: nextStates[index], parent: nodeKey });
    }
  }
  return { path: null, visitedOrder };
}

function breadthFirstSearch(start, successors, goal, { key } = {}) {
  const queue = [{ state: start, parent: null }];
  const visited = new Set([searchKey(start, key)]);
  const parent = new Map();
  const visitedOrder = [];

  while (queue.length > 0) {
    const node = queue.shift();
    const nodeKey = searchKey(node.state, key);
    parent.set(nodeKey, node);
    visitedOrder.push(node.state);
    if (goal(node.state)) {
      return { path: reconstructPath(parent, nodeKey), visitedOrder };
    }
    for (const state of successors(node.state)) {
      const nextKey = searchKey(state, key);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({ state, parent: nodeKey });
    }
  }
  return { path: null, visitedOrder };
}

function depthLimitedSearch(start, successors, goal, limit, { key } = {}) {
  const visitedOrder = [];
  const path = [];
  const onPath = new Set();

  function visit(state, depth) {
    const stateKey = searchKey(state, key);
    visitedOrder.push(state);
    path.push(state);
    onPath.add(stateKey);
    if (goal(state)) return true;
    if (depth < limit) {
      for (const next of successors(state)) {
        const nextKey = searchKey(next, key);
        if (!onPath.has(nextKey) && visit(next, depth + 1)) return true;
      }
    }
    path.pop();
    onPath.delete(stateKey);
    return false;
  }

  return { path: visit(start, 0) ? path.slice() : null, visitedOrder };
}

function iterativeDeepeningSearch(start, successors, goal, { maxDepth = 50, key } = {}) {
  const visitedOrder = [];
  for (let limit = 0; limit <= maxDepth; limit += 1) {
    const result = depthLimitedSearch(start, successors, goal, limit, { key });
    visitedOrder.push(...result.visitedOrder);
    if (result.path) return { path: result.path, depth: limit, visitedOrder };
  }
  return { path: null, depth: null, visitedOrder };
}

module.exports = {
  depthFirstSearch,
  breadthFirstSearch,
  depthLimitedSearch,
  iterativeDeepeningSearch,
};
