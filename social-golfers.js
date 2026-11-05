'use strict';

const combinations = (values, size) => {
  const result = [];
  const choose = (start, current) => {
    if (current.length === size) {
      result.push(current.slice());
      return;
    }
    for (let index = start; index <= values.length - (size - current.length); index += 1) {
      current.push(values[index]);
      choose(index + 1, current);
      current.pop();
    }
  };
  choose(0, []);
  return result;
};

function pairKey(first, second) {
  return first < second ? `${first}:${second}` : `${second}:${first}`;
}

function repeatedPairs(schedule) {
  const counts = new Map();
  for (const week of schedule) {
    for (const group of week) {
      for (let first = 0; first < group.length; first += 1) {
        for (let second = first + 1; second < group.length; second += 1) {
          const key = pairKey(group[first], group[second]);
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
    }
  }
  return [...counts.values()].reduce((total, count) => total + Math.max(0, count - 1), 0);
}

function validateSchedule(schedule, players, groups, groupSize) {
  const seenPairs = new Set();
  for (const week of schedule) {
    if (week.length !== groups) return false;
    const playersInWeek = week.flat().sort((a, b) => a - b);
    if (playersInWeek.length !== players ||
        playersInWeek.some((player, index) => player !== index)) return false;
    for (const group of week) {
      if (group.length !== groupSize) return false;
      for (let first = 0; first < group.length; first += 1) {
        for (let second = first + 1; second < group.length; second += 1) {
          const key = pairKey(group[first], group[second]);
          if (seenPairs.has(key)) return false;
          seenPairs.add(key);
        }
      }
    }
  }
  return true;
}

function solveSocialGolfers({
  players = 32,
  groups = 8,
  groupSize = 4,
  weeks = 2,
} = {}) {
  if (!Number.isInteger(players) || !Number.isInteger(groups) ||
      !Number.isInteger(groupSize) || !Number.isInteger(weeks) ||
      players !== groups * groupSize || players <= 0 || groups <= 0 ||
      groupSize <= 0 || weeks <= 0) {
    throw new Error('players must equal groups * groupSize and all parameters must be positive integers');
  }

  const schedule = [];
  const pairHistory = new Set();
  const stats = { nodesVisited: 0, nodesGenerated: 0, backtracks: 0 };
  const playerIds = Array.from({ length: players }, (_, player) => player);

  function partition(remaining, currentWeek) {
    stats.nodesVisited += 1;
    if (remaining.length === 0) {
      schedule.push(currentWeek);
      return true;
    }

    // Choosing the first remaining player removes equivalent group permutations.
    const first = remaining[0];
    const candidateCompanions = combinations(remaining.slice(1), groupSize - 1);
    for (const companions of candidateCompanions) {
      const group = [first, ...companions];
      const newPairs = [];
      let valid = true;
      for (let left = 0; left < group.length && valid; left += 1) {
        for (let right = left + 1; right < group.length; right += 1) {
          const key = pairKey(group[left], group[right]);
          if (pairHistory.has(key)) {
            valid = false;
            break;
          }
          newPairs.push(key);
        }
      }
      if (!valid) continue;

      stats.nodesGenerated += 1;
      newPairs.forEach((key) => pairHistory.add(key));
      const groupSet = new Set(group);
      const nextRemaining = remaining.filter((player) => !groupSet.has(player));
      if (partition(nextRemaining, [...currentWeek, group])) return true;
      newPairs.forEach((key) => pairHistory.delete(key));
    }

    stats.backtracks += 1;
    return false;
  }

  for (let week = 0; week < weeks; week += 1) {
    if (!partition(playerIds, [])) break;
  }

  return {
    schedule,
    requestedWeeks: weeks,
    complete: schedule.length === weeks,
    objective: repeatedPairs(schedule),
    stats,
  };
}

if (require.main === module) {
  const result = solveSocialGolfers({ weeks: 5 });
  console.log(`Social Golfers: ${result.schedule.length}/${result.requestedWeeks} weeks`);
  result.schedule.forEach((week, index) => {
    console.log(`Week ${index + 1}: ${week.map((group) => group.join(',')).join(' | ')}`);
  });
  console.log(`Objective (repeated pairs): ${result.objective}`);
  console.log(`Valid: ${validateSchedule(result.schedule, 32, 8, 4)}`);
}

module.exports = {
  combinations,
  repeatedPairs,
  validateSchedule,
  solveSocialGolfers,
};
