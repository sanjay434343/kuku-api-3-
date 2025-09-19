// api/index.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const BASE_URL = "https://tv.kukufm.com/api/v3/home/all/";

  const headers = {
    authorization:
      "jwt eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNDE2NDMxMDAsImV4cCI6MTc1OTQ4MzYwNn0.QvWOT8vOqs3LbAateMTR2qDNr2F-m3BmSKYZ6nthjHBOklFtz-4EDAVhoONj9mcg5tX3C0OgXbAFOHLPo7GDnQ",
    "package-name": "com.vlv.web.reels",
    accept: "application/json, text/plain, */*",
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
  };

  const cookies = {
    AWSALB: "yJeZDKibw...",
    AWSALBCORS: "yJeZDKibw...",
    AWSALBTG: "een7iLVSQ...",
    AWSALBTGCORS: "een7iLVSQ...",
    "CloudFront-Key-Pair-Id": "K2ZMC0VBPI9ZOX"
  };

  function cookieHeader(cookies) {
    return Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  // ✅ Query params
  const {
    page = 1,
    size = 50,
    sort = "title",
    order = "asc",
    filter = "",
    q = "",
    limit = 0,
    offset = 0
  } = req.query;

  try {
    const apiRes = await fetch(
      `${BASE_URL}?page=${page}&size=${size}&selected_tab=popular`,
      {
        headers: {
          ...headers,
          cookie: cookieHeader(cookies)
        }
      }
    );

    if (!apiRes.ok) {
      return res
        .status(apiRes.status)
        .json({ error: `API error: ${apiRes.status}` });
    }

    const data = await apiRes.json();

    // Flatten shows
    let shows = [];
    for (const block of data.items || []) {
      for (const entry of block.items || []) {
        if (entry.show) shows.push(entry.show);
      }
    }

    // Filtering
    const f = filter.toLowerCase();
    const ql = q.toLowerCase();

    if (f) {
      shows = shows.filter(
        (s) =>
          s.title?.toLowerCase().includes(f) ||
          s.description?.toLowerCase().includes(f)
      );
    }
    if (ql) {
      shows = shows.filter(
        (s) =>
          s.title?.toLowerCase().includes(ql) ||
          s.description?.toLowerCase().includes(ql)
      );
    }

    // Sorting
    shows.sort((a, b) => {
      const valA = (a[sort] || "").toString().toLowerCase();
      const valB = (b[sort] || "").toString().toLowerCase();
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });

    // Pagination
    const total = shows.length;
    const off = parseInt(offset);
    const lim = parseInt(limit);
    const paged = shows.slice(off, lim ? off + lim : undefined);

    return res.status(200).json({
      total,
      count: paged.length,
      shows: paged.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        episodes: s.n_episodes,
        listens: s.n_listens,
        image: s.image
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
