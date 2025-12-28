const APP_VERSION = '1.1.0';
window.AppVersion = APP_VERSION;

document.addEventListener('DOMContentLoaded', () => {
  const ids = ['appVersionText', 'gameVersion', 'wearVersionText'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = APP_VERSION; });
});

