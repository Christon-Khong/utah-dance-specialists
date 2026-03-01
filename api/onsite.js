// Vercel serverless function — receives onsite inquiry form data and
// creates a record in the Airtable Onsite Inquiries table.
// POST /api/onsite
//
// Required Vercel env vars (same as api/providers.js):
//   AIRTABLE_TOKEN    — Personal Access Token
//   AIRTABLE_BASE_ID  — Base ID, starts with "app..."

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return res.status(500).json({ error: "Airtable env vars not configured" });
  }

  const b = req.body;

  // Form state keys match Airtable field names directly
  const fields = {
    name:          b.name      || "",
    org:           b.org       || "",
    role:          b.role      || "",
    email:         b.email     || "",
    phone:         b.phone     || "",
    eventType:     b.eventType || "",
    eventDate:     b.eventDate || "",
    location:      b.location  || "",
    notes:         b.notes     || "",
    submittedDate: new Date().toISOString().split("T")[0],
    status:        "New",
  };

  // dancers is a Number field in Airtable — only include if provided
  if (b.dancers) fields.dancers = Number(b.dancers);

  // Remove empty strings so Airtable doesn't reject optional fields
  Object.keys(fields).forEach((k) => {
    if (fields[k] === "") delete fields[k];
  });

  const table = encodeURIComponent("Onsite Inquiries");
  const url   = `https://api.airtable.com/v0/${baseId}/${table}`;

  try {
    const airtableRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!airtableRes.ok) {
      const text = await airtableRes.text();
      return res.status(502).json({ error: "Airtable request failed", detail: text });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal error", detail: err.message });
  }
}
