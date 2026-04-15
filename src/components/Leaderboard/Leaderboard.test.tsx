import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Leaderboard, LeaderboardEntry } from "./Leaderboard";

const mockEntries: LeaderboardEntry[] = [
  { rank: 1, username: "alice", score: 5000, wins: 10, losses: 2 },
  { rank: 2, username: "bob", score: 4200, wins: 8, losses: 3 },
  { rank: 3, username: "carol", score: 3800, wins: 7, losses: 4 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockFetch(
  entries: LeaderboardEntry[] = mockEntries
): jest.Mock<Promise<LeaderboardEntry[]>> {
  return jest.fn().mockResolvedValue(entries);
}

// A minimal mock WebSocket so we can control what messages the component sees.
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  close = jest.fn();

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  /** Push a message as if it came from the server. */
  receiveMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent("message", { data: JSON.stringify(data) }));
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Leaderboard", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    // Replace global WebSocket with the mock for tests that use websocketUrl.
    Object.defineProperty(global, "WebSocket", {
      value: MockWebSocket,
      writable: true,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it("renders a loading indicator while fetching", async () => {
    let resolve: (v: LeaderboardEntry[]) => void;
    const pendingFetch = jest.fn(
      () => new Promise<LeaderboardEntry[]>((r) => { resolve = r; })
    );

    render(<Leaderboard onFetch={pendingFetch} />);

    expect(screen.getByText(/loading leaderboard/i)).toBeInTheDocument();

    // Resolve to avoid state-update warnings.
    await act(async () => { resolve(mockEntries); });
  });

  it("renders leaderboard entries after a successful fetch", async () => {
    render(<Leaderboard onFetch={makeMockFetch()} />);

    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });

    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("carol")).toBeInTheDocument();
  });

  it("shows an error message and retry button when fetch fails", async () => {
    const failingFetch = jest
      .fn()
      .mockRejectedValue(new Error("Network error"));

    render(<Leaderboard onFetch={failingFetch} />);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("retries the fetch when the user clicks Retry", async () => {
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockEntries);

    render(<Leaderboard onFetch={fetch} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
    );

    // Use fireEvent to avoid userEvent's internal async delays with fake timers.
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() =>
      expect(screen.getByText("alice")).toBeInTheDocument()
    );
  });

  // -------------------------------------------------------------------------
  // Polling mode (no WebSocket)
  // -------------------------------------------------------------------------

  it("polls for updates at the configured interval", async () => {
    const fetch = makeMockFetch();
    render(<Leaderboard onFetch={fetch} pollingIntervalMs={1000} />);

    // Initial fetch.
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Advance time to trigger two more poll cycles.
    await act(async () => { jest.advanceTimersByTime(2000); });

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("cleans up the polling timer on unmount", async () => {
    const fetch = makeMockFetch();
    const { unmount } = render(
      <Leaderboard onFetch={fetch} pollingIntervalMs={1000} />
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    unmount();

    // No additional calls after unmount.
    await act(async () => { jest.advanceTimersByTime(5000); });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // WebSocket mode – the core fix for #776
  // -------------------------------------------------------------------------

  it("refreshes the leaderboard when a leaderboard.invalidate event arrives", async () => {
    const updatedEntries: LeaderboardEntry[] = [
      { rank: 1, username: "alice", score: 5500, wins: 11, losses: 2 },
    ];
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(mockEntries)
      .mockResolvedValueOnce(updatedEntries);

    render(
      <Leaderboard
        onFetch={fetch}
        websocketUrl="ws://localhost:9999/leaderboard"
      />
    );

    // Initial load.
    await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());

    // Simulate a match completion event from the server.
    const [ws] = MockWebSocket.instances;
    act(() => {
      ws.receiveMessage({ type: "leaderboard.invalidate" });
    });

    // Component should re-fetch and show the updated score.
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByText("5,500")).toBeInTheDocument()
    );
  });

  it("does not poll when a WebSocket URL is provided", async () => {
    const fetch = makeMockFetch();
    render(
      <Leaderboard
        onFetch={fetch}
        websocketUrl="ws://localhost:9999/leaderboard"
        pollingIntervalMs={100}
      />
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Advance time well beyond the polling interval.
    await act(async () => { jest.advanceTimersByTime(1000); });

    // Fetch should still only have been called once (initial) — no polling.
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("closes the WebSocket on unmount", async () => {
    const fetch = makeMockFetch();
    const { unmount } = render(
      <Leaderboard
        onFetch={fetch}
        websocketUrl="ws://localhost:9999/leaderboard"
      />
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const [ws] = MockWebSocket.instances;
    unmount();

    expect(ws.close).toHaveBeenCalled();
  });

  it("ignores unknown WebSocket message types", async () => {
    const fetch = makeMockFetch();
    render(
      <Leaderboard
        onFetch={fetch}
        websocketUrl="ws://localhost:9999/leaderboard"
      />
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const [ws] = MockWebSocket.instances;
    act(() => {
      ws.receiveMessage({ type: "some.other.event" });
    });

    await act(async () => { jest.advanceTimersByTime(500); });

    // Fetch count must not change – unknown events are ignored.
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
