// HAMBURGER MENU
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks) navLinks.classList.remove('active');
  });
});

// GMAIL GATE
const gmailForm = document.getElementById('gmailForm');
const gmailInput = document.getElementById('gmailInput');
const agreeBox = document.getElementById('agreeBox');
const msg = document.getElementById('msg');

if (gmailForm) {
  gmailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = gmailInput.value.trim().toLowerCase();
    const pattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!pattern.test(email)) {
      msg.textContent = "Please enter a valid Gmail address.";
      msg.className = "msg error";
      return;
    }
    if (!agreeBox.checked) {
      msg.textContent = "You must agree to the terms.";
      msg.className = "msg error";
      return;
    }

    let users = JSON.parse(localStorage.getItem('u22_users')) || [];
    if (!users.find(u => u.email === email)) {
      users.push({
        email: email,
        date: new Date().toISOString(),
        verified: false,
        creator: false
      });
      localStorage.setItem('u22_users', JSON.stringify(users));
    }
    localStorage.setItem('u22_currentUser', email);
    localStorage.setItem('u22_unlocked', 'true');

    msg.textContent = "Access granted! Redirecting...";
    msg.className = "msg success";

    setTimeout(() => { window.location.href = "tasks.html"; }, 1500);
  });
}

// AUTO REDIRECT IF NOT UNLOCKED
if (window.location.pathname.includes('tasks.html') || window.location.pathname.includes('creator.html')) {
  if (!localStorage.getItem('u22_unlocked')) {
    window.location.href = "unlock.html";
  }
}

// TASK SYSTEM
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const unlockFinal = document.getElementById('unlockFinal');
const finalLink = document.getElementById('finalLink');

// Default tasks (admin can change later)
const defaultTasks = [
  { id: 1, title: "Subscribe to YouTube Channel", desc: "Click and subscribe", url: "https://youtube.com", timer: 15 },
  { id: 2, title: "Join WhatsApp Channel", desc: "Click and join", url: "https://whatsapp.com", timer: 15 },
  { id: 3, title: "Join Telegram Channel", desc: "Click and join", url: "https://telegram.org", timer: 15 },
  { id: 4, title: "Like the Video", desc: "Click like button", url: "https://youtube.com", timer: 15 },
  { id: 5, title: "Comment on Video", desc: "Drop a comment", url: "https://youtube.com", timer: 15 }
];

// Load tasks from admin or use default
let tasks = JSON.parse(localStorage.getItem('u22_tasks')) || defaultTasks;
let finalUrl = localStorage.getItem('u22_finalLink') || "https://example.com/your-file";
let completed = JSON.parse(localStorage.getItem('u22_completed')) || [];

if (taskList) {
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, i) => {
    const isDone = completed.includes(task.id);
    const item = document.createElement('div');
    item.className = 'task-item' + (isDone ? ' done' : '');
    item.innerHTML = `
      <div class="task-info-left">
        <div class="task-num">${i + 1}</div>
        <div class="task-text">
          <h4>${task.title}</h4>
          <p>${task.desc}</p>
        </div>
      </div>
      <button class="task-btn ${isDone ? 'done' : ''}" data-id="${task.id}" data-url="${task.url}" data-timer="${task.timer}">
        ${isDone ? '✓ Done' : 'Start'}
      </button>
    `;
    taskList.appendChild(item);
  });

  document.querySelectorAll('.task-btn').forEach(btn => {
    btn.addEventListener('click', handleTask);
  });

  updateProgress();
}

function handleTask(e) {
  const btn = e.target;
  const id = parseInt(btn.dataset.id);
  const url = btn.dataset.url;
  const timer = parseInt(btn.dataset.timer);

  if (completed.includes(id)) return;

  // Open link
  window.open(url, '_blank');

  // Start countdown
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
  const percent = Math.round((completed.length / tasks.length) * 100);
  progressBar.style.width = percent + '%';
  progressText.textContent = percent + '% Completed';

  if (percent === 100) {
    unlockFinal.style.display = 'block';
    finalLink.href = finalUrl;
  }
}
