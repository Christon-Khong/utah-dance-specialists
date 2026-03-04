// Vercel serverless function — receives provider application form data and
// creates a record in the Airtable Providers table.
// POST /api/apply
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

  // Map form state keys → Airtable field names
  const fields = {
    name:              b.name            || "",
    degrees:           b.credentials     || "",
    practiceName:      b.practiceName    || "",
    website:           b.website         || "",
    clinicPhone:       b.clinicPhone     || "",
    clinicEmail:       b.clinicEmail     || "",
    personalPhone:     b.personalPhone   || "",
    personalEmail:     b.personalEmail   || "",
    adminEmail:        b.adminEmail      || "",
    adminPhone:        b.adminPhone      || "",
    address:           b.practiceAddress || "",
    cityOnly:          b.cityOnly === true,
    // certifications is already an array in form state → Airtable Multi Select
    certifications:    Array.isArray(b.certifications) ? b.certifications : [],
    certificationsOther: b.certificationsOther || "",
    // insurances is now an array → Airtable Multi Select
    insurances:        Array.isArray(b.insurances) ? b.insurances : [],
    insurancesOther:   b.insurancesOther  || "",
    // accepting: "yes" | "waitlist" | "no" → Airtable Checkbox
    acceptingPatients: b.accepting === "yes",
    bio:               b.bio             || "",
    // Airtable Single Select options are capitalized: Yes, No, Maybe
    onsiteInterest:    { yes: "Yes", no: "No", maybe: "Maybe" }[b.onsiteInterest] || "",
    // Background (private)
    isDancer:          b.isDancer === true,
    trainedInDance:    b.trainedInDance === true,
    wasReferred:       b.wasReferred === true,
    referredBy:        b.referredBy || "",
    applicationDate:   new Date().toISOString().split("T")[0],
    published:         false,
  };

  // Remove empty strings so Airtable doesn't reject optional fields
  Object.keys(fields).forEach((k) => {
    if (fields[k] === "" || fields[k] === null) delete fields[k];
  });

  const table = encodeURIComponent("Providers");
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
