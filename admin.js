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

  // TAB SWITCH
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
function loadAll() {
  loadStats();
  loadTasks();
  loadCampaigns();
  loadUsers();
  loadCreators();
  loadContent();
  loadSEO();
  loadAds();
  loadSettings();
}

// STATS
function loadStats() {
  const users = JSON.parse(localStorage.getItem('u22_users')) || [];
  const tasks = JSON.parse(localStorage.getItem('u22_tasks')) || [];
  const campaigns = JSON.parse(localStorage.getItem('u22_campaigns')) || [];
  const creators = users.filter(u => u.creator).length;

  document.getElementById('statUsers').textContent = users.length;
  document.getElementById('statTasks').textContent = tasks.length;
  document.getElementById('statCreators').textContent = creators;
  document.getElementById('statCampaigns').textContent = campaigns.length;
}

// TASKS
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

function loadTasks() {
  const list = document.getElementById('adminTaskList');
  let tasks = JSON.parse(localStorage.getItem('u22_tasks')) || [];
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

function addTask() {
  const type = document.getElementById('taskType').value;
  const title = document.getElementById('newTaskTitle').value.trim();
  const desc = document.getElementById('newTaskDesc').value.trim();
  const url = document.getElementById('newTaskUrl').value.trim();
  const timer = parseInt(document.getElementById('newTaskTimer').value) || 15;

  if (!title || !desc || !url) {
    alert("Please fill all task fields.");
    return;
  }

  let tasks = JSON.parse(localStorage.getItem('u22_tasks')) || [];
  tasks.push({ id: Date.now(), type, title, desc, url, timer });
  localStorage.setItem('u22_tasks', JSON.stringify(tasks));

  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskDesc').value = '';
  document.getElementById('newTaskUrl').value = '';
  document.getElementById('newTaskTimer').value = '15';

  loadTasks();
  loadStats();
}

function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  let tasks = JSON.parse(localStorage.getItem('u22_tasks')) || [];
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('u22_tasks', JSON.stringify(tasks));
  loadTasks();
  loadStats();
}

