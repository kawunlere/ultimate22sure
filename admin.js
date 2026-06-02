const ADMIN_PASSWORD = "Ultimate22sure@@@";

// LOGIN
function loginAdmin() {
  const pass = document.getElementById('adminPass').value;
  const msg = document.getElementById('adminMsg');

  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('u22_admin', 'true');
    showDashboard();
  } else {
    msg.textContent = "Wrong password!";
    msg.className = "msg error";
  }
}

function showDashboard() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDash').style.display = 'flex';
  loadAll();
}

if (sessionStorage.getItem('u22_admin') === 'true') {
  document.addEventListener('DOMContentLoaded', showDashboard);
}

function logoutAdmin() {
  sessionStorage.removeItem('u22_admin');
  location.reload();
}

// SIDEBAR TOGGLE
document.addEventListener('DOMContentLoaded', () => {
  const sideToggle = document.getElementById('sideToggle');
  const sidebar = document.querySelector('.sidebar');
  if (sideToggle) {
    sideToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('tab-' + tab).classList.add('active');
      document.getElementById('pageTitle').textContent = btn.textContent.replace(/^[^\w]+/, '');
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  });
});

// LOAD ALL
async function loadAll() {
  await loadStats();
  await loadTasks();
  await loadCampaigns();
  await loadUsers();
  await loadCreators();
  await loadContent();
  await loadSEO();
  await loadAds();
  await loadSettings();
}

// STATS
async function loadStats() {
  const users = await getUsers();
  const tasks = await getTasks();
  const campaigns = await getCampaigns();
  const creators = users.filter(u => u.creator).length;

  document.getElementById('statUsers').textContent = users.length;
  document.getElementById('statTasks').textContent = tasks.length;
  document.getElementById('statCreators').textContent = creators;
  document.getElementById('statCampaigns').textContent = campaigns.length;
}

// TASK LABELS
const taskTypeLabels = {
  youtube_sub: 'YouTube Subscribe',
  youtube_like: 'YouTube Like',
  youtube_comment: 'YouTube Comment',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  twitter: 'Twitter',
  custom: 'Custom'
};

