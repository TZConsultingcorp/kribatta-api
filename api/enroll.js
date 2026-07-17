export default async function handler(req, res) {
  
  res.setHeader("Access-Control-Allow-Origin", "https://www.supratraveltours.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { name, account } = req.body;

  const ccode = process.env.KRIBATTA_CCODE;

  if (!ccode) {
    return res.status(500).json({
      error: "Missing KRIBATTA_CCODE"
    });
  }

  if (!account) {
    return res.status(400).json({
      error: "Missing account"
    });
  }

  const session_key = crypto.randomUUID().replace(/-/g, "");

  const data = new URLSearchParams();

  data.append("ccode", ccode);
  data.append("name", name || "Customer");
  data.append("account", account);
  data.append("session_key", session_key);

  try {
    const kribattaResponse = await fetch(
      "https://kribatta.com/online_tools/enroll.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: data
      }
    );

    const result = await kribattaResponse.json();

    return res.status(200).json({
      result,
      account,
      session_key
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
