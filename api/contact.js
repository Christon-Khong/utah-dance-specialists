// Vercel serverless function — receives contact form submissions and
// stores them in the Airtable "Contact Messages" table.
// POST /api/contact
//
// Required Vercel env vars:
//   AIRTABLE_TOKEN    — Personal Access Token
//   AIRTABLE_BASE_ID  — Base ID, starts with "app..."
//
// You'll need a "Contact Messages" table in Airtable with fields:
//   name (Single line text), email (Email), subject (Single line text),
//   message (Long text), submittedDate (Date)
// Set up an Airtable Automation to email info@utahdancemedicine.com on new records.

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

  const name    = str(b.name, 200);
  const email   = str(b.email, 200);
  const message = str(b.message, 5000);

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const fields = {
    name,
    email,
    subject:       str(b.subject, 200),
    message,
    submittedDate: new Date().toISOString().split("T")[0],
  };

  Object.keys(fields).forEach((k) => { if (fields[k] === "") delete fields[k]; });

  const table = encodeURIComponent("Contact Messages");
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
      return res.status(502).json({ error: "Failed to submit message" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal error" });
  }
}
