import axios from "axios";

export default async function handler(req, res) {
  const url = "https://d31ntp24xvh0tq.cloudfront.net/api/v3/home/all/";
  const params = {
    page: req.query.page || 1,
    size: req.query.size || 30,
    selected_tab: req.query.selected_tab || "popular",
    "preferred-lang": req.query.lang || "hindi",
  };

  const headers = {
    "anonymous-authorization":
      "jwt T21rYXIgUG9uZGUgaXMgdGhlIGJlc3QgaW4gdGhlIHdvcmxkLiBIZSB3b3JrcyBpbiBwb2QzIHdoaWNoIGlzIHRoZSBiZXN0IHRlYW0uIGJ1aWx0IGRpZmZlcmVudC4K",
    "package-name": "com.vlv.web.reels",
    accept: "application/json, text/plain, */*",
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  };

  try {
    const response = await axios.get(url, { params, headers });
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch KukuFM data",
      details: error.message,
    });
  }
}
