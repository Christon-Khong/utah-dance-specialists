// Vercel serverless function — returns all unique insurance values from the
// Providers table regardless of published status.
// Only insurance names are returned — no private provider data is exposed.
// GET /api/insurance-options  →  returns { options: [...] }

export default async function handler(req, res) {
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return res.status(500).json({ error: "Airtable env vars not configured" });
  }

  const table = encodeURIComponent("Providers");
  const url   = `https://api.airtable.com/v0/${baseId}/${table}?fields[]=insurances&pageSize=100`;

  try {
    const airtableRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!airtableRes.ok) {
      return res.status(502).json({ error: "Airtable request failed" });
    }

    const { records } = await airtableRes.json();

    const seen = new Set();
    records.forEach((record) => {
      const ins = record.fields.insurances;
      if (Array.isArray(ins)) ins.forEach((i) => seen.add(i.trim()));
      else if (typeof ins === "string") ins.split(",").map((i) => i.trim()).filter(Boolean).forEach((i) => seen.add(i));
    });

    const options = [...seen].sort();

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ options });
  } catch (err) {
    return res.status(500).json({ error: "Internal error", detail: err.message });
  }
}
