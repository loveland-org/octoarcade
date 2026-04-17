/**
 * Leaderboard component for Octoarcade
 *
 * Displays a ranked list of players and their scores.
 * Supports adding new scores, highlighting the current player,
 * and limiting the displayed entries.
 */
class Leaderboard {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - DOM element to render the leaderboard into
   * @param {string}  [options.title]       - Heading text (default: "Leaderboard")
   * @param {number}  [options.maxEntries]  - Maximum rows to show (default: 10)
   * @param {string}  [options.currentPlayer] - Name of the active player (highlighted)
   */
  constructor({ container, title = 'Leaderboard', maxEntries = 10, currentPlayer = null } = {}) {
    if (!container) throw new Error('Leaderboard requires a container element');

    this.container = container;
    this.title = title;
    this.maxEntries = maxEntries;
    this.currentPlayer = currentPlayer;
    this.entries = [];

    this._render();
  }

  /**
   * Add or update a score entry.
   * If a player with the same name already exists, the higher score is kept.
   *
   * @param {string} player - Player name
   * @param {number} score  - Player score
   */
  addEntry(player, score) {
    if (!player || typeof player !== 'string') throw new Error('player must be a non-empty string');
    if (typeof score !== 'number' || !isFinite(score)) throw new Error('score must be a finite number');

    const existing = this.entries.find(e => e.player === player);
    if (existing) {
      if (score > existing.score) {
        existing.score = score;
      }
    } else {
      this.entries.push({ player, score });
    }

    this._sort();
    this._render();
  }

  /**
   * Replace all entries at once.
   *
   * @param {Array<{player: string, score: number}>} entries
   */
  setEntries(entries) {
    if (!Array.isArray(entries)) throw new Error('entries must be an array');
    this.entries = entries.map(({ player, score }) => ({ player, score }));
    this._sort();
    this._render();
  }

  /**
   * Remove all entries.
   */
  clear() {
    this.entries = [];
    this._render();
  }

  /**
   * Change which player is highlighted.
   *
   * @param {string|null} playerName
   */
  setCurrentPlayer(playerName) {
    this.currentPlayer = playerName;
    this._render();
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  _sort() {
    this.entries.sort((a, b) => b.score - a.score);
  }

  _render() {
    const visibleEntries = this.entries.slice(0, this.maxEntries);

    this.container.innerHTML = '';
    this.container.classList.add('leaderboard');

    // Title
    const heading = document.createElement('h2');
    heading.className = 'leaderboard__title';
    heading.textContent = this.title;
    this.container.appendChild(heading);

    if (visibleEntries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'leaderboard__empty';
      empty.textContent = 'No scores yet. Be the first!';
      this.container.appendChild(empty);
      return;
    }

    // Table
    const table = document.createElement('table');
    table.className = 'leaderboard__table';
    table.setAttribute('aria-label', this.title);

    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th scope="col" class="leaderboard__col leaderboard__col--rank">Rank</th>
        <th scope="col" class="leaderboard__col leaderboard__col--player">Player</th>
        <th scope="col" class="leaderboard__col leaderboard__col--score">Score</th>
      </tr>
    `;
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    visibleEntries.forEach(({ player, score }, index) => {
      const rank = index + 1;
      const row = document.createElement('tr');
      row.className = 'leaderboard__row';

      if (player === this.currentPlayer) {
        row.classList.add('leaderboard__row--current');
      }

      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

      row.innerHTML = `
        <td class="leaderboard__col leaderboard__col--rank">${medal || rank}</td>
        <td class="leaderboard__col leaderboard__col--player">${this._escape(player)}</td>
        <td class="leaderboard__col leaderboard__col--score">${score.toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    this.container.appendChild(table);
  }

  /** Escape HTML special characters to prevent XSS. */
  _escape(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Export for both CommonJS and browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Leaderboard;
} else {
  window.Leaderboard = Leaderboard;
}
