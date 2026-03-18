export const TEAM_COLOR_PALETTE = [
  { main: '#F45B69', light: '#FEE8EA' },
  { main: '#F4A423', light: '#FEF5E7' },
  { main: '#3BBF7A', light: '#E8F8F1' },
  { main: '#4A90E2', light: '#EAF2FD' },
  { main: '#9B59B6', light: '#F5EEF8' },
  { main: '#FF7043', light: '#FBE9E7' },
];

// Keep a flat array for backwards-compat references
export const TEAM_COLORS = TEAM_COLOR_PALETTE.map(p => p.main);

const SKILL_ORDER = { Senior: 3, Mid: 2, Junior: 1 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function snakeDraft(people, teams) {
  const n = teams.length;
  people.forEach((p, i) => {
    const round = Math.floor(i / n);
    const pos = i % n;
    const idx = round % 2 === 0 ? pos : n - 1 - pos;
    teams[idx].members.push(p);
  });
}

function balanceDepts(teams) {
  // Multi-pass: keep swapping until no more dept-duplicates can be resolved
  let improved = true;
  let passes = 0;
  while (improved && passes < 20) {
    improved = false;
    passes++;
    for (let i = 0; i < teams.length; i++) {
      const deptCount = {};
      teams[i].members.forEach(p => {
        if (p.department) deptCount[p.department] = (deptCount[p.department] || 0) + 1;
      });
      for (const [dept, count] of Object.entries(deptCount)) {
        if (count < 2) continue;
        const pIdx = teams[i].members.findIndex(p => p.department === dept);
        const person = teams[i].members[pIdx];
        // Prefer exact skill match, fall back to any skill
        for (const requireSkillMatch of [true, false]) {
          let swapped = false;
          for (let j = 0; j < teams.length; j++) {
            if (j === i) continue;
            const sIdx = teams[j].members.findIndex(p =>
              p.department !== dept &&
              (!requireSkillMatch || (p.skill || '') === (person.skill || ''))
            );
            if (sIdx !== -1) {
              [teams[i].members[pIdx], teams[j].members[sIdx]] =
                [teams[j].members[sIdx], teams[i].members[pIdx]];
              improved = true;
              swapped = true;
              break;
            }
          }
          if (swapped) break;
        }
      }
    }
  }
}

export function generateTeams(people, config) {
  const valid = people.filter(p => p.name.trim());
  const n = valid.length;
  if (n < 2) return [];

  let numTeams;
  if (config.mode === 'byCount') {
    numTeams = Math.max(2, Math.min(config.value, n));
  } else {
    numTeams = Math.max(2, Math.ceil(n / config.value));
  }

  // Fixed chair count per table, derived from config — never grows dynamically
  const chairCount = config.mode === 'bySize'
    ? config.value
    : Math.ceil(n / numTeams);

  const teams = Array.from({ length: numTeams }, (_, i) => {
    const palette = TEAM_COLOR_PALETTE[i % TEAM_COLOR_PALETTE.length];
    return {
      teamId: `team-${Date.now()}-${i}`,
      teamName: `Team ${i + 1}`,
      color: palette.main,
      lightColor: palette.light,
      chairCount,
      members: [],
    };
  });

  const { priority } = config;

  if (priority === 'random') {
    shuffle(valid).forEach((p, i) => teams[i % numTeams].members.push(p));
  } else if (priority === 'skill') {
    const sorted = shuffle(valid).sort(
      (a, b) => (SKILL_ORDER[b.skill] || 0) - (SKILL_ORDER[a.skill] || 0)
    );
    snakeDraft(sorted, teams);
  } else if (priority === 'dept') {
    const groups = {};
    shuffle(valid).forEach(p => {
      const d = p.department || '__none__';
      (groups[d] = groups[d] || []).push(p);
    });
    // Interleave departments round-by-round so same-dept people are spread
    // as far apart as possible before snake-drafting onto teams.
    // e.g. [FE1,FE2,FE3, BE1,BE2] → [FE1,BE1, FE2,BE2, FE3]
    const deptArrays = Object.values(groups);
    const maxLen = Math.max(...deptArrays.map(a => a.length));
    const interleaved = [];
    for (let round = 0; round < maxLen; round++) {
      deptArrays.forEach(arr => { if (round < arr.length) interleaved.push(arr[round]); });
    }
    snakeDraft(interleaved, teams);
  } else {
    const sorted = shuffle(valid).sort(
      (a, b) => (SKILL_ORDER[b.skill] || 0) - (SKILL_ORDER[a.skill] || 0)
    );
    snakeDraft(sorted, teams);
    balanceDepts(teams);
  }

  return teams;
}

// Returns 'Balanced', 'Skewed', or null (not enough members to evaluate)
export function calcBalanceScore(team) {
  const members = team.members.filter(Boolean);
  if (members.length <= 1) return null;

  // Skill check: if 2+ people have a skill set, they should span more than one level
  const setSkills = members.map(m => m.skill).filter(Boolean);
  if (setSkills.length >= 2 && new Set(setSkills).size === 1) return 'Skewed';

  // Dept check: only fires when 2+ people actually have a department set.
  // No single dept should represent more than half the team.
  const setDepts = members.map(m => m.department).filter(Boolean);
  if (setDepts.length >= 2) {
    const counts = setDepts.reduce((acc, d) => { acc[d] = (acc[d] || 0) + 1; return acc; }, {});
    const maxCount = Math.max(...Object.values(counts));
    if (maxCount > Math.ceil(members.length / 2)) return 'Skewed';
  }

  return 'Balanced';
}
