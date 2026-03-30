import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadValidationDict } from "./dictLoader";

// We need to access the module-scoped cache between tests, so we re-import
// the module fresh for each test via vi.resetModules().  The simplest approach
// is to mock fetch globally and isolate each test with module resets.

describe("loadValidationDict", () => {
  beforeEach(() => {
    // Reset module cache so the module-scoped Map is cleared between tests.
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successful fetch returns a Set of uppercase strings", async () => {
    // Arrange: mock fetch to return a valid word array
    const mockWords = ["hunde", "VOGEL", "Musik"];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockWords),
      })
    );

    // Re-import after stubbing so the module uses our stub
    const { loadValidationDict: load } = await import("./dictLoader");

    // Act
    const result = await load("easy");

    // Assert: all entries are uppercase
    expect(result).toBeInstanceOf(Set);
    expect(result.has("HUNDE")).toBe(true);
    expect(result.has("VOGEL")).toBe(true);
    expect(result.has("MUSIK")).toBe(true);
    // Lowercase versions should NOT be in the Set
    expect(result.has("hunde")).toBe(false);
  });

  it("second call for the same level returns the cached Set without re-fetching", async () => {
    const mockWords = ["TANTE", "BROTE"];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockWords),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { loadValidationDict: load } = await import("./dictLoader");

    // First call – fetch is invoked
    const result1 = await load("easy");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Second call – should use the cache, fetch is NOT called again
    const result2 = await load("easy");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Both calls return the same Set instance
    expect(result1).toBe(result2);
  });

  it("fetch failure (network error) rejects the promise with an informative error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure"))
    );

    const { loadValidationDict: load } = await import("./dictLoader");

    await expect(load("easy")).rejects.toThrow(/Netzwerkfehler/);
  });

  it("non-OK HTTP response rejects the promise with an informative error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn(),
      })
    );

    const { loadValidationDict: load } = await import("./dictLoader");

    await expect(load("easy")).rejects.toThrow(/HTTP 404/);
  });

  it("invalid JSON response rejects the promise", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
      })
    );

    const { loadValidationDict: load } = await import("./dictLoader");

    await expect(load("easy")).rejects.toThrow(/Parsefehler/);
  });

  it("non-array JSON response rejects the promise", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ words: ["TANTE"] }),
      })
    );

    const { loadValidationDict: load } = await import("./dictLoader");

    await expect(load("easy")).rejects.toThrow(/unerwartetes Format/);
  });

  it("different levels are cached independently", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(["TANTE"]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(["ABENDROT"]),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { loadValidationDict: load } = await import("./dictLoader");

    const easyDict = await load("easy");
    const normalDict = await load("normal");

    // Each level triggers exactly one fetch
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // The dictionaries are different Sets
    expect(easyDict).not.toBe(normalDict);
    expect(easyDict.has("TANTE")).toBe(true);
    expect(normalDict.has("ABENDROT")).toBe(true);

    // Calling again for an already-loaded level doesn't re-fetch
    await load("easy");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fetches dict5.json for easy level", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { loadValidationDict: load } = await import("./dictLoader");
    await load("easy");

    expect(fetchMock).toHaveBeenCalledWith("/woertl/dicts/dict5.json");
  });

  it("fetches dict8.json for normal level", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { loadValidationDict: load } = await import("./dictLoader");
    await load("normal");

    expect(fetchMock).toHaveBeenCalledWith("/woertl/dicts/dict8.json");
  });

  it("fetches dict12.json for hard level", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { loadValidationDict: load } = await import("./dictLoader");
    await load("hard");

    expect(fetchMock).toHaveBeenCalledWith("/woertl/dicts/dict12.json");
  });
});
