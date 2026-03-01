# Utah Dance Medicine — Project State & Next Steps

## What This Is

A React single-page application serving as a public directory of dance medicine specialists in Utah. Dancers can search, filter, and find practitioners who understand the demands of their art. Providers apply through a form; the admin (Christon) approves and publishes them via Airtable.

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
- **Vercel** — hosting with auto-deploy; `api/providers.js` runs as a serverless function
- **Airtable** — live provider data source, replaces Google Sheets; accessed server-side via `api/providers.js`
- **Zapier** — two zaps: (1) provider applications → Airtable Providers table, (2) onsite inquiries → Airtable Onsite Inquiries table; differentiated by Formspree `_subject` field
- **OpenStreetMap Nominatim** — free geocoding (address → lat/lng), no API key needed
- **localStorage** — caches geocoding results so each address is only looked up once

---

## File Structure

```
utah-dance-specialists/
├── api/
│   └── providers.js         # Vercel serverless function — proxies Airtable, returns published providers
├── src/
│   ├── App.jsx              # Entire application — all pages, components, logic
│   └── specialists.json     # Fallback provider data (shown instantly; replaced by Airtable data)
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
```

### Data Flow
1. Page loads — directory instantly renders from `specialists.json` (local fallback)
2. App fetches `/api/providers` (Vercel serverless) → function queries Airtable for `published=true` rows
3. Card colors are assigned by `applyPalette()` based on the provider's **specialty** field (PT → rose, MD → blue, DO → purple, Surgeon → dark red, Pilates Instructor → teal, Gyrotonics → amber, Personal Trainer → plum, Athletic Trainer → green)
4. Addresses are geocoded via Nominatim and cached in `localStorage` — radius search becomes available per provider as coordinates resolve

### Color Palette
8 colors map to specialties, not indexes. Defined in `SPECIALTY_COLORS` in App.jsx. Providers without a matching specialty fall back to cycling by index.

---

## Airtable Integration

**Base name:** Utah Dance Medicine
**Tables:** Providers, Onsite Inquiries
**API function:** `api/providers.js` (Vercel serverless — keeps token server-side; reads Providers only)

### Required Vercel environment variables
| Var | Where to get it |
|---|---|
| `AIRTABLE_TOKEN` | airtable.com → Account → Developer Hub → Personal Access Tokens (read access to the base) |
| `AIRTABLE_BASE_ID` | Airtable base URL: `airtable.com/appXXXXXXXX/...` — copy the `appXXXXXXXX` part |

Set both in Vercel → Project → Settings → Environment Variables (all environments).

### Table 1: Providers — field schema
| Field | Airtable type | Notes |
|---|---|---|
| `name` | Single line text | Full name with title |
| `degrees` | Single line text | e.g. `PT, DPT, OCS` |
| `specialty` | Single select | PT, MD, DO, Surgeon, Pilates Instructor, Gyrotonics, Personal Trainer, Athletic Trainer — **set by Christon on approval; determines card color** |
| `certifications` | Multiple select | Dry Needling, Pilates, Pelvic Health, Schroth, Strength & Conditioning, Gyrotonics, Personal Trainer, Other |
| `insurances` | Long text | Comma-separated insurance plan names |
| `clinicPhone` | Phone | Publicly displayed on card |
| `clinicEmail` | Email | Publicly displayed on card |
| `personalPhone` | Phone | Publicly displayed on card |
| `personalEmail` | Email | Publicly displayed on card |
| `acceptingPatients` | Checkbox | Shows accepting/waitlist badge |
| `bio` | Long text | Shown in expandable section |
| `website` | URL | Optional external link |
| `address` | Single line text | Geocoded client-side via Nominatim; lat/lng never stored in Airtable |
| `published` | Checkbox | **Master switch — only checked rows appear on the site. Default: unchecked.** |
| `practiceName` | Single line text | Admin/intake only |
| `adminEmail` | Email | Admin only, never shown publicly |
| `adminPhone` | Phone | Admin only, never shown publicly |
| `onsiteInterest` | Single select | Yes, No, Maybe |
| `applicationNotes` | Long text | Internal review notes |
| `applicationDate` | Date | Set by Zapier on submission |

### Table 2: Onsite Inquiries — field schema
| Field | Airtable type | Notes |
|---|---|---|
| `name` | Single line text | Contact person's name |
| `org` | Single line text | Organization / company name |
| `role` | Single line text | Their role (director, producer, etc.) |
| `email` | Email | Contact email |
| `phone` | Phone | Contact phone |
| `eventType` | Single line text | Type of event (performance, intensives, etc.) |
| `eventDate` | Single line text | Approximate date or date range |
| `location` | Single line text | City/venue |
| `dancers` | Number | Approximate number of dancers |
| `notes` | Long text | Additional details from the inquiry form |
| `submittedDate` | Date | Set by Zapier on submission |
| `status` | Single select | New, In Progress, Matched, Completed, Declined |

