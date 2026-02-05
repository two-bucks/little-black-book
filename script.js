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

    // Show attachment indicator if present
    const hasAttachments = email.attachments && email.attachments.length > 0;
    const attachmentIcon = hasAttachments ? '<span class="attachment-icon">📎</span>' : '';

    li.innerHTML = `
      <strong>${email.subject || '(No Subject)'} ${attachmentIcon}</strong>
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

    // PDFs
    if (ext === 'pdf') {
      return `
        <div class="attachment attachment-pdf">
          <iframe src="${path}" title="${att.filename}"></iframe>
          <a href="${path}" target="_blank" class="attachment-link">Open PDF: ${att.filename}</a>
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

    // Documents (Word, Excel, etc.) - download link
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
    ${renderAttachments(email.attachments)}
  `;
}

// Initialize
loadEmails();
