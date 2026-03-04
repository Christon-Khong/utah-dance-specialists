// Vercel serverless function — receives onsite inquiry form data and
// creates a record in the Airtable Onsite Inquiries table.
// POST /api/onsite
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
  const name  = str(b.name, 200);
  const email = str(b.email, 200);

  if (!name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // Form state keys match Airtable field names directly
  const fields = {
    name,
    org:           str(b.org, 200),
    role:          str(b.role, 200),
    email,
    phone:         str(b.phone, 30),
    eventType:     str(b.eventType, 200),
    eventDate:     str(b.eventDate, 30),
    location:      str(b.location, 500),
    notes:         str(b.notes, 5000),
    submittedDate: new Date().toISOString().split("T")[0],
    status:        "New",
  };

  // dancers is a Number field in Airtable — validate bounds
  if (b.dancers) {
    const dancers = parseInt(b.dancers, 10);
    if (!isNaN(dancers) && dancers > 0 && dancers <= 10000) {
      fields.dancers = dancers;
    }
  }

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
      return res.status(502).json({ error: "Failed to submit inquiry" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal error" });
  }
}
