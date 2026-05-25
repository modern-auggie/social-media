const memory = new Map();

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}

async function resizeImage(dataUrl, { maxDimension = 1600, quality = 0.86 } = {}) {
  if (!globalThis.document) return dataUrl;

  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = globalThis.document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

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
  },
  files: {
    async readImage(file, options) {
      if (!file || !file.type?.startsWith("image/")) {
        throw new Error("Unsupported image file");
      }

      const dataUrl = await readFileAsDataUrl(file);
      return resizeImage(dataUrl, options);
    },
    async readImages(files, options) {
      return Promise.all(Array.from(files || []).map((file) => this.readImage(file, options)));
    }
  }
};
