const GITHUB_API = "https://api.github.com";

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
 * Fetches recent public GitHub activity for a user and aggregates it into a
 * `{ "YYYY-MM-DD": count }` map. Uses the public events REST API (no auth,
 * CORS-friendly) which returns roughly the last ~90 days for active users.
 */
export const fetchGitHubContributions = async (username, pages = 3) => {
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
