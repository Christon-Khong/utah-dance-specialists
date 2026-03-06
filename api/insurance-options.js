// Vercel serverless function — returns all insurance options for the For Providers form.
//
// Source priority:
//   1. Airtable Metadata API — reads the defined choices on the "insurances" field
//      directly, so any option added to the field in Airtable appears automatically
//      even if no provider record has selected it yet.
//   2. Baseline fallback — used if Airtable is unreachable or env vars are missing.
//
// GET /api/insurance-options  ->  { options: [...] }

const BASELINE_INSURANCES = [
  "Aetna",
  "Blue Cross Blue Shield",
  "Cigna",
  "Desert Mutual Benefit Administration (DMBA)",
  "Health Choice Utah",
  "Humana",
  "Medicaid (Utah)",
  "Medicare",
  "Medicare Advantage",
  "Molina",
  "PEHP (Public Employees Health Program)",
  "Regence BlueCross BlueShield",
  "SelectHealth",
  "SelectHealth Advantage Medicare",
  "TRICARE",
  "United Healthcare",
  "University of Utah Health Plan",
  "Other",
];

export default async function handler(req, res) {
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (token && baseId) {
    try {
      // Fetch table schema via Airtable Metadata API
      const metaRes = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (metaRes.ok) {
        const { tables } = await metaRes.json();
        const providersTable = tables.find((t) => t.name === "Providers");
        const insurancesField = providersTable?.fields.find(
          (f) => f.name === "insurances" && f.options?.choices
        );

        if (insurancesField) {
          // choices is an array of { id, name, color } — extract names and sort
          const options = insurancesField.options.choices.map((c) => c.name).sort();
          res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
          return res.status(200).json({ options });
        }
      }
    } catch (_) {
      // Fall through to baseline
    }
  }

  // Fallback: return hardcoded baseline sorted
  const options = [...BASELINE_INSURANCES].sort();
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
  return res.status(200).json({ options });
}
