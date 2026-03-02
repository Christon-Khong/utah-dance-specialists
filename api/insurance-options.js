// Vercel serverless function — returns all unique insurance values.
// Merges a hardcoded baseline list of common Utah insurances with any
// additional values already entered by providers in Airtable.
// Only insurance names are returned — no private provider data is exposed.
// GET /api/insurance-options  →  returns { options: [...] }

const BASELINE_INSURANCES = [
  "Aetna",
  "Blue Cross Blue Shield",
  "Cash Based",
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

  const seen = new Set(BASELINE_INSURANCES);

  if (token && baseId) {
    const table = encodeURIComponent("Providers");
    const url   = `https://api.airtable.com/v0/${baseId}/${table}?fields[]=insurances&pageSize=100`;

    try {
      const airtableRes = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (airtableRes.ok) {
        const { records } = await airtableRes.json();
        records.forEach((record) => {
          const ins = record.fields.insurances;
          if (Array.isArray(ins)) ins.forEach((i) => seen.add(i.trim()));
          else if (typeof ins === "string") ins.split(",").map((i) => i.trim()).filter(Boolean).forEach((i) => seen.add(i));
        });
      }
    } catch (_) {
      // Fall through — baseline list still returned
    }
  }

  const options = [...seen].sort();

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
  return res.status(200).json({ options });
}
