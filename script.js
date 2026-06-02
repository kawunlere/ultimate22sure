// LOAD GLOBAL SETTINGS
(async function() {
  try {
    const settings = await getSettings();
    if (settings.colorRed || settings.colorBlue || settings.colorOrange) {
      const style = document.createElement('style');
      style.textContent = `:root { --red:${settings.colorRed || '#ff2d2d'}; --blue:${settings.colorBlue || '#0a1d4a'}; --orange:${settings.colorOrange || '#ff6600'}; }`;
      document.head.appendChild(style);
    }
    if (settings.maintenance === 'on' && !window.location.pathname.includes('admin.html')) {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0a1d4a,#ff2d2d);color:#fff;text-align:center;padding:20px;"><div><div style="font-size:80px;margin-bottom:20px;">⚙</div><h1>Under Maintenance</h1><p>We are upgrading. Please check back soon.</p></div></div>`;
      });
    }
    const seo = await getSEO();
    if (seo.desc) { let m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute('content', seo.desc); }
    if (seo.keywords) { let k = document.createElement('meta'); k.name = 'keywords'; k.content = seo.keywords; document.head.appendChild(k); }
    const ads = await getAds();
    document.addEventListener('DOMContentLoaded', () => {
      if (ads.monetag) { const d = document.createElement('div'); d.innerHTML = ads.monetag; document.body.appendChild(d); }
      if (ads.propeller) { const d = document.createElement('div'); d.innerHTML = ads.propeller; document.body.appendChild(d); }
      if (ads.custom) { const d = document.createElement('div'); d.innerHTML = ads.custom; document.body.appendChild(d); }
    });
  } catch (e) { console.log('Settings load skipped'); }
})();

// LOAD DYNAMIC CONTENT
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const content = await getContent();
    const heroTitle = document.querySelector('.hero-left h1');
    if (heroTitle && content.heroTitle) heroTitle.innerHTML = content.heroTitle.replace(/Premium/i, '<span class="red">Premium</span>');
    const heroDesc = document.querySelector('.hero-left p');
    if (heroDesc && content.heroDesc) heroDesc.textContent = content.heroDesc;
    const counter = document.querySelector('.counter-badge');
    if (counter && content.counter) counter.innerHTML = `<span class="dot"></span> ${content.counter}`;
    const footer = document.querySelector('footer p');
    if (footer && content.footer) footer.textContent = content.footer;
    if (window.location.pathname.includes('about.html')) {
      const h1 = document.querySelector('.page-box h1');
      if (h1 && content.aboutTitle) h1.innerHTML = content.aboutTitle;
      const lead = document.querySelector('.page-box .lead');
      if (lead && content.aboutLead) lead.textContent = content.aboutLead;
      const cards = document.querySelectorAll('.info-card p');
      if (cards[0] && content.mission) cards[0].textContent = content.mission;
      if (cards[1] && content.vision) cards[1].textContent = content.vision;
    }
  } catch (e) {}
});

// MENU
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle) menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => { if (navLinks) navLinks.classList.remove('active'); }));

// GMAIL GATE
const gmailForm = document.getElementById('gmailForm');
const gmailInput = document.getElementById('gmailInput');
const agreeBox = document.getElementById('agreeBox');
const msg = document.getElementById('msg');

if (gmailForm) {
  gmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = gmailInput.value.trim().toLowerCase();
    const pattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!pattern.test(email)) { msg.textContent = "Enter valid Gmail."; msg.className = "msg error"; return; }
    if (!agreeBox.checked) { msg.textContent = "Agree to terms."; msg.className = "msg error"; return; }
    
    msg.textContent = "Processing...";
    msg.className = "msg";
    
    let users = await getUsers();
    if (!users.find(u => u.email === email)) {
      users.push({ email, date: new Date().toISOString(), verified: false, creator: false });
      await saveUsers(users);
    }
    localStorage.setItem('u22_currentUser', email);
    localStorage.setItem('u22_unlocked', 'true');
    msg.textContent = "Access granted! Redirecting...";
    msg.className = "msg success";
    setTimeout(() => { window.location.href = "tasks.html"; }, 1500);
  });
}

// REDIRECT GUARD
if (window.location.pathname.includes('tasks.html')) {
  if (!localStorage.getItem('u22_unlocked')) window.location.href = "unlock.html";
}

// TASK SYSTEM
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const unlockFinal = document.getElementById('unlockFinal');
const finalLink = document.getElementById('finalLink');
let tasks = [];
let finalUrl = "#";
let completed = JSON.parse(localStorage.getItem('u22_completed')) || [];

if (taskList && !window.location.pathname.includes('campaign.html')) {
  (async () => {
    tasks = await getTasks();
    finalUrl = await getFinalLink();
    if (tasks.length === 0) showEmptyTasks();
    else renderTasks();
  })();
}

function showEmptyTasks() {
  taskList.innerHTML = `<div class="empty-tasks"><div class="icon">◈</div><h3>No Tasks Available</h3><p>No active campaigns right now.</p></div>`;
  if (progressBar) progressBar.style.width = '0%';
  if (progressText) progressText.textContent = 'No tasks available';
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, i) => {
    const isDone = completed.includes(task.id);
    const item = document.createElement('div');
    item.className = 'task-item' + (isDone ? ' done' : '');
    item.innerHTML = `<div class="task-info-left"><div class="task-num">${i + 1}</div><div class="task-text"><h4>${task.title}</h4><p>${task.desc}</p></div></div><button class="task-btn ${isDone ? 'done' : ''}" data-id="${task.id}" data-url="${task.url}" data-timer="${task.timer}">${isDone ? '✓ Done' : 'Start'}</button>`;
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
      localStorage.setItem('u22_completed', JSON.stringify(completed));
      btn.classList.remove('verifying');
      btn.classList.add('done');
      btn.textContent = '✓ Done';
      btn.closest('.task-item').classList.add('done');
      updateProgress();
    }
  }, 1000);
}

function updateProgress() {
  if (!tasks.length) return;
  const percent = Math.round((completed.length / tasks.length) * 100);
  if (progressBar) progressBar.style.width = percent + '%';
  if (progressText) progressText.textContent = percent + '% Completed';
  if (percent === 100 && unlockFinal) {
    unlockFinal.style.display = 'block';
    if (finalLink) finalLink.href = finalUrl;
  }
}

// FAQ
document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => q.parentElement.classList.toggle('open')));

// CONTACT
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cName').value;
    const email = document.getElementById('cEmail').value;
    const subject = document.getElementById('cSubject').value;
    const message = document.getElementById('cMessage').value;
    const cMsg = document.getElementById('contactMsg');
    const settings = await getSettings();
    const contactEmail = settings.contactEmail || 'kawunlere@gmail.com';
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;
    cMsg.textContent = "Opening email app...";
    cMsg.className = "msg success";
  });
}