// CAMPAIGNS
function loadCampaigns() {
  const list = document.getElementById('adminCampaignList');
  let campaigns = JSON.parse(localStorage.getItem('u22_campaigns')) || [];
  list.innerHTML = '';

  if (campaigns.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No campaigns yet. Campaigns appear when creators build them.</p>';
    return;
  }

  campaigns.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <div class="admin-item-info">
        <h4>${c.name}</h4>
        <p>By: ${c.creator} • Link: /c/${c.id}</p>
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

function deleteCampaign(id) {
  if (!confirm("Delete this campaign?")) return;
  let campaigns = JSON.parse(localStorage.getItem('u22_campaigns')) || [];
  campaigns = campaigns.filter(c => c.id !== id);
  localStorage.setItem('u22_campaigns', JSON.stringify(campaigns));
  loadCampaigns();
  loadStats();
}

// USERS
function loadUsers() {
  const list = document.getElementById('adminUserList');
  let users = JSON.parse(localStorage.getItem('u22_users')) || [];
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

function deleteUser(email) {
  if (!confirm("Remove this user?")) return;
  let users = JSON.parse(localStorage.getItem('u22_users')) || [];
  users = users.filter(u => u.email !== email);
  localStorage.setItem('u22_users', JSON.stringify(users));
  loadUsers();
  loadCreators();
  loadStats();
}

// CREATORS
function loadCreators() {
  const list = document.getElementById('adminCreatorList');
  let users = JSON.parse(localStorage.getItem('u22_users')) || [];
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
          ? `<button class="btn-mini blk" onclick="toggleCreator('${u.email}', false)">Revoke</button>
             <button class="btn-mini app" onclick="loginAsCreator('${u.email}')">View Dashboard</button>`
          : `<button class="btn-mini app" onclick="toggleCreator('${u.email}', true)">Approve</button>`
        }
      </div>
    `;
    list.appendChild(div);
  });
}

function toggleCreator(email, status) {
  let users = JSON.parse(localStorage.getItem('u22_users')) || [];
  users = users.map(u => {
    if (u.email === email) u.creator = status;
    return u;
  });
  localStorage.setItem('u22_users', JSON.stringify(users));
  loadCreators();
  loadUsers();
  loadStats();
}

function loginAsCreator(email) {
  localStorage.setItem('u22_currentUser', email);
  localStorage.setItem('u22_unlocked', 'true');
  localStorage.setItem('u22_adminOverride', 'true');
  window.open('creator.html', '_blank');
}

// CONTENT
function loadContent() {
  const c = JSON.parse(localStorage.getItem('u22_content')) || {};
  document.getElementById('cHeroTitle').value = c.heroTitle || '';
  document.getElementById('cHeroDesc').value = c.heroDesc || '';
  document.getElementById('cCounter').value = c.counter || '';
  document.getElementById('cAboutTitle').value = c.aboutTitle || '';
  document.getElementById('cAboutLead').value = c.aboutLead || '';
  document.getElementById('cMission').value = c.mission || '';
  document.getElementById('cVision').value = c.vision || '';
  document.getElementById('cFooter').value = c.footer || '';
}

function saveContent() {
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
  localStorage.setItem('u22_content', JSON.stringify(content));
  showMsg('contentMsg', 'Content saved!', 'success');
}

// SEO
function loadSEO() {
  const s = JSON.parse(localStorage.getItem('u22_seo')) || {};
  document.getElementById('sTitle').value = s.title || '';
  document.getElementById('sDesc').value = s.desc || '';
  document.getElementById('sKeywords').value = s.keywords || '';
  document.getElementById('sOgImage').value = s.ogImage || '';
}

function saveSEO() {
  const seo = {
    title: document.getElementById('sTitle').value,
    desc: document.getElementById('sDesc').value,
    keywords: document.getElementById('sKeywords').value,
    ogImage: document.getElementById('sOgImage').value
  };
  localStorage.setItem('u22_seo', JSON.stringify(seo));
  showMsg('seoMsg', 'SEO saved!', 'success');
}

// ADS
function loadAds() {
  const a = JSON.parse(localStorage.getItem('u22_ads')) || {};
  document.getElementById('adMonetag').value = a.monetag || '';
  document.getElementById('adPropeller').value = a.propeller || '';
  document.getElementById('adCustom').value = a.custom || '';
}

function saveAds() {
  const ads = {
    monetag: document.getElementById('adMonetag').value,
    propeller: document.getElementById('adPropeller').value,
    custom: document.getElementById('adCustom').value
  };
  localStorage.setItem('u22_ads', JSON.stringify(ads));
  showMsg('adsMsg', 'Ads saved!', 'success');
}

// SETTINGS
function loadSettings() {
  document.getElementById('finalLinkInput').value = localStorage.getItem('u22_finalLink') || '';
  const s = JSON.parse(localStorage.getItem('u22_settings')) || {};
  document.getElementById('colorRed').value = s.colorRed || '#ff2d2d';
  document.getElementById('colorBlue').value = s.colorBlue || '#0a1d4a';
  document.getElementById('colorOrange').value = s.colorOrange || '#ff6600';
  document.getElementById('contactEmail').value = s.contactEmail || 'kawunlere@gmail.com';
  document.getElementById('maintenance').value = s.maintenance || 'off';
}

function saveSettings() {
  const link = document.getElementById('finalLinkInput').value.trim();
  if (link) localStorage.setItem('u22_finalLink', link);

  const settings = {
    colorRed: document.getElementById('colorRed').value,
    colorBlue: document.getElementById('colorBlue').value,
    colorOrange: document.getElementById('colorOrange').value,
    contactEmail: document.getElementById('contactEmail').value,
    maintenance: document.getElementById('maintenance').value
  };
  localStorage.setItem('u22_settings', JSON.stringify(settings));
  showMsg('settingsMsg', 'Settings saved!', 'success');
}

// HELPER
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + type;
  setTimeout(() => { el.textContent = ''; }, 3000);
}
