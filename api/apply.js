// Vercel serverless function — receives provider application form data and
// creates a record in the Airtable Providers table.
// POST /api/apply
//
// Required Vercel env vars (same as api/providers.js):
//   AIRTABLE_TOKEN    — Personal Access Token
//   AIRTABLE_BASE_ID  — Base ID, starts with "app..."

function str(val, max = 500) {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, max);
}

function isEmail(val) {
  return typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const b = req.body;
  if (!b || typeof b !== "object") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  // --- Validate required fields ---
  const name = str(b.name, 200);
  const credentials = str(b.credentials, 200);
  const adminEmail = str(b.adminEmail, 200);
  const adminPhone = str(b.adminPhone, 30);
  const practiceAddress = str(b.practiceAddress, 500);
  const bio = str(b.bio, 5000);

  if (!name || !credentials || !adminEmail || !adminPhone || !practiceAddress || !bio) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!isEmail(adminEmail)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // --- Validate optional fields ---
  const website = str(b.website, 500);
  if (website && !/^https?:\/\//i.test(website)) {
    return res.status(400).json({ error: "Website must start with http:// or https://" });
  }

  const accepting = str(b.accepting, 20);
  if (accepting && !["yes", "waitlist", "no"].includes(accepting)) {
    return res.status(400).json({ error: "Invalid accepting value" });
  }

  const onsiteInterest = str(b.onsiteInterest, 10);
  if (onsiteInterest && !["yes", "no", "maybe"].includes(onsiteInterest)) {
    return res.status(400).json({ error: "Invalid onsite interest value" });
  }

  const certifications = Array.isArray(b.certifications)
    ? b.certifications.filter((c) => typeof c === "string").slice(0, 20).map((c) => c.slice(0, 200))
    : [];

  const insurances = Array.isArray(b.insurances)
    ? b.insurances.filter((i) => typeof i === "string").slice(0, 50).map((i) => i.slice(0, 200))
    : [];

  // Map form state keys → Airtable field names
  const fields = {
    name,
    degrees:           credentials,
    practiceName:      str(b.practiceName, 200),
    website,
    clinicPhone:       str(b.clinicPhone, 30),
    clinicEmail:       str(b.clinicEmail, 200),
    personalPhone:     str(b.personalPhone, 30),
    personalEmail:     str(b.personalEmail, 200),
    adminEmail,
    adminPhone,
    address:           practiceAddress,
    cityOnly:          b.cityOnly === true,
    certifications,
    certificationsOther: str(b.certificationsOther, 1000),
    insurances,
    insurancesOther:   str(b.insurancesOther, 1000),
    acceptingPatients: accepting === "yes",
    bio,
    // Airtable Single Select options are capitalized: Yes, No, Maybe
    onsiteInterest:    { yes: "Yes", no: "No", maybe: "Maybe" }[onsiteInterest] || "",
    // Background (private)
    isDancer:          b.isDancer === true,
    trainedInDance:    b.trainedInDance === true,
    wasReferred:       b.wasReferred === true,
    referredBy:        str(b.referredBy, 200),
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
      return res.status(502).json({ error: "Failed to submit application" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal error" });
  }
}
