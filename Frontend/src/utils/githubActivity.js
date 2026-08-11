const GITHUB_API = "https://api.github.com";
const GITHUB_WEB = "https://github.com";

/** Extracts a plain GitHub username from raw input (URL, @handle, or bare name). */
export const extractUsername = (input) => {
  const raw = String(input ?? "").trim().replace(/^@+/, "");
  const match = raw.match(/github\.com\/([^/?#]+)/);
  const candidate = match ? match[1] : raw;
  return candidate.split(/[/?#]/)[0].trim();
};

const contributeDeltaForEvent = (event) => {
  switch (event.type) {
    case "PushEvent": {
      const commits = event.payload?.commits;
      return Array.isArray(commits) && commits.length > 0 ? commits.length : 1;
    }
    case "PullRequestEvent": {
      const action = event.payload?.action;
      if (action === "opened") return 1;
      if (action === "closed" && event.payload?.pull_request?.merged) return 1;
      return 0;
    }
    case "PullRequestReviewEvent":
      return 1;
    case "IssuesEvent":
      return event.payload?.action === "opened" ? 1 : 0;
    default:
      return 0;
  }
};

/**
 * Best-effort fallback (used on localhost dev, where GitHub's contributions
 * page is CORS-blocked): aggregates public events via the REST API.
 * Only covers roughly the last ~90 days, so stats are approximate.
 */
const fetchGitHubEvents = async (username, pages = 3) => {
  const perPage = 100;
  const agg = {};
  let newest = null;
  let fetchedAny = false;

  for (let page = 1; page <= pages; page += 1) {
    const url = `${GITHUB_API}/users/${encodeURIComponent(username)}/events/public?per_page=${perPage}&page=${page}`;
    let res;
    try {
      res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    } catch {
      if (!fetchedAny) {
        throw new Error("Network error while fetching GitHub activity.");
      }
      break;
    }

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`GitHub user "@${username}" was not found.`);
      }
      if (res.status === 403 || res.status === 429) {
        throw new Error("GitHub API rate limit reached. Try again later.");
      }
      throw new Error(`GitHub API error (HTTP ${res.status}).`);
    }

    const events = await res.json();
    if (!Array.isArray(events) || events.length === 0) break;
    fetchedAny = true;

    for (const event of events) {
      const date = event.created_at ? event.created_at.slice(0, 10) : null;
      if (!date) continue;
      const delta = contributeDeltaForEvent(event);
      if (delta > 0) agg[date] = (agg[date] || 0) + delta;
      if (!newest || date > newest) newest = date;
    }
  }

  return { map: agg, newest };
};

/** Parses GitHub's own yearly contributions grid out of its HTML page. */
const parseContributionsHtml = (html) => {
  const days = {};
  const cellRe = /<td[^>]*?class="[^"]*\bContributionCalendar-day\b[^"]*"[^>]*>/g;
  let match;
  while ((match = cellRe.exec(html))) {
    const tag = match[0];
    const date = /data-date="([0-9-]+)"/.exec(tag)?.[1];
    const level = /data-level="([0-4])"/.exec(tag)?.[1];
    if (date && level !== undefined) days[date] = Number(level);
  }
  const totalMatch = /([\d,]+)\s+contributions?\s+in the last year/i.exec(html);
  return {
    days,
    yearTotal: totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : null,
  };
};

/**
 * Primary source: fetches GitHub's own contributions page
 * (`/users/{user}/contributions`) and returns the exact levels GitHub shows.
 * Works from the extension page because `https://github.com/*` is granted by
 * host_permissions (CORS is bypassed for extension origins). Falls back to the
 * public events API when the page can't be fetched (e.g. localhost dev).
 */
export const fetchGitHubContributions = async (inputUsername) => {
  const username = extractUsername(inputUsername);
  if (!username) {
    throw new Error("Enter a GitHub username or profile link.");
  }

  try {
    const url = `${GITHUB_WEB}/users/${encodeURIComponent(username)}/contributions`;
    const res = await fetch(url, { headers: { Accept: "text/html" } });
    if (res.status === 404) {
      throw new Error(`GitHub user "@${username}" was not found.`);
    }
    if (!res.ok) {
      throw new Error(`GitHub error (HTTP ${res.status}).`);
    }
    const parsed = parseContributionsHtml(await res.text());
    if (!parsed.days || Object.keys(parsed.days).length === 0) {
      throw new Error("Could not read the contribution graph for this user.");
    }
    return {
      days: parsed.days,
      yearTotal: parsed.yearTotal,
      newest: Object.keys(parsed.days).sort().pop() ?? null,
      source: "github",
    };
  } catch (err) {
    const fallback = await fetchGitHubEvents(username);
    return {
      days: fallback.map,
      yearTotal: null,
      newest: fallback.newest,
      source: "events",
    };
  }
};
