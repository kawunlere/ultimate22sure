// HAMBURGER MENU TOGGLE
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

// GMAIL GATE SYSTEM
const gmailForm = document.getElementById('gmailForm');
const gmailInput = document.getElementById('gmailInput');
const agreeBox = document.getElementById('agreeBox');
const msg = document.getElementById('msg');

if (gmailForm) {
  gmailForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = gmailInput.value.trim().toLowerCase();
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailPattern.test(email)) {
      msg.textContent = "Please enter a valid Gmail address.";
      msg.className = "msg error";
      return;
    }

    if (!agreeBox.checked) {
      msg.textContent = "You must agree to the terms.";
      msg.className = "msg error";
      return;
    }

    // Save user data
    let users = JSON.parse(localStorage.getItem('u22_users')) || [];
    const exists = users.find(u => u.email === email);

    if (!exists) {
      users.push({
        email: email,
        date: new Date().toISOString(),
        verified: false,
        creator: false
      });
      localStorage.setItem('u22_users', JSON.stringify(users));
    }

    // Save current session
    localStorage.setItem('u22_currentUser', email);
    localStorage.setItem('u22_unlocked', 'true');

    msg.textContent = "Access granted! Redirecting...";
    msg.className = "msg success";

    setTimeout(() => {
      window.location.href = "tasks.html";
    }, 1500);
  });
}

// AUTO-CHECK IF ALREADY UNLOCKED
if (window.location.pathname.includes('tasks.html') || window.location.pathname.includes('creator.html')) {
  const unlocked = localStorage.getItem('u22_unlocked');
  if (!unlocked) {
    window.location.href = "unlock.html";
  }
}
