// Storage utility — uses Electron store when available, falls back to localStorage
const isElectron = () => window.electronAPI !== undefined;

const storage = {
  async get(key) {
    if (isElectron()) {
      return await window.electronAPI.storeGet(key);
    }
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : undefined;
  },

  async set(key, value) {
    if (isElectron()) {
      return await window.electronAPI.storeSet(key, value);
    }
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  },

  async delete(key) {
    if (isElectron()) {
      return await window.electronAPI.storeDelete(key);
    }
    localStorage.removeItem(key);
    return true;
  },
};

export default storage;
