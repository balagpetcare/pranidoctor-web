import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearRememberedIdentifier,
  hasRememberedIdentifier,
  loadRememberedIdentifier,
  saveRememberedIdentifier,
} from "./remember-login";

function createStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("remember-login", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());
  });

  afterEach(() => {
    clearRememberedIdentifier();
    vi.unstubAllGlobals();
  });

  it("stores and loads identifier", () => {
    saveRememberedIdentifier(" admin@test.com ");
    expect(loadRememberedIdentifier()).toBe("admin@test.com");
    expect(hasRememberedIdentifier()).toBe(true);
  });

  it("clears identifier", () => {
    saveRememberedIdentifier("01700000000");
    clearRememberedIdentifier();
    expect(loadRememberedIdentifier()).toBeNull();
    expect(hasRememberedIdentifier()).toBe(false);
  });
});
