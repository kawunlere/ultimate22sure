// ADMIN PASSWORD
const ADMIN_PASSWORD = "Ultimate22sure@@@";

// LOGIN
function loginAdmin() {
  const pass = document.getElementById('adminPass').value;
  const msg = document.getElementById('adminMsg');

  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('u22_admin', 'true');
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDash').style.display = 'block';
    loadAll();
  } else {
    msg.textContent = "Wrong password!";
    msg.className = "msg error";
  }
}

// AUTO LOGIN IF SESSION
if (sessionStorage.getItem('u22_admin') === 'true') {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDash').style.display = 'block';
    loadAll();
  });
}

// LOGOUT
function logoutAdmin() {
  sessionStorage.removeItem('u22_admin');
  location.reload();
}

// TABS
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
});

// LOAD EVERYTHING
function loadAll() {
  loadTasks();
  loadUsers();
  loadCreators();
  loadSettings();
}

// ===== TASKS =====
function loadTasks() {
  const list = document.getElementById('adminTaskList');
  let tasks = JSON.parse(localStorage.getItem('u22_tasks')) || [];
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No tasks yet. Add your first task above.</p>';
    return;
  }

  tasks.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <div class="admin-item-info">
        <h4>${i + 1}. ${t.title}</h4>
        <p>${t.desc} • ${t.timer}s • ${t.url}</p>
      </div>
      <div class="admin-actions">
        <button class="btn-mini del" onclick="deleteTask(${t.id})">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function addTask() {
  const title = document.getElementById('newTaskTitle').value.trim();
  const desc = document.getElementById('newTaskDesc').value.trim();
  const url = document.getElementById('newTaskUrl').value.trim();
  const timer = parseInt(document.getElementById('newTaskTimer').value) || 15;

  if (!title || !desc || !url) {
    alert("Please fill all task fields.");
    return;
  }

  let tasks = JSON.parse(localStorage.getItem('u22_tasks')) || [];
  tasks.push({
    id: Date.now(),
    title, desc, url, timer
  });
  localStorage.setItem('u22_tasks', JSON.stringify(tasks));

  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskDesc').value = '';
  document.getElementById('newTaskUrl').value = '';
  document.getElementById('newTaskTimer').value = '15';

  loadTasks();
}

function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  let tasks = JSON.parse(localStorage.getItem('u22_tasks')) || [];
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('u22_tasks', JSON.stringify(tasks));
  loadTasks();
}

// ===== USERS =====
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
}

// ===== CREATORS =====
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
          ? `<button class="btn-mini blk" onclick="toggleCreator('${u.email}', false)">Revoke</button>`
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
}

// ===== SETTINGS =====
function loadSettings() {
  const link = localStorage.getItem('u22_finalLink') || '';
  document.getElementById('finalLinkInput').value = link;
}

function saveFinalLink() {
  const link = document.getElementById('finalLinkInput').value.trim();
  const msg = document.getElementById('settingsMsg');

  if (!link) {
    msg.textContent = "Please enter a valid link.";
    msg.className = "msg error";
    return;
  }

  localStorage.setItem('u22_finalLink', link);
  msg.textContent = "Link saved successfully!";
  msg.className = "msg success";
}
