import fetch from "node-fetch";

export default async function handler(req, res) {
  const BASE_URL = "https://tv.kukufm.com/api/v3/home/all/";

  // 🔑 JWT + headers
  const headers = {
    authorization:
      "jwt eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNDE2NDMxMDAsImV4cCI6MTc1OTQ4MzYwNn0.QvWOT8vOqs3LbAateMTR2qDNr2F-m3BmSKYZ6nthjHBOklFtz-4EDAVhoONj9mcg5tX3C0OgXbAFOHLPo7GDnQ",
    "package-name": "com.vlv.web.reels",
    accept: "application/json, text/plain, */*",
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
  };

  // 🍪 Cookies
  const cookies = {
    AWSALB:
      "yJeZDKibw/CnVaetLLYzhJf7QdZ9+hI9nDbmuwS6Vtl59QJ6IPsm3AL+J5yjMIvYfQk4bxkh0zN2Ey5tK+wh8v6j1CdkATuLLpM/iyo2TyH0Guyf5vUEbdzwWRQXkS2Kp9suanmmu6cU5qDZ0OypxMb7IiF6al6TuJLDM76PZTAF1r4hXUTAHOHWv7Z9KA==",
    AWSALBCORS:
      "yJeZDKibw/CnVaetLLYzhJf7QdZ9+hI9nDbmuwS6Vtl59QJ6IPsm3AL+J5yjMIvYfQk4bxkh0zN2Ey5tK+wh8v6j1CdkATuLLpM/iyo2TyH0Guyf5vUEbdzwWRQXkS2Kp9suanmmu6cU5qDZ0OypxMb7IiF6al6TuJLDM76PZTAF1r4hXUTAHOHWv7Z9KA==",
    AWSALBTG:
      "een7iLVSQ69R0Bcy9yvtKq/2eKo2nYnBy5+YzBMi1GNPvEh7UiUzqs5jxL4KwD4L/BfLTjLeaIOr8WdN3SyIuTRj/6K9Ciogs5kSRXUg0pL36vHDNK9pmakyHLVDHOGz4OTupnbS2Rjgy8qOgqv8LVKzHcwgj8uPt92s+rc2+vLmA8lxx+gEm3ZSpzDi43NnsobhqpsnSyu/Szy1mpXUxnj7P+4LoKY0Hf9AFKBXFDDukMtY2aHXT+mFFJwW5vDmDIRgaLxpZSVnxpwhaM1mh55QAwACEpvlGZtikT/3SAUzbbIuK2B5ZV7LjGnig3oQdTWAnZqoYSjv5oI4Lbv4MY8XmBk=",
    AWSALBTGCORS:
      "een7iLVSQ69R0Bcy9yvtKq/2eKo2nYnBy5+YzBMi1GNPvEh7UiUzqs5jxL4KwD4L/BfLTjLeaIOr8WdN3SyIuTRj/6K9Ciogs5kSRXUg0pL36vHDNK9pmakyHLVDHOGz4OTupnbS2Rjgy8qOgqv8LVKzHcwgj8uPt92s+rc2+vLmA8lxx+gEm3ZSpzDi43NnsobhqpsnSyu/Szy1mpXUxnj7P+4LoKY0Hf9AFKBXFDDukMtY2aHXT+mFFJwW5vDmDIRgaLxpZSVnxpwhaM1mh55QAwACEpvlGZtikT/3SAUzbbIuK2B5ZV7LjGnig3oQdTWAnZqoYSjv5oI4Lbv4MY8XmBk=",
    "CloudFront-Key-Pair-Id": "K2ZMC0VBPI9ZOX"
  };

  function cookieHeader(cookies) {
    return Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  // ✅ Extract query params safely from req.query
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
