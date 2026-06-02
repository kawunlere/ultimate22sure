const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle) menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

const urlParams = new URLSearchParams(window.location.search);
const campaignId = urlParams.get('id');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const unlockFinal = document.getElementById('unlockFinal');
const finalLink = document.getElementById('finalLink');
const campaignNotFound = document.getElementById('campaignNotFound');

let campaign = null;
let completed = JSON.parse(localStorage.getItem('u22_cmp_completed_' + campaignId)) || [];

(async () => {
  const campaigns = await getCampaigns();
  campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    document.getElementById('campaignName').style.display = 'none';
    document.getElementById('campaignCreator').style.display = 'none';
    document.querySelector('.progress-wrap').style.display = 'none';
    document.querySelector('.progress-text').style.display = 'none';
    campaignNotFound.style.display = 'block';
    return;
  }
  document.getElementById('campaignName').textContent = campaign.name;
  document.getElementById('campaignCreator').textContent = 'Created by ' + campaign.creator;
  const visitorKey = 'u22_visited_' + campaign.id;
  if (!sessionStorage.getItem(visitorKey)) {
    sessionStorage.setItem(visitorKey, 'true');
    let updated = await getCampaigns();
    updated = updated.map(c => { if (c.id === campaign.id) c.visitors = (c.visitors || 0) + 1; return c; });
    await saveCampaigns(updated);
  }
  renderCampaignTasks();
})();

function renderCampaignTasks() {
  taskList.innerHTML = '';
  campaign.tasks.forEach((task, i) => {
    const isDone = completed.includes(task.id);
    const item = document.createElement('div');
    item.className = 'task-item' + (isDone ? ' done' : '');
    item.innerHTML = `<div class="task-info-left"><div class="task-num">${i+1}</div><div class="task-text"><h4>${task.title}</h4><p>${task.desc}</p></div></div><button class="task-btn ${isDone ? 'done' : ''}" data-id="${task.id}" data-url="${task.url}" data-timer="${task.timer}">${isDone ? '✓ Done' : 'Start'}</button>`;
    taskList.appendChild(item);
  });
  document.querySelectorAll('.task-btn').forEach(btn => btn.addEventListener('click', handleTask));
  updateProgress();
}

function handleTask(e) {
  const btn = e.target;
  const id = parseInt(btn.dataset.id);
  const url = btn.dataset.url;
  const timer = parseInt(btn.dataset.timer);
  if (completed.includes(id)) return;
  window.open(url, '_blank');
  btn.classList.add('verifying');
  btn.disabled = true;
  let count = timer;
  btn.textContent = `Verifying ${count}s`;
  const interval = setInterval(() => {
    count--;
    btn.textContent = `Verifying ${count}s`;
    if (count <= 0) {
      clearInterval(interval);
      completed.push(id);
      localStorage.setItem('u22_cmp_completed_' + campaignId, JSON.stringify(completed));
      btn.classList.remove('verifying');
      btn.classList.add('done');
      btn.textContent = '✓ Done';
      btn.closest('.task-item').classList.add('done');
      updateProgress();
    }
  }, 1000);
}

async function updateProgress() {
  if (!campaign || !campaign.tasks.length) return;
  const percent = Math.round((completed.length / campaign.tasks.length) * 100);
  progressBar.style.width = percent + '%';
  progressText.textContent = percent + '% Completed';
  if (percent === 100 && unlockFinal) {
    unlockFinal.style.display = 'block';
    finalLink.href = campaign.finalLink;
    const completedKey = 'u22_completed_' + campaign.id;
    if (!sessionStorage.getItem(completedKey)) {
      sessionStorage.setItem(completedKey, 'true');
      let updated = await getCampaigns();
      updated = updated.map(c => { if (c.id === campaign.id) c.completed = (c.completed || 0) + 1; return c; });
      await saveCampaigns(updated);
    }
  }
}
