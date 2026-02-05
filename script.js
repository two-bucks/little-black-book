// Load emails from JSON
async function loadEmails() {
  try {
    const response = await fetch('emails.json');
    const emails = await response.json();
    renderEmailList(emails);
    return emails;
  } catch (error) {
    console.error('Error loading emails:', error);
  }
}

// Render email list in sidebar
function renderEmailList(emails) {
  const list = document.getElementById('emailList');
  list.innerHTML = '';
  emails.forEach(email => {
    const li = document.createElement('li');
    li.className = 'email-item';
    li.innerHTML = `
      <strong>${email.subject || '(No Subject)'}</strong>
      <small>From: ${email.from} | ${new Date(email.date).toLocaleString()}</small>
    `;
    li.addEventListener('click', () => viewEmail(email));
    list.appendChild(li);
  });
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  loadEmails().then(emails => {
    const filtered = emails.filter(email =>
      email.subject.toLowerCase().includes(query) ||
      email.from.toLowerCase().includes(query) ||
      email.body.toLowerCase().includes(query)
    );
    renderEmailList(filtered);
  });
});

// View selected email
function viewEmail(email) {
  // Update sidebar selection
  document.querySelectorAll('.email-item').forEach(item => item.classList.remove('selected'));
  event.currentTarget.classList.add('selected');

  // Render in main viewer
  const viewer = document.getElementById('emailViewer');
  viewer.innerHTML = `
    <h1>${email.subject || '(No Subject)'}</h1>
    <p><strong>From:</strong> ${email.from}</p>
    <p><strong>To:</strong> ${email.to.join(', ')}</p>
    <p><strong>Date:</strong> ${new Date(email.date).toLocaleString()}</p>
    <div class="body">${email.body}</div>
  `;
}

// Initialize
loadEmails();
