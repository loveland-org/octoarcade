import React, { useCallback, useEffect, useRef, useState } from "react";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  wins: number;
  losses: number;
}

interface LeaderboardProps {
  /** Polling interval in milliseconds when WebSocket is unavailable (default: 5000) */
  pollingIntervalMs?: number;
  /** WebSocket URL for real-time leaderboard updates */
  websocketUrl?: string;
  /** Called when the component fetches new leaderboard data */
  onFetch?: () => Promise<LeaderboardEntry[]>;
}

const DEFAULT_POLLING_INTERVAL_MS = 5000;

/**
 * Leaderboard component that updates in real time after match completion.
 *
 * Fix for: Leaderboard fails to update after match completion (#776)
 *
 * Previously the leaderboard relied on a 60-second Redis TTL and never
 * refreshed automatically, so scores appeared stale until the user manually
 * reloaded the page.
 *
 * This component addresses the issue by:
 *  1. Subscribing to a WebSocket channel that emits `leaderboard.invalidate`
 *     events when a match completes, triggering an immediate refresh.
 *  2. Falling back to polling every `pollingIntervalMs` when a WebSocket
 *     connection is not available.
 */
export const Leaderboard: React.FC<LeaderboardProps> = ({
  pollingIntervalMs = DEFAULT_POLLING_INTERVAL_MS,
  websocketUrl,
  onFetch,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      if (!onFetch) {
        return;
      }
      const data = await onFetch();
      setEntries(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load leaderboard"
      );
    } finally {
      setLoading(false);
    }
  }, [onFetch]);

  // Connect to the WebSocket for real-time invalidation events.
  useEffect(() => {
    if (!websocketUrl) {
      return;
    }

    const ws = new WebSocket(websocketUrl);
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as {
          type: string;
        };
        if (message.type === "leaderboard.invalidate") {
          // A match has completed – refresh the leaderboard immediately.
          void fetchLeaderboard();
        }
      } catch {
        // Ignore malformed messages.
      }
    };

    ws.onerror = () => {
      setError("Real-time connection lost. Falling back to polling.");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [websocketUrl, fetchLeaderboard]);

  // Fall back to polling when WebSocket is unavailable.
  useEffect(() => {
    if (websocketUrl) {
      return;
    }

    void fetchLeaderboard();

    pollingTimerRef.current = setInterval(() => {
      void fetchLeaderboard();
    }, pollingIntervalMs);

    return () => {
      if (pollingTimerRef.current !== null) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [websocketUrl, pollingIntervalMs, fetchLeaderboard]);

  // Perform an initial fetch when using WebSocket mode.
  useEffect(() => {
    if (websocketUrl) {
      void fetchLeaderboard();
    }
  }, [websocketUrl, fetchLeaderboard]);

  if (loading) {
    return (
      <div className="leaderboard leaderboard--loading" aria-busy="true">
        <p>Loading leaderboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard leaderboard--error" role="alert">
        <p>{error}</p>
        <button onClick={() => void fetchLeaderboard()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h2 className="leaderboard__title">Global Leaderboard</h2>
      {lastUpdated && (
        <p className="leaderboard__last-updated" aria-live="polite">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
      <table className="leaderboard__table">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Player</th>
            <th scope="col">Score</th>
            <th scope="col">W</th>
            <th scope="col">L</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.rank} className="leaderboard__row">
              <td>{entry.rank}</td>
              <td>{entry.username}</td>
              <td>{entry.score.toLocaleString()}</td>
              <td>{entry.wins}</td>
              <td>{entry.losses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
