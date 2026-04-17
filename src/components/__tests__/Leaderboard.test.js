/**
 * Tests for the Leaderboard component.
 *
 * Run with: node src/components/__tests__/Leaderboard.test.js
 */

// Minimal DOM shim so we can test without a browser
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const Leaderboard = require('../Leaderboard');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

function makeContainer() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

// ── Tests ──────────────────────────────────────────────────────────────────

console.log('\nLeaderboard component tests\n');

// 1. Constructor – requires container
console.log('Constructor');
try {
  new Leaderboard();
  assert(false, 'throws without container');
} catch (e) {
  assert(e.message === 'Leaderboard requires a container element', 'throws without container');
}

// 2. Renders empty state
console.log('\nEmpty state');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c });
  assert(c.querySelector('.leaderboard__empty') !== null, 'shows empty message');
  assert(c.querySelector('.leaderboard__table') === null, 'no table when empty');
}

// 3. addEntry renders a row
console.log('\naddEntry');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c });
  lb.addEntry('Alice', 1500);
  const rows = c.querySelectorAll('.leaderboard__row');
  assert(rows.length === 1, 'one row after first entry');
  assert(c.innerHTML.includes('Alice'), 'player name appears');
  assert(c.innerHTML.includes('1,500'), 'score is formatted');
}

// 4. Entries are sorted by score descending
console.log('\nSorting');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c });
  lb.addEntry('Bob', 500);
  lb.addEntry('Alice', 1500);
  lb.addEntry('Carol', 1000);

  const rows = c.querySelectorAll('.leaderboard__row');
  const names = Array.from(rows).map(r => r.querySelector('.leaderboard__col--player').textContent);
  assert(names[0] === 'Alice', 'highest scorer first');
  assert(names[1] === 'Carol', 'second highest next');
  assert(names[2] === 'Bob',   'lowest scorer last');
}

// 5. Duplicate player keeps the higher score
console.log('\nDuplicate player');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c });
  lb.addEntry('Alice', 1000);
  lb.addEntry('Alice', 2000); // higher – should replace
  lb.addEntry('Alice', 500);  // lower – should be ignored
  const rows = c.querySelectorAll('.leaderboard__row');
  assert(rows.length === 1, 'only one row for same player');
  assert(c.innerHTML.includes('2,000'), 'keeps highest score');
}

// 6. maxEntries limits display
console.log('\nmaxEntries');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c, maxEntries: 3 });
  lb.setEntries([
    { player: 'A', score: 100 },
    { player: 'B', score: 200 },
    { player: 'C', score: 300 },
    { player: 'D', score: 400 },
    { player: 'E', score: 500 },
  ]);
  const rows = c.querySelectorAll('.leaderboard__row');
  assert(rows.length === 3, 'only maxEntries rows shown');
}

// 7. Current player is highlighted
console.log('\nCurrent player');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c, currentPlayer: 'Bob' });
  lb.setEntries([
    { player: 'Alice', score: 1000 },
    { player: 'Bob',   score: 900 },
  ]);
  const currentRow = c.querySelector('.leaderboard__row--current');
  assert(currentRow !== null, 'current player row is highlighted');
  assert(currentRow.querySelector('.leaderboard__col--player').textContent === 'Bob', 'correct row highlighted');
}

// 8. setCurrentPlayer updates highlight
console.log('\nsetCurrentPlayer');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c });
  lb.setEntries([{ player: 'Alice', score: 1000 }, { player: 'Bob', score: 900 }]);
  lb.setCurrentPlayer('Alice');
  const row = c.querySelector('.leaderboard__row--current');
  assert(row !== null && row.querySelector('.leaderboard__col--player').textContent === 'Alice', 'updates current player');
}

// 9. clear() empties the board
console.log('\nclear');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c });
  lb.addEntry('Alice', 1000);
  lb.clear();
  assert(c.querySelector('.leaderboard__row') === null, 'no rows after clear');
  assert(c.querySelector('.leaderboard__empty') !== null, 'empty message shown after clear');
}

// 10. XSS prevention – player name is escaped
console.log('\nXSS prevention');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c });
  lb.addEntry('<script>alert(1)</script>', 999);
  assert(!c.innerHTML.includes('<script>'), 'script tag is escaped');
  assert(c.innerHTML.includes('&lt;script&gt;'), 'characters are entity-encoded');
}

// 11. Top 3 medal emojis
console.log('\nMedal emojis');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c });
  lb.setEntries([
    { player: 'Gold',   score: 300 },
    { player: 'Silver', score: 200 },
    { player: 'Bronze', score: 100 },
    { player: 'Plain',  score: 50  },
  ]);
  // Select only tbody rank cells (excludes the <th> header at index 0)
  const rankCells = c.querySelectorAll('tbody .leaderboard__col--rank');
  assert(rankCells[0].textContent.includes('🥇'), '1st place gets gold medal');
  assert(rankCells[1].textContent.includes('🥈'), '2nd place gets silver medal');
  assert(rankCells[2].textContent.includes('🥉'), '3rd place gets bronze medal');
  assert(!rankCells[3].textContent.includes('🥇') &&
         !rankCells[3].textContent.includes('🥈') &&
         !rankCells[3].textContent.includes('🥉'), '4th place gets no medal');
}

// 12. Custom title
console.log('\nCustom title');
{
  const c = makeContainer();
  const lb = new Leaderboard({ container: c, title: 'Weekly Champions' });
  const heading = c.querySelector('.leaderboard__title');
  assert(heading && heading.textContent === 'Weekly Champions', 'custom title is rendered');
}

// ── Summary ──────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
