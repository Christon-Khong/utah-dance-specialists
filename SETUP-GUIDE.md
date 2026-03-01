# Utah Dance Specialists — Setup & Deployment Guide

This guide takes you from zero to a live website at `utahdancespecialists.com`.
Estimated total time: **30–45 minutes**.

---

## Step 1 — Install Node.js (5 minutes)

Node.js is the engine that builds your React project.

1. Go to **https://nodejs.org**
2. Click the big green **"LTS"** download button (the left one)
3. Run the installer — click Next through all the default options
4. When it finishes, open **Terminal** (Mac) or **Command Prompt** (Windows)
5. Type `node -v` and press Enter — you should see a version number like `v20.x.x`

---

## Step 2 — Create a GitHub Account (5 minutes)

GitHub stores your code online. Vercel connects to it to deploy your site.

1. Go to **https://github.com**
2. Click **Sign Up** and create a free account
3. Verify your email address

---

## Step 3 — Upload Your Project to GitHub (10 minutes)

1. Log in to GitHub
2. Click the **+** icon in the top right → **New repository**
3. Name it `utah-dance-specialists`
4. Leave it set to **Public**, click **Create repository**
5. On the next screen, click **"uploading an existing file"**
6. Drag and drop **everything inside** the `utah-dance-specialists` folder into the upload area
   - Make sure you include: `src/`, `public/`, `index.html`, `package.json`, `vite.config.js`
7. Click **Commit changes**

---

## Step 4 — Deploy on Vercel (5 minutes)

1. Go to **https://vercel.com** and click **Sign Up**
2. Choose **Continue with GitHub** — this links the two accounts
3. Click **Add New Project**
4. You'll see your `utah-dance-specialists` repo — click **Import**
5. Vercel auto-detects Vite. Leave all settings as-is and click **Deploy**
6. Wait ~60 seconds — your site is live at a URL like `utah-dance-specialists.vercel.app`

---

## Step 5 — Connect Your Custom Domain (10 minutes)

**First, buy the domain:**
1. Go to **https://namecheap.com** (or Google Domains)
2. Search for `utahdancespecialists.com` — should be ~$12/year
3. Purchase it

**Then connect it to Vercel:**
1. In your Vercel project, go to **Settings → Domains**
2. Type `utahdancespecialists.com` and click **Add**
3. Vercel shows you two DNS records to add (an A record and CNAME)
4. Log in to Namecheap → **Domain List → Manage → Advanced DNS**
5. Add the two records Vercel gave you
6. Wait 5–30 minutes — your site is now live at `utahdancespecialists.com`

---

## Adding or Editing Specialists

Your specialist profiles live in one file: **`src/specialists.json`**

To add or edit a provider:
1. Go to your GitHub repository
2. Click on `src` → `specialists.json`
3. Click the **pencil icon** (Edit) in the top right
4. Make your changes — copy an existing specialist block and fill in the new details
5. Click **Commit changes**
6. Vercel automatically rebuilds and redeploys the site in ~60 seconds

### Key fields to edit:
- `"acceptingPatients": true` — change to `false` when they close their waitlist
- `"onsiteAvailable": true` — set to `false` if no longer available backstage
- `"insurances"` — update the array as their accepted plans change

---

## Handling Provider Applications

When a provider submits the "Apply to be Listed" form on the For Providers page,
their details are emailed directly to you via Formspree.

**To activate Formspree (free):**
1. Go to **https://formspree.io** and create a free account
2. Create a new form — copy the form ID (looks like `xrgvwkqp`)
3. Open `src/App.jsx` in GitHub
4. Find the line: `action="https://formspree.io/f/YOUR_FORM_ID"`
5. Replace `YOUR_FORM_ID` with your actual Formspree form ID
6. Commit the change

You'll receive an email for every application. Review it, and if approved, add the
provider to `specialists.json` following the format above.

---

## Upgrading to Airtable (Optional — Recommended Later)

Once you have more than ~10 active providers, consider switching to Airtable:

- Providers fill out a form → data goes directly into an Airtable spreadsheet
- You toggle a "Published" column to Yes to make them visible on the site
- No more manual JSON editing

When you're ready for this step, reach out — the integration can be added in a
few hours of development work.

---

## File Structure Reference

```
utah-dance-specialists/
├── public/
│   └── hero.jpg          ← Your hero banner photo
├── src/
│   ├── App.jsx           ← All pages and UI logic
│   ├── main.jsx          ← React entry point (don't edit)
│   └── specialists.json  ← ★ Edit this to add/update providers
├── index.html            ← HTML shell (don't edit)
├── package.json          ← Project config (don't edit)
└── vite.config.js        ← Build config (don't edit)
```

---

*Questions? The only files you'll ever need to edit regularly are `specialists.json`
(for provider data) and `public/hero.jpg` (to update the banner photo).*