### To publish a new provider
1. Zapier creates row automatically when Formspree receives application (`published` = unchecked by default)
2. Christon reviews application, fills in `specialty` field, and verifies/corrects other fields
3. Check `published` — site updates on next page load (no redeploy needed)

---

## Forms & Formspree

**Form ID:** `mwvnjaqg`
**Both forms POST to:** `https://formspree.io/f/mwvnjaqg`

| Form | Page | `_subject` field |
|---|---|---|
| Provider application | For Providers | `New Provider Application — Utah Dance Medicine` |
| Onsite/backstage inquiry | Onsite Services | `Onsite/Backstage Inquiry — Utah Dance Medicine` |

Zapier differentiates the two forms by filtering on the `_subject` field — **one Zapier zap per form type.**

### Zap 1 — Provider application → Airtable Providers
- **Trigger:** Formspree → New Submission
- **Filter:** `_subject` contains `New Provider Application`
- **Action:** Airtable → Create Record in **Providers** table
- Field mapping:
  - "Provider Name" → `name`
  - "Credentials / Degrees" → `degrees`
  - "Practice / Clinic Name" → `practiceName`
  - "Website" → `website`
  - "Clinic Phone" → `clinicPhone`
  - "Clinic Email" → `clinicEmail`
  - "Direct Phone" → `personalPhone`
  - "Direct Email" → `personalEmail`
  - "PRIVATE — Admin Email" → `adminEmail`
  - "PRIVATE — Admin Phone" → `adminPhone`
  - "Practice Address" → `address`
  - "Certifications" → `certifications` (Zapier handles comma-separated → Multi Select)
  - "Insurances Accepted" → `insurances`
  - "Bio" → `bio`
  - "Onsite / Backstage Interest" → `onsiteInterest`
  - `applicationDate` → set to today (Zapier "current date" formatter)
  - `published` → leave unchecked (Airtable default)

### Zap 2 — Onsite inquiry → Airtable Onsite Inquiries
- **Trigger:** Formspree → New Submission
- **Filter:** `_subject` contains `Onsite/Backstage Inquiry`
- **Action:** Airtable → Create Record in **Onsite Inquiries** table
- Field mapping:
  - "Name" → `name`
  - "Organization" → `org`
  - "Your Role" → `role`
  - "Email" → `email`
  - "Phone" → `phone`
  - "Event Type" → `eventType`
  - "Event Date" → `eventDate`
  - "Location" → `location`
  - "Number of Dancers" → `dancers`
  - "Additional Notes" / message field → `notes`
  - `submittedDate` → set to today (Zapier "current date" formatter)
  - `status` → set to "New" (hardcoded default)

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

1. Claude edits files in `C:\Users\chris\OneDrive\Documents\Claude\utah-dance-specialists\utah-dance-specialists\`
2. Christon opens GitHub Desktop → sees changed files → writes commit message → **Commit to main** → **Push origin**
3. Vercel detects the push and rebuilds automatically (~60 seconds)

---

## Pending / Next Steps

### High priority
- [ ] **Create Airtable base** — Use the AI prompt (see below) to build the base, then add `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID` to Vercel environment variables.
- [ ] **Set up Zapier** — Connect Formspree → Airtable (see Zapier setup section above). Free tier is sufficient.
- [ ] **Push current code** — Airtable migration + UI changes (specialty colors, 4 contact fields, address → Maps link, updated certifications, "Join the Directory" copy). Commit and push via GitHub Desktop.
- [ ] **Connect custom domain** — Vercel: Settings → Domains → add `utahdancemedicine.com`.
- [ ] **Populate Airtable with real provider data** — Replace sample rows, set `specialty`, check `published`.

### Medium priority
- [ ] **Activate Formspree** — Verify form ID `mwvnjaqg` is routing to the correct email.
- [ ] **Real provider outreach** — Use `SETUP-GUIDE.md` to recruit initial verified providers.

### Lower priority / future
- [ ] **Individual provider pages** — URL-addressable routes (e.g. `/providers/sarah-mitchell`) for SEO.
- [ ] **Map view** — Leaflet map of geocoded providers (free, no API key).
- [ ] **Provider self-service** — Let listed providers update their own profile via an authenticated link.

---

## Known Constraints

- **No backend** — provider reads are server-side via Vercel serverless (`api/providers.js`); everything else (geocoding, filtering, radius search) is client-side. Formspree handles form email. Airtable is the only data store.
- **VM network** — the Cowork VM cannot push to GitHub. GitHub Desktop on Christon's Windows machine handles all pushes; Vercel auto-deploys from there.
- **Nominatim rate limit** — 1 request/second. With many providers needing geocoding simultaneously, the app spaces requests 1.2 seconds apart. Results are cached in `localStorage` (key `udm_geo_v1`) after the first lookup.
- **Airtable CDN cache** — `/api/providers` is cached at Vercel's edge for 5 minutes (`s-maxage=300`). Publishing a provider in Airtable may take up to 5 minutes to appear on the site.
- **Airtable free tier** — 1,000 records per base, 100 records per API response (handled via `pageSize=100`). Sufficient for the foreseeable future.
