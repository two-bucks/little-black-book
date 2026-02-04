# Little Black Book

**The Unsealed Archives** — A document viewer interface for exploring publicly released government files.

---

## Quick Start: GitHub Pages Deployment

### Step 1: Push to GitHub
Your repository is already set up. Just commit and push your changes.

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (tab at the top)
3. Scroll down to **Pages** (left sidebar)
4. Under "Source", select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### Step 3: Access Your Site
After a few minutes, your site will be live at:
```
https://[your-username].github.io/Jmail-Island/
```

---

## Customization Guide

### Changing the Site Title & Branding

**File:** `index.html`

```html
<!-- Line 7: Browser tab title -->
<title>Little Black Book</title>

<!-- Lines 16-17: Visible header -->
<h1 class="site-title">Little Black Book</h1>
<p class="site-tagline">The Unsealed Archives</p>
```

### Changing Colors & Theme

**File:** `styles.css`

All colors are controlled by CSS variables at the top of the file. Edit these to change the entire theme:

```css
:root {
  /* PRIMARY COLORS */
  --color-background:       #0a0a0f;      /* Main background */
  --color-surface:          #12121a;      /* Sidebar/cards */

  /* ACCENT COLORS */
  --color-gold:             #d4af37;      /* Primary accent */
  --color-emerald:          #1a472a;      /* Secondary accent */

  /* TEXT COLORS */
  --color-text-primary:     #f5f0e1;      /* Main readable text */
  --color-text-secondary:   #a89f8a;      /* Secondary info */
}
```

#### Quick Theme Changes:

| To achieve... | Change these variables |
|---------------|------------------------|
| Different accent color | `--color-gold` and `--color-gold-muted` |
| Lighter background | `--color-background` and `--color-surface` |
| Different text color | `--color-text-primary` |
| Different header font | `--font-display` |

### Changing Fonts

Fonts are loaded from Google Fonts in `index.html` (lines 8-10) and applied in `styles.css`:

```css
--font-display:  'Cinzel', serif;      /* Headers */
--font-body:     'Roboto', sans-serif; /* Body text */
```

To change fonts:
1. Find your font on [Google Fonts](https://fonts.google.com/)
2. Replace the `<link>` tag in `index.html`
3. Update the font names in `styles.css`

---

## File Structure

```
Jmail-Island/
├── index.html      # Main HTML structure and branding
├── styles.css      # All styling and theme variables
├── script.js       # Email loading, search, and display logic
├── emails.json     # Email data (DO NOT EDIT for functionality)
└── README.md       # This file
```

### Safe to Edit:
- `index.html` — Branding, title, meta tags
- `styles.css` — Colors, fonts, spacing, layout

### Do NOT Edit (affects functionality):
- `script.js` — Email rendering and search logic
- `emails.json` — Email data structure

---

## Adding Your Own Email Data

The `emails.json` file contains the email data. Each email follows this structure:

```json
{
  "id": 1,
  "from": "sender@example.com",
  "to": ["recipient@example.com"],
  "subject": "Email Subject",
  "date": "2025-01-15T10:00:00Z",
  "body": "Email content here...",
  "attachments": []
}
```

When adding emails, ensure:
- Each email has a unique `id`
- The `date` is in ISO 8601 format
- The `to` field is an array (even for single recipients)

---

## Attribution

This project is based on [epstein-jmail-clone](https://github.com/inputdrive/epstein-jmail-clone) by inputdrive, which was inspired by [jmail.world](https://jmail.world).

---

## License

This project is for educational and journalistic purposes.
