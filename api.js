// CLOUDFLARE WORKER API
const API_URL = 'https://ultimate2-api2.kawunlere.workers.dev';

// GET data from KV
async function apiGet(key) {
  try {
    const res = await fetch(`${API_URL}/get?key=${key}`);
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.error('API Get Error:', e);
    return null;
  }
}

// SAVE data to KV
async function apiSave(key, data) {
  try {
    const res = await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data })
    });
    const json = await res.json();
    return json.success;
  } catch (e) {
    console.error('API Save Error:', e);
    return false;
  }
}

// DELETE data from KV
async function apiDelete(key) {
  try {
    const res = await fetch(`${API_URL}/delete?key=${key}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  } catch (e) {
    console.error('API Delete Error:', e);
    return false;
  }
}

// HELPER: Get users
async function getUsers() {
  return (await apiGet('users')) || [];
}

// HELPER: Save users
async function saveUsers(users) {
  return await apiSave('users', users);
}

// HELPER: Get tasks
async function getTasks() {
  return (await apiGet('tasks')) || [];
}

// HELPER: Save tasks
async function saveTasks(tasks) {
  return await apiSave('tasks', tasks);
}

// HELPER: Get campaigns
async function getCampaigns() {
  return (await apiGet('campaigns')) || [];
}

// HELPER: Save campaigns
async function saveCampaigns(campaigns) {
  return await apiSave('campaigns', campaigns);
}

// HELPER: Get settings
async function getSettings() {
  return (await apiGet('settings')) || {};
}

// HELPER: Save settings
async function saveSettings(settings) {
  return await apiSave('settings', settings);
}

// HELPER: Get content
async function getContent() {
  return (await apiGet('content')) || {};
}

// HELPER: Save content
async function saveContent(content) {
  return await apiSave('content', content);
}

// HELPER: Get SEO
async function getSEO() {
  return (await apiGet('seo')) || {};
}

// HELPER: Save SEO
async function saveSEO(seo) {
  return await apiSave('seo', seo);
}

// HELPER: Get ads
async function getAds() {
  return (await apiGet('ads')) || {};
}

// HELPER: Save ads
async function saveAds(ads) {
  return await apiSave('ads', ads);
}

// HELPER: Get final link
async function getFinalLink() {
  return (await apiGet('finalLink')) || '#';
}

// HELPER: Save final link
async function saveFinalLink(link) {
  return await apiSave('finalLink', link);
}
