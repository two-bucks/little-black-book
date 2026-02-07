// State management
let allEmails = [];
let starredEmails = new Set(JSON.parse(localStorage.getItem('starredEmails') || '[]'));
let readEmails = new Set(JSON.parse(localStorage.getItem('readEmails') || '[]'));
let currentIndex = -1;

// Load emails from JSON
async function loadEmails() {
  try {
    const response = await fetch('emails.json');
    allEmails = await response.json();
    updateEmailCount(allEmails.length);
    renderEmailList(allEmails);
    return allEmails;
  } catch (error) {
    console.error('Error loading emails:', error);
  }
}

// Update email count in header
function updateEmailCount(count) {
  const countEl = document.getElementById('emailCount');
  if (countEl) {
    countEl.textContent = `${count.toLocaleString()} emails`;
  }
}

// Get initials from sender name
function getInitials(name) {
  if (!name) return '?';
  const parts = name.replace(/[<>@.]/g, ' ').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Generate consistent color from string
function getAvatarColor(name) {
  const colors = [
    '#d4af37', '#1a472a', '#8b4513', '#4a90a4', '#6b4c9a',
    '#2d5a3d', '#8b7355', '#5c4033', '#3d5a80', '#7c3c21'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Format date relative to now
function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
  }
}

// Get email preview (first ~50 chars of body)
function getPreview(body) {
  if (!body) return '';
  // Strip HTML tags and get plain text
  const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 60 ? text.substring(0, 60) + '...' : text;
}

// Toggle star on email
function toggleStar(emailId, event) {
  event.stopPropagation();
  if (starredEmails.has(emailId)) {
    starredEmails.delete(emailId);
  } else {
    starredEmails.add(emailId);
  }
  localStorage.setItem('starredEmails', JSON.stringify([...starredEmails]));

  // Update star icon
  const starEl = event.currentTarget;
  starEl.classList.toggle('starred');
  starEl.innerHTML = starredEmails.has(emailId) ? '★' : '☆';
}

// Mark email as read
function markAsRead(emailId) {
  readEmails.add(emailId);
  localStorage.setItem('readEmails', JSON.stringify([...readEmails]));
}

// Render email list in sidebar
function renderEmailList(emails) {
  const list = document.getElementById('emailList');
  list.innerHTML = '';

  emails.forEach((email, index) => {
    const li = document.createElement('li');
    const isRead = readEmails.has(email.id);
    const isStarred = starredEmails.has(email.id);
    const hasAttachments = email.attachments && email.attachments.length > 0;

    li.className = `email-item ${isRead ? 'read' : 'unread'}`;
    li.dataset.index = index;

    li.innerHTML = `
      <div class="email-row">
        <button class="star-btn ${isStarred ? 'starred' : ''}" onclick="toggleStar(${email.id}, event)">
          ${isStarred ? '★' : '☆'}
        </button>
        <div class="avatar" style="background-color: ${getAvatarColor(email.from)}">
          ${getInitials(email.from)}
        </div>
        <div class="email-content">
          <div class="email-header">
            <span class="sender">${email.from}</span>
            <span class="date">${formatRelativeDate(email.date)}</span>
          </div>
          <div class="subject">
            ${email.subject || '(No Subject)'}
            ${hasAttachments ? '<span class="attachment-icon">📎</span>' : ''}
          </div>
          <div class="preview">${getPreview(email.body)}</div>
        </div>
      </div>
    `;

    li.addEventListener('click', () => {
      currentIndex = index;
      viewEmail(email, li);
    });
    list.appendChild(li);
  });
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allEmails.filter(email =>
    (email.subject || '').toLowerCase().includes(query) ||
    (email.from || '').toLowerCase().includes(query) ||
    (email.body || '').toLowerCase().includes(query)
  );
  updateEmailCount(filtered.length);
  renderEmailList(filtered);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const items = document.querySelectorAll('.email-item');
  if (items.length === 0) return;

  if (e.key === 'ArrowDown' || e.key === 'j') {
    e.preventDefault();
    currentIndex = Math.min(currentIndex + 1, items.length - 1);
    items[currentIndex].click();
    items[currentIndex].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp' || e.key === 'k') {
    e.preventDefault();
    currentIndex = Math.max(currentIndex - 1, 0);
    items[currentIndex].click();
    items[currentIndex].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 's' && !e.target.matches('input')) {
    // Star current email
    if (currentIndex >= 0 && allEmails[currentIndex]) {
      const starBtn = items[currentIndex].querySelector('.star-btn');
      if (starBtn) starBtn.click();
    }
  }
});

