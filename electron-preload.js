const { contextBridge, ipcRenderer } = require('electron');

// Expose Steam API to renderer process
contextBridge.exposeInMainWorld('electronSteam', {
  // Cloud Storage
  cloud: {
    write: (filename, data) => ipcRenderer.invoke('steam:cloud:write', filename, data),
    read: (filename) => ipcRenderer.invoke('steam:cloud:read', filename),
    list: () => ipcRenderer.invoke('steam:cloud:list')
  },

  // Achievements
  achievement: {
    unlock: (achievementId) => ipcRenderer.invoke('steam:achievement:unlock', achievementId),
    get: (achievementId) => ipcRenderer.invoke('steam:achievement:get', achievementId)
  },

  // Stats
  stat: {
    set: (statName, value) => ipcRenderer.invoke('steam:stat:set', statName, value),
    get: (statName) => ipcRenderer.invoke('steam:stat:get', statName)
  },

  // Leaderboards
  leaderboard: {
    upload: (leaderboardName, score, details) => ipcRenderer.invoke('steam:leaderboard:upload', leaderboardName, score, details),
    download: (leaderboardName, request, start, end) => ipcRenderer.invoke('steam:leaderboard:download', leaderboardName, request, start, end)
  },

  // User Info
  user: {
    getInfo: () => ipcRenderer.invoke('steam:user:info')
  },

  // Check if running in Electron
  isElectron: true
});