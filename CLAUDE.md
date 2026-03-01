# Utah Dance Medicine — Project State & Next Steps

## What This Is

A React single-page application serving as a public directory of dance medicine specialists in Utah. Dancers can search, filter, and find practitioners who understand the demands of their art. Providers apply through a form; the admin (Christon) approves and publishes them via Google Sheets.

**Live URL:** https://utah-dance-specialists-wrqa.vercel.app
**Target domain:** utahdancemedicine.com (owned, not yet connected in Vercel)
**GitHub repo:** Christon-Khong (push via GitHub Desktop — VM network blocks direct git push)
**Hosting:** Vercel (auto-deploys on every push to main)

---

## Tech Stack

- **React 18** — `useState`-based client-side routing (no React Router)
- **Vite 4** — build tool (`@vitejs/plugin-react`)
- **Inline styles throughout** — no Tailwind, no CSS files, intentional to avoid build complexity
- **Google Fonts** — Cormorant Garamond + Inter, injected via `useEffect`
- **Formspree** — handles form submissions (ID: `mwvnjaqg`)
- **Vercel** — hosting with auto-deploy
- **OpenStreetMap Nominatim** — free geocoding (address → lat/lng), no API key needed
- **localStorage** — caches geocoding results so each address is only looked up once

---

## File Structure

```
utah-dance-specialists/
├── src/
│   ├── App.jsx              # Entire application — all pages, components, logic
│   └── specialists.json     # Fallback provider data (used if Google Sheets is unavailable)
├── public/
│   ├── hero.jpg             # Hero image (Gemini-generated ballet dancers + Utah red rocks)
│   ├── robots.txt           # Tells search engines to index the site
│   └── sitemap.xml          # Lists all 5 pages for Google crawling
├── index.html               # Full SEO meta tags (OG, Twitter Card, canonical, geo)
├── package.json
├── vite.config.js
└── CLAUDE.md                # This file
```

---

## App Architecture

### Pages (5 total, `useState`-routed)
| Page key | Route | Purpose |
|---|---|---|
| `directory` | / (default) | Searchable specialist grid with filters |
| `about` | /about | Mission, story, stats |
| `onsite` | /onsite | Onsite/backstage inquiry form |
| `providers` | /providers | Provider application form |
| `contact` | /contact | General contact form |

### Key Constants (top of App.jsx)
```js
const SITE_URL = "https://utahdancemedicine.com";
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/.../pub?output=csv"; // live data source
```

### Data Flow
1. Page loads — directory instantly renders from `specialists.json` (local fallback)
2. App fetches Google Sheets CSV in background, replaces local data with live data
3. Card colors and initials are auto-assigned by `applyPalette()` based on row index — never stored in the sheet
4. Addresses are geocoded via Nominatim and cached in `localStorage` — radius search becomes available per provider as coordinates resolve

### Color Palette
8 colors cycle automatically by provider index. No human edits hex values. Defined in `COLOR_PALETTE` array in App.jsx.

---

## Google Sheets Integration

**Sheet URL (published CSV):**
`https://docs.google.com/spreadsheets/d/e/2PACX-1vRtq5HtzS7xqKj5ypMGxjYCGGo3Dbi6JYq07OQ5VnWyfVMv7aG07VF2cO25SGNJCUk1xR0Pp4_85jww/pub?output=csv`

### Column Schema (13 columns)
| Column | Format | Notes |
|---|---|---|
| `id` | Integer | Unique, sequential |
| `name` | Text | Full name with title |
| `degrees` | Text | No commas — use spaces: `PT DPT OCS` |
| `certifications` | Pipe-separated | `Dance Medicine\|Dry Needling\|Pilates` |
| `locations` | Pipe-separated | `Salt Lake City\|Park City` |
| `insurances` | Pipe-separated | `SelectHealth\|Aetna\|PEHP` |
| `contactMethod` | `Clinic` or `Personal` | Controls icon on card |
| `contactInfo` | Phone or email | Publicly displayed on card |
| `acceptingPatients` | `TRUE` or `FALSE` | Shows accepting/waitlist badge |
| `bio` | Long text | Shown in expandable section |
| `website` | URL or blank | Optional external link |
| `address` | Street address | Geocoded automatically for radius search |
| `published` | `TRUE` or `FALSE` | Only `TRUE` rows appear on the site |

### To publish a new provider
1. Add a row with `published = FALSE`
2. Fill in their details after review
3. Change `published` to `TRUE` — site updates on next page load (no redeploy needed)

---

## Forms & Formspree

**Form ID:** `mwvnjaqg`
**Both forms POST to:** `https://formspree.io/f/mwvnjaqg`

| Form | Page | `_subject` field |
|---|---|---|
| Provider application | For Providers | `New Provider Application — Utah Dance Medicine` |
| Onsite/backstage inquiry | Onsite Services | `Onsite/Backstage Inquiry — Utah Dance Medicine` |

### Current provider application workflow
1. Provider submits form on the site
2. Christon receives email from Formspree with all fields
3. Christon manually adds an approved provider row to Google Sheets
4. Sets `published = TRUE` when ready to go live

### Future: Automate with Zapier (optional upgrade)
Connect Formspree → Google Sheets via Zapier (free tier: ~100/month):
- New Formspree submission → Zapier creates a row in the sheet with `published = FALSE`
- Christon reviews in sheet, flips to `TRUE` when approved
- ~10 minutes to set up once both accounts are connected

---

## SEO

- `index.html` — full meta tags: description, keywords, canonical, Open Graph, Twitter Card, geo tags
- `public/robots.txt` — allows all crawlers, points to sitemap
- `public/sitemap.xml` — all 5 pages with priority weights
- `useSEO(page)` hook — updates `document.title` on every page navigation
- JSON-LD `MedicalOrganization` structured data — injected into `<head>` on load

---

## Deployment Workflow

Because the VM network blocks outbound git pushes, all deployments go through **GitHub Desktop** on Christon's Windows machine:

1. Claude edits files in `/sessions/sharp-tender-tesla/mnt/Claude/utah-dance-specialists/utah-dance-specialists/`
2. Christon opens GitHub Desktop → sees changed files → writes commit message → **Commit to main** → **Push origin**
3. Vercel detects the push and rebuilds automatically (~60 seconds)

---

## Pending / Next Steps

### High priority
- [ ] **Connect custom domain** — In Vercel: Settings → Domains → add `utahdancemedicine.com`. Add the two DNS records Vercel provides to the domain registrar.
- [ ] **Populate Google Sheet with real provider data** — Replace sample rows with actual approved specialists. Update `published = TRUE` for each.
- [ ] **Push current code** — Several rounds of changes have been made since the last push (Google Sheets integration, radius search, restructured provider form, color automation, geocoding). Commit message: `"Live Google Sheets sync, radius search, auto card colors, geocoding"`

### Medium priority
- [ ] **Activate Formspree** — Verify the form ID `mwvnjaqg` is receiving test submissions and routing to the correct email.
- [ ] **Zapier automation** — Connect Formspree → Google Sheets so provider applications auto-create rows with `published = FALSE`.
- [ ] **Real provider outreach** — Use the strategy guide (`SETUP-GUIDE.md`) to recruit initial verified providers for the directory.

### Lower priority / future
- [ ] **Airtable or Notion upgrade** — If the Google Sheets workflow becomes unwieldy, migrate provider data to Airtable with a proper admin approval UI.
- [ ] **Individual provider pages** — Add URL-addressable routes (e.g. `/providers/sarah-mitchell`) for better SEO and shareability.
- [ ] **Map view** — Once geocoding is proven, add an optional map view of the directory using Leaflet (free, no API key).
- [ ] **Provider self-service** — Allow listed providers to update their own profile (accepting status, bio, insurances) via a simple authenticated link.

---

## Known Constraints

- **No backend** — everything is client-side. Google Sheets is the only data store. Formspree handles form email. Geocoding is client-side with localStorage cache.
- **VM network** — the Cowork VM cannot push to GitHub or fetch from Google Docs. GitHub Desktop on Christon's machine handles pushes; the app fetches Google Sheets at runtime in the user's browser (no VM involved).
- **Nominatim rate limit** — 1 request/second. With 8+ providers all needing geocoding simultaneously, the app spaces requests 1.2 seconds apart. Results are cached in `localStorage` after the first lookup.
- **Google Sheets CSV delay** — published sheet changes can take up to 5 minutes to appear in the CSV export. This is a Google limitation.
