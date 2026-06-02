let currentUser = localStorage.getItem('u22_currentUser');
let unlocked = localStorage.getItem('u22_unlocked');
let isCreator = false;
let currentCampaign = null;

async function checkCreatorAccess() {
  currentUser = localStorage.getItem('u22_currentUser');
  unlocked = localStorage.getItem('u22_unlocked');
  if (!currentUser || !unlocked) return false;
  const users = await getUsers();
  const user = users.find(u => u.email === currentUser);
  if (user && user.creator === true) { isCreator = true; return true; }
  return false;
}

document.addEventListener('DOMContentLoaded', async () => {
  const access = await checkCreatorAccess();
  if (access) {
    document.getElementById('creatorAccess').style.display = 'none';
    document.getElementById('creatorDash').style.display = 'flex';
    document.getElementById('creatorEmail').textContent = currentUser;
    document.getElementById('profileEmail').value = currentUser;
    await loadCreatorData();
  } else {
    document.getElementById('creatorAccess').style.display = 'flex';
    document.getElementById('creatorDash').style.display = 'none';
  }
  const sideToggle = document.getElementById('cSideToggle');
  const sidebar = document.querySelector('.sidebar');
  if (sideToggle) sideToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
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
  window.location.href = 'index.html';
}

async function loadCreatorData() {
  const campaigns = await getCampaigns();
  const myCampaigns = campaigns.filter(c => c.creator === currentUser);
  document.getElementById('myCampaignCount').textContent = myCampaigns.length;
  let tv = 0, tc = 0;
  myCampaigns.forEach(c => { tv += (c.visitors || 0); tc += (c.completed || 0); });
  document.getElementById('myVisitors').textContent = tv;
  document.getElementById('myCompleted').textContent = tc;
  await loadMyCampaigns();
}

async function loadMyCampaigns() {
  const list = document.getElementById('myCampaignList');
  const campaigns = await getCampaigns();
  const myCampaigns = campaigns.filter(c => c.creator === currentUser);
  list.innerHTML = '';
  if (myCampaigns.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No campaigns yet.</p>';
    return;
  }
  myCampaigns.forEach((c) => {
    const link = window.location.origin + '/campaign.html?id=' + c.id;
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `<div class="admin-item-info"><h4>${c.name}</h4><p>${c.tasks.length} tasks • ${c.visitors || 0} visitors • ${c.completed || 0} done</p><p style="color:#ff2d2d;word-break:break-all;font-size:11px;margin-top:4px;">${link}</p></div><div class="admin-actions"><button class="btn-mini app" onclick="copyLink('${link}')">Copy</button><button class="btn-mini del" onclick="deleteMyCampaign('${c.id}')">Delete</button></div>`;
    list.appendChild(div);
  });
}

function copyLink(link) {
  navigator.clipboard.writeText(link).then(() => alert('Copied: ' + link)).catch(() => prompt('Copy:', link));
}

async function deleteMyCampaign(id) {
  if (!confirm("Delete?")) return;
  let campaigns = await getCampaigns();
  campaigns = campaigns.filter(c => c.id !== id);
  await saveCampaigns(campaigns);
  await loadCreatorData();
}

function createCampaign() {
  const name = document.getElementById('cmpName').value.trim();
  const finalLink = document.getElementById('cmpFinalLink').value.trim();
  if (!name || !finalLink) { alert("Fill all fields."); return; }
  currentCampaign = { id: 'c' + Date.now(), name, creator: currentUser, finalLink, tasks: [], visitors: 0, completed: 0, date: new Date().toISOString() };
  document.getElementById('addTasksBox').style.display = 'flex';
  document.getElementById('cmpName').disabled = true;
  document.getElementById('cmpFinalLink').disabled = true;
  alert("Campaign ready! Add tasks now.");
}

function addCampaignTask() {
  if (!currentCampaign) { alert("Create campaign first!"); return; }
  const type = document.getElementById('cmpTaskType').value;
  const title = document.getElementById('cmpTaskTitle').value.trim();
  const desc = document.getElementById('cmpTaskDesc').value.trim();
  const url = document.getElementById('cmpTaskUrl').value.trim();
  const timer = parseInt(document.getElementById('cmpTaskTimer').value) || 15;
  if (!title || !desc || !url) { alert("Fill all task fields."); return; }
  currentCampaign.tasks.push({ id: Date.now(), type, title, desc, url, timer });
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
    div.innerHTML = `<div><strong style="color:#0a1d4a;font-size:13px;">${i+1}. ${t.title}</strong><p style="color:#888;font-size:11px;">${t.desc}</p></div><button class="btn-mini del" onclick="removeTempTask(${i})">×</button>`;
    list.appendChild(div);
  });
}

function removeTempTask(i) {
  currentCampaign.tasks.splice(i, 1);
  renderCampaignTasks();
}

async function finishCampaign() {
  if (!currentCampaign) { alert("No campaign!"); return; }
  if (currentCampaign.tasks.length === 0) { alert("Add at least one task!"); return; }
  let campaigns = await getCampaigns();
  campaigns.push(currentCampaign);
  await saveCampaigns(campaigns);
  const link = window.location.origin + '/campaign.html?id=' + currentCampaign.id;
  document.getElementById('cmpMsg').innerHTML = `✅ Published! Share:<br><strong style="color:#ff2d2d;word-break:break-all;font-size:12px;">${link}</strong><br><button class="btn-mini app" style="margin-top:8px;" onclick="copyLink('${link}')">Copy</button>`;
  document.getElementById('cmpMsg').className = 'msg success';
  document.getElementById('cmpName').value = '';
  document.getElementById('cmpFinalLink').value = '';
  document.getElementById('cmpName').disabled = false;
  document.getElementById('cmpFinalLink').disabled = false;
  document.getElementById('addTasksBox').style.display = 'none';
  document.getElementById('cmpTaskList').innerHTML = '';
  currentCampaign = null;
  await loadCreatorData();
}
