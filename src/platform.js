const memory = new Map();

export const platform = {
  target: "web",
  storage: {
    read(key, fallback) {
      try {
        const value = globalThis.localStorage?.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return memory.has(key) ? memory.get(key) : fallback;
      }
    },
    write(key, value) {
      try {
        globalThis.localStorage?.setItem(key, JSON.stringify(value));
      } catch {
        memory.set(key, value);
      }
    }
  },
  async share(payload) {
    if (globalThis.navigator?.share) {
      await globalThis.navigator.share(payload);
      return "native";
    }

    if (globalThis.navigator?.clipboard && payload.url) {
      await globalThis.navigator.clipboard.writeText(payload.url);
      return "clipboard";
    }

    return "queued";
  },
  async copy(text) {
    if (globalThis.navigator?.clipboard) {
      await globalThis.navigator.clipboard.writeText(text);
      return "clipboard";
    }

    memory.set("last-copy", text);
    return "queued";
  }
};
