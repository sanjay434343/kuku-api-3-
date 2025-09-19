// app/api/show/route.js
import { NextResponse } from "next/server";

const BASE_URL = "https://tv.kukufm.com/api/v3/home/all/";

const headers = {
  authorization:
    "jwt eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNDE2NDMxMDAsImV4cCI6MTc1OTQ4MzYwNn0.QvWOT8vOqs3LbAateMTR2qDNr2F-m3BmSKYZ6nthjHBOklFtz-4EDAVhoONj9mcg5tX3C0OgXbAFOHLPo7GDnQ",
  "package-name": "com.vlv.web.reels",
  accept: "application/json, text/plain, */*",
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
};

const cookies = {
  AWSALB: "...",
  AWSALBCORS: "...",
  AWSALBTG: "...",
  AWSALBTGCORS: "...",
  "CloudFront-Key-Pair-Id": "K2ZMC0VBPI9ZOX",
};

function cookieHeader(cookies) {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") || 1;
  const size = searchParams.get("size") || 50;
  const sortField = searchParams.get("sort") || "title";
  const sortOrder = searchParams.get("order") || "asc";
  const filter = searchParams.get("filter")?.toLowerCase() || "";
  const query = searchParams.get("q")?.toLowerCase() || "";
  const limit = parseInt(searchParams.get("limit") || 0);
  const offset = parseInt(searchParams.get("offset") || 0);

  try {
    const apiRes = await fetch(
      `${BASE_URL}?page=${page}&size=${size}&selected_tab=popular`,
      {
        headers: {
          ...headers,
          cookie: cookieHeader(cookies),
        },
        cache: "no-store",
      }
    );

    if (!apiRes.ok) {
      return NextResponse.json(
        { error: `API error: ${apiRes.status}` },
        { status: apiRes.status }
      );
    }

    const data = await apiRes.json();

    let shows = [];
    for (const block of data.items || []) {
      for (const entry of block.items || []) {
        if (entry.show) shows.push(entry.show);
      }
    }

    if (filter) {
      shows = shows.filter(
        (s) =>
          s.title?.toLowerCase().includes(filter) ||
          s.description?.toLowerCase().includes(filter)
      );
    }
    if (query) {
      shows = shows.filter(
        (s) =>
          s.title?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      );
    }

    shows.sort((a, b) => {
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const total = shows.length;
    const paged = shows.slice(offset, limit ? offset + limit : undefined);

    return NextResponse.json({
      total,
      count: paged.length,
      shows: paged.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        episodes: s.n_episodes,
        listens: s.n_listens,
        image: s.image,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