// TASKS
async function loadTasks() {
  const list = document.getElementById('adminTaskList');
  const tasks = await getTasks();
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No tasks yet.</p>';
    return;
  }

  tasks.forEach((t, i) => {
    const typeLabel = taskTypeLabels[t.type] || 'Custom';
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <div class="admin-item-info">
        <h4>${i + 1}. ${t.title}</h4>
        <p>[${typeLabel}] ${t.desc} • ${t.timer}s • ${t.url}</p>
      </div>
      <div class="admin-actions">
        <button class="btn-mini del" onclick="deleteTask(${t.id})">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

async function addTask() {
  const type = document.getElementById('taskType').value;
  const title = document.getElementById('newTaskTitle').value.trim();
  const desc = document.getElementById('newTaskDesc').value.trim();
  const url = document.getElementById('newTaskUrl').value.trim();
  const timer = parseInt(document.getElementById('newTaskTimer').value) || 15;

  if (!title || !desc || !url) {
    alert("Please fill all task fields.");
    return;
  }

  let tasks = await getTasks();
  tasks.push({ id: Date.now(), type, title, desc, url, timer });
  await saveTasks(tasks);

  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskDesc').value = '';
  document.getElementById('newTaskUrl').value = '';
  document.getElementById('newTaskTimer').value = '15';

  await loadTasks();
  await loadStats();
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  let tasks = await getTasks();
  tasks = tasks.filter(t => t.id !== id);
  await saveTasks(tasks);
  await loadTasks();
  await loadStats();
}

// CAMPAIGNS
async function loadCampaigns() {
  const list = document.getElementById('adminCampaignList');
  const campaigns = await getCampaigns();
  list.innerHTML = '';

  if (campaigns.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No campaigns yet.</p>';
    return;
  }

  campaigns.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <div class="admin-item-info">
        <h4>${c.name}</h4>
        <p>By: ${c.creator} • Tasks: ${c.tasks.length} • Visitors: ${c.visitors || 0}</p>
      </div>
      <div class="admin-actions">
        <button class="btn-mini app" onclick="viewCampaign('${c.id}')">View</button>
        <button class="btn-mini del" onclick="deleteCampaign('${c.id}')">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function viewCampaign(id) {
  window.open('campaign.html?id=' + id, '_blank');
}

async function deleteCampaign(id) {
  if (!confirm("Delete this campaign?")) return;
  let campaigns = await getCampaigns();
  campaigns = campaigns.filter(c => c.id !== id);
  await saveCampaigns(campaigns);
  await loadCampaigns();
  await loadStats();
}

// USERS
async function loadUsers() {
  const list = document.getElementById('adminUserList');
  const users = await getUsers();
  list.innerHTML = '';

  if (users.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No users yet.</p>';
    return;
  }

  users.forEach((u, i) => {
    const date = new Date(u.date).toLocaleString();
    const div = document.createElement('div');
    div.className = 'admin-item' + (u.creator ? ' creator' : '');
    div.innerHTML = `
      <div class="admin-item-info">
        <h4>${i + 1}. ${u.email} ${u.creator ? '★ Creator' : ''}</h4>
        <p>Joined: ${date}</p>
      </div>
      <div class="admin-actions">
        <button class="btn-mini del" onclick="deleteUser('${u.email}')">Remove</button>
      </div>
    `;
    list.appendChild(div);
  });
}

async function deleteUser(email) {
  if (!confirm("Remove this user?")) return;
  let users = await getUsers();
  users = users.filter(u => u.email !== email);
  await saveUsers(users);
  await loadUsers();
  await loadCreators();
  await loadStats();
}

// CREATORS
async function loadCreators() {
  const list = document.getElementById('adminCreatorList');
  const users = await getUsers();
  list.innerHTML = '';

  if (users.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No users yet.</p>';
    return;
  }

  users.forEach((u) => {
    const div = document.createElement('div');
    div.className = 'admin-item' + (u.creator ? ' creator' : '');
    div.innerHTML = `
      <div class="admin-item-info">
        <h4>${u.email}</h4>
        <p>${u.creator ? '★ Approved Creator' : 'Regular User'}</p>
      </div>
      <div class="admin-actions">
        ${u.creator
          ? `<button class="btn-mini blk" onclick="toggleCreator('${u.email}', false)">Revoke</button>`
          : `<button class="btn-mini app" onclick="toggleCreator('${u.email}', true)">Approve</button>`
        }
      </div>
    `;
    list.appendChild(div);
  });
}

async function toggleCreator(email, status) {
  let users = await getUsers();
  users = users.map(u => {
    if (u.email === email) u.creator = status;
    return u;
  });
  await saveUsers(users);
  await loadCreators();
  await loadUsers();
  await loadStats();
}

// CONTENT
async function loadContent() {
  const c = await getContent();
  document.getElementById('cHeroTitle').value = c.heroTitle || '';
  document.getElementById('cHeroDesc').value = c.heroDesc || '';
  document.getElementById('cCounter').value = c.counter || '';
  document.getElementById('cAboutTitle').value = c.aboutTitle || '';
  document.getElementById('cAboutLead').value = c.aboutLead || '';
  document.getElementById('cMission').value = c.mission || '';
  document.getElementById('cVision').value = c.vision || '';
  document.getElementById('cFooter').value = c.footer || '';
}

async function saveContentBtn() {
  const content = {
    heroTitle: document.getElementById('cHeroTitle').value,
    heroDesc: document.getElementById('cHeroDesc').value,
    counter: document.getElementById('cCounter').value,
    aboutTitle: document.getElementById('cAboutTitle').value,
    aboutLead: document.getElementById('cAboutLead').value,
    mission: document.getElementById('cMission').value,
    vision: document.getElementById('cVision').value,
    footer: document.getElementById('cFooter').value
  };
  await saveContent(content);
  showMsg('contentMsg', 'Content saved!', 'success');
}

// SEO
async function loadSEO() {
  const s = await getSEO();
  document.getElementById('sTitle').value = s.title || '';
  document.getElementById('sDesc').value = s.desc || '';
  document.getElementById('sKeywords').value = s.keywords || '';
  document.getElementById('sOgImage').value = s.ogImage || '';
}

async function saveSEOBtn() {
  const seo = {
    title: document.getElementById('sTitle').value,
    desc: document.getElementById('sDesc').value,
    keywords: document.getElementById('sKeywords').value,
    ogImage: document.getElementById('sOgImage').value
  };
  await saveSEO(seo);
  showMsg('seoMsg', 'SEO saved!', 'success');
}

// ADS
async function loadAds() {
  const a = await getAds();
  document.getElementById('adMonetag').value = a.monetag || '';
  document.getElementById('adPropeller').value = a.propeller || '';
  document.getElementById('adCustom').value = a.custom || '';
}

async function saveAdsBtn() {
  const ads = {
    monetag: document.getElementById('adMonetag').value,
    propeller: document.getElementById('adPropeller').value,
    custom: document.getElementById('adCustom').value
  };
  await saveAds(ads);
  showMsg('adsMsg', 'Ads saved!', 'success');
}

// SETTINGS
async function loadSettings() {
  const link = await getFinalLink();
  document.getElementById('finalLinkInput').value = link === '#' ? '' : link;
  
  const s = await getSettings();
  document.getElementById('colorRed').value = s.colorRed || '#ff2d2d';
  document.getElementById('colorBlue').value = s.colorBlue || '#0a1d4a';
  document.getElementById('colorOrange').value = s.colorOrange || '#ff6600';
  document.getElementById('contactEmail').value = s.contactEmail || 'kawunlere@gmail.com';
  document.getElementById('maintenance').value = s.maintenance || 'off';
}

async function saveSettingsBtn() {
  const link = document.getElementById('finalLinkInput').value.trim();
  if (link) await saveFinalLink(link);

  const settings = {
    colorRed: document.getElementById('colorRed').value,
    colorBlue: document.getElementById('colorBlue').value,
    colorOrange: document.getElementById('colorOrange').value,
    contactEmail: document.getElementById('contactEmail').value,
    maintenance: document.getElementById('maintenance').value
  };
  await saveSettings(settings);
  showMsg('settingsMsg', 'Settings saved!', 'success');
}

// HELPER
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + type;
  setTimeout(() => { el.textContent = ''; }, 3000);
}
