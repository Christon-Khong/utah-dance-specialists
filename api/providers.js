// Vercel serverless function — proxies Airtable so the API token stays server-side.
// GET /api/providers  →  returns { providers: [...] } with only published=true rows.
//
// Required Vercel env vars:
//   AIRTABLE_TOKEN    — Personal Access Token (read access to the base)
//   AIRTABLE_BASE_ID  — Base ID, starts with "app..."

export default async function handler(req, res) {
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return res.status(500).json({ error: "Airtable env vars not configured" });
  }

  const table  = encodeURIComponent("Providers");
  const filter = encodeURIComponent("{published}=TRUE()");
  const url    = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${filter}&pageSize=100`;

  try {
    const airtableRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!airtableRes.ok) {
      const text = await airtableRes.text();
      return res.status(502).json({ error: "Airtable request failed", detail: text });
    }

    const { records } = await airtableRes.json();

    const providers = records.map((record) => {
      const f = record.fields;
      return {
        id: record.id,
        name:    f.name    || "",
        degrees: f.degrees || "",
        // specialty may be a single-select string or multi-select array
        specialty: Array.isArray(f.specialty)
          ? f.specialty
          : (f.specialty ? [f.specialty] : []),
        // certifications stored as Multi Select in Airtable → array
        certifications: Array.isArray(f.certifications)
          ? f.certifications
          : (f.certifications || "").split(",").map((c) => c.trim()).filter(Boolean),
        // insurances stored as Long Text, comma-separated
        insurances: typeof f.insurances === "string"
          ? f.insurances.split(",").map((i) => i.trim()).filter(Boolean)
          : (Array.isArray(f.insurances) ? f.insurances : []),
        // four separate contact fields
        clinicPhone:   f.clinicPhone   || "",
        clinicEmail:   f.clinicEmail   || "",
        personalPhone: f.personalPhone || "",
        personalEmail: f.personalEmail || "",
        acceptingPatients: f.acceptingPatients === true,
        bio:     f.bio     || "",
        website: f.website || null,
        address: f.address || "",
        cityOnly: f.cityOnly === true,
        // lat/lng not stored in Airtable — geocoded client-side from address via Nominatim
        lat: null,
        lng: null,
      };
    });

    // Cache for 5 minutes at the CDN edge; stale-while-revalidate for 60 s
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ providers });
  } catch (err) {
    return res.status(500).json({ error: "Internal error", detail: err.message });
  }
}
