// CHECK ACCESS
const currentUser = localStorage.getItem('u22_currentUser');
const unlocked = localStorage.getItem('u22_unlocked');
let isCreator = false;
let currentCampaign = null;

if (currentUser && unlocked) {
  const users = JSON.parse(localStorage.getItem('u22_users')) || [];
  const user = users.find(u => u.email === currentUser);
  if (user && user.creator) {
    isCreator = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (isCreator) {
    document.getElementById('creatorAccess').style.display = 'none';
    document.getElementById('creatorDash').style.display = 'flex';
    document.getElementById('creatorEmail').textContent = currentUser;
    document.getElementById('profileEmail').value = currentUser;
    loadCreatorData();
  }

  // SIDEBAR
  const sideToggle = document.getElementById('cSideToggle');
  const sidebar = document.querySelector('.sidebar');
  if (sideToggle) {
    sideToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // TABS
  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('tab-' + tab).classList.add('active');
      document.getElementById('cPageTitle').textContent = btn.textContent.replace(/^[^\w]+/, '');
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  });
});

function creatorLogout() {
  localStorage.removeItem('u22_currentUser');
  localStorage.removeItem('u22_unlocked');
  localStorage.removeItem('u22_adminOverride');
  window.location.href = 'index.html';
}

function loadCreatorData() {
  const campaigns = JSON.parse(localStorage.getItem('u22_campaigns')) || [];
  const myCampaigns = campaigns.filter(c => c.creator === currentUser);

  document.getElementById('myCampaignCount').textContent = myCampaigns.length;

  let totalVisitors = 0;
  let totalCompleted = 0;
  myCampaigns.forEach(c => {
    totalVisitors += (c.visitors || 0);
    totalCompleted += (c.completed || 0);
  });
  document.getElementById('myVisitors').textContent = totalVisitors;
  document.getElementById('myCompleted').textContent = totalCompleted;

  loadMyCampaigns();
}

function loadMyCampaigns() {
  const list = document.getElementById('myCampaignList');
  const campaigns = JSON.parse(localStorage.getItem('u22_campaigns')) || [];
  const myCampaigns = campaigns.filter(c => c.creator === currentUser);
  list.innerHTML = '';

  if (myCampaigns.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No campaigns yet. Create your first one!</p>';
    return;
  }

  myCampaigns.forEach((c) => {
    const link = window.location.origin + '/campaign.html?id=' + c.id;
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <div class="admin-item-info">
        <h4>${c.name}</h4>
        <p>${c.tasks.length} tasks • ${c.visitors || 0} visitors • ${c.completed || 0} completed</p>
        <p style="margin-top:4px;color:#ff2d2d;font-weight:600;">${link}</p>
      </div>
      <div class="admin-actions">
        <button class="btn-mini app" onclick="copyLink('${link}')">Copy</button>
        <button class="btn-mini del" onclick="deleteMyCampaign('${c.id}')">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function copyLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    alert('Link copied!');
  });
}

function deleteMyCampaign(id) {
  if (!confirm("Delete this campaign?")) return;
  let campaigns = JSON.parse(localStorage.getItem('u22_campaigns')) || [];
  campaigns = campaigns.filter(c => c.id !== id);
  localStorage.setItem('u22_campaigns', JSON.stringify(campaigns));
  loadCreatorData();
}

// CREATE CAMPAIGN
function createCampaign() {
  const name = document.getElementById('cmpName').value.trim();
  const finalLink = document.getElementById('cmpFinalLink').value.trim();

  if (!name || !finalLink) {
    alert("Please fill all fields.");
    return;
  }

  currentCampaign = {
    id: 'c' + Date.now(),
    name: name,
    creator: currentUser,
    finalLink: finalLink,
    tasks: [],
    visitors: 0,
    completed: 0,
    date: new Date().toISOString()
  };

  document.getElementById('addTasksBox').style.display = 'flex';
  document.getElementById('cmpName').disabled = true;
  document.getElementById('cmpFinalLink').disabled = true;
}

function addCampaignTask() {
  if (!currentCampaign) return;

  const type = document.getElementById('cmpTaskType').value;
  const title = document.getElementById('cmpTaskTitle').value.trim();
  const desc = document.getElementById('cmpTaskDesc').value.trim();
  const url = document.getElementById('cmpTaskUrl').value.trim();
  const timer = parseInt(document.getElementById('cmpTaskTimer').value) || 15;

  if (!title || !desc || !url) {
    alert("Please fill all task fields.");
    return;
  }

  currentCampaign.tasks.push({
    id: Date.now(),
    type, title, desc, url, timer
  });

  document.getElementById('cmpTaskTitle').value = '';
  document.getElementById('cmpTaskDesc').value = '';
  document.getElementById('cmpTaskUrl').value = '';
  document.getElementById('cmpTaskTimer').value = '15';

  renderCampaignTasks();
}

function renderCampaignTasks() {
  const list = document.getElementById('cmpTaskList');
  list.innerHTML = '';
  currentCampaign.tasks.forEach((t, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'background:#fff8f5;padding:10px;border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;';
    div.innerHTML = `
      <div>
        <strong style="color:#0a1d4a;font-size:13px;">${i + 1}. ${t.title}</strong>
        <p style="color:#888;font-size:11px;">${t.desc}</p>
      </div>
      <button class="btn-mini del" onclick="removeTempTask(${i})">×</button>
    `;
    list.appendChild(div);
  });
}

function removeTempTask(i) {
  currentCampaign.tasks.splice(i, 1);
  renderCampaignTasks();
}

function finishCampaign() {
  if (!currentCampaign) return;

  if (currentCampaign.tasks.length === 0) {
    alert("Add at least one task!");
    return;
  }

  let campaigns = JSON.parse(localStorage.getItem('u22_campaigns')) || [];
  campaigns.push(currentCampaign);
  localStorage.setItem('u22_campaigns', JSON.stringify(campaigns));

  const link = window.location.origin + '/campaign.html?id=' + currentCampaign.id;

  document.getElementById('cmpMsg').innerHTML = `Campaign published! Share this link: <br><strong style="color:#ff2d2d;word-break:break-all;">${link}</strong>`;
  document.getElementById('cmpMsg').className = 'msg success';

  // Reset
  document.getElementById('cmpName').value = '';
  document.getElementById('cmpFinalLink').value = '';
  document.getElementById('cmpName').disabled = false;
  document.getElementById('cmpFinalLink').disabled = false;
  document.getElementById('addTasksBox').style.display = 'none';
  document.getElementById('cmpTaskList').innerHTML = '';
  currentCampaign = null;

  loadCreatorData();
}
