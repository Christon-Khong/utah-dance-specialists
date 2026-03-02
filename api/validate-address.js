// Vercel serverless function — proxies the US Census Bureau Geocoder so the
// browser avoids CORS restrictions.
// GET /api/validate-address?address=123+Main+St%2C+Salt+Lake+City%2C+UT
//
// Returns: { valid: true | false | null }
//   true  — address matched in Census/USPS database
//   false — no match found (bad or fake address)
//   null  — upstream error, treat as unverified (don't block submission)

export default async function handler(req, res) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ valid: false });
  }

  const url =
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=" +
    encodeURIComponent(address) +
    "&benchmark=Public_AR_Current&format=json";

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    const valid = Array.isArray(data?.result?.addressMatches) && data.result.addressMatches.length > 0;
    return res.status(200).json({ valid });
  } catch {
    return res.status(200).json({ valid: null });
  }
}