// Render attachments based on file type
function renderAttachments(attachments) {
  if (!attachments || attachments.length === 0) return '';

  const attachmentHTML = attachments.map(att => {
    const ext = att.filename.split('.').pop().toLowerCase();
    const path = att.url || `media/${att.type}s/${att.filename}`;

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return `
        <div class="attachment attachment-image">
          <img src="${path}" alt="${att.filename}" loading="lazy" onclick="openFullscreen(this)">
          <span class="attachment-name">${att.filename}</span>
        </div>
      `;
    }

    // PDFs - styled card with open button
    if (ext === 'pdf') {
      return `
        <div class="attachment attachment-pdf">
          <div class="pdf-preview">
            <span class="pdf-icon">📄</span>
            <span class="pdf-label">PDF Document</span>
          </div>
          <span class="attachment-name">${att.filename}</span>
          <a href="${path}" target="_blank" class="attachment-link pdf-button">
            Open PDF ↗
          </a>
        </div>
      `;
    }

    // Videos
    if (['mp4', 'mov', 'webm', 'avi'].includes(ext)) {
      return `
        <div class="attachment attachment-video">
          <video controls preload="metadata">
            <source src="${path}" type="video/${ext === 'mov' ? 'quicktime' : ext}">
            Your browser does not support video playback.
          </video>
          <span class="attachment-name">${att.filename}</span>
        </div>
      `;
    }

    // Documents - download link
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) {
      return `
        <div class="attachment attachment-document">
          <a href="${path}" target="_blank" class="attachment-link">
            <span class="doc-icon">📄</span> ${att.filename}
          </a>
        </div>
      `;
    }

    // Default - download link
    return `
      <div class="attachment attachment-file">
        <a href="${path}" target="_blank" class="attachment-link">📁 ${att.filename}</a>
      </div>
    `;
  }).join('');

  return `<div class="attachments-section">
    <h3>Attachments</h3>
    <div class="attachments-grid">${attachmentHTML}</div>
  </div>`;
}

// Fullscreen image viewer
function openFullscreen(img) {
  const overlay = document.createElement('div');
  overlay.className = 'fullscreen-overlay';
  overlay.innerHTML = `
    <img src="${img.src}" alt="${img.alt}">
    <button class="close-fullscreen">&times;</button>
  `;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}

// View selected email
function viewEmail(email, listItem) {
  // Mark as read
  markAsRead(email.id);
  listItem.classList.remove('unread');
  listItem.classList.add('read');

  // Update sidebar selection
  document.querySelectorAll('.email-item').forEach(item => item.classList.remove('selected'));
  listItem.classList.add('selected');

  // Render email viewer with enhanced header
  const viewer = document.getElementById('emailViewer');
  const isStarred = starredEmails.has(email.id);

  viewer.innerHTML = `
    <div class="email-viewer-header">
      <h1>${email.subject || '(No Subject)'}</h1>
      <button class="viewer-star ${isStarred ? 'starred' : ''}" onclick="toggleViewerStar(${email.id}, this)">
        ${isStarred ? '★' : '☆'}
      </button>
    </div>
    <div class="email-meta">
      <div class="avatar avatar-large" style="background-color: ${getAvatarColor(email.from)}">
        ${getInitials(email.from)}
      </div>
      <div class="meta-content">
        <div class="meta-row">
          <strong class="from-name">${email.from}</strong>
          <span class="full-date">${new Date(email.date).toLocaleString()}</span>
        </div>
        <div class="to-row">to ${email.to.join(', ')}</div>
      </div>
    </div>
    <div class="email-body">${email.body}</div>
    ${renderAttachments(email.attachments)}
  `;
}

// Toggle star from viewer
function toggleViewerStar(emailId, btn) {
  if (starredEmails.has(emailId)) {
    starredEmails.delete(emailId);
  } else {
    starredEmails.add(emailId);
  }
  localStorage.setItem('starredEmails', JSON.stringify([...starredEmails]));

  btn.classList.toggle('starred');
  btn.innerHTML = starredEmails.has(emailId) ? '★' : '☆';

  // Update list item star too
  const listStarBtn = document.querySelector(`.email-item[data-index="${currentIndex}"] .star-btn`);
  if (listStarBtn) {
    listStarBtn.classList.toggle('starred', starredEmails.has(emailId));
    listStarBtn.innerHTML = starredEmails.has(emailId) ? '★' : '☆';
  }
}

// Initialize
loadEmails();
