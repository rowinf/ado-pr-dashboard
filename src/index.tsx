import { Hono } from "hono";
import type { FC, PropsWithChildren } from "hono/jsx";
import { Database } from "bun:sqlite";
import { serveStatic } from "hono/bun";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import PullRequestData from "../data/raw.json";
import PullRequests from "./PullRequests.tsx";

dayjs.extend(relativeTime);
const db = new Database("hono-htmx.sqlite3");

const file = Bun.file("data/raw.json");
const json: typeof PullRequestData = await file.json();

const app = new Hono();

const selectPullRequests = db.query(`
    SELECT
      status,
     	pullRequestId,
     	title,
      createdBy_uniqueName,
     	datetime(creationDate, 'localtime') as creationDate,
     	datetime(closedDate, 'localtime') as closedDate,
     	(SELECT substr(timediff(closedDate, creationDate), 10, 2)) AS daysPassed,
     	(SELECT substr(timediff(closedDate, creationDate), 13, 2)) AS hoursPassed,
     	(SELECT substr(timediff(closedDate, creationDate), 16, 2)) AS minutesPassed,
     	calculated_businessDuration
    FROM pull_requests
    LIMIT $count;
`);

const selectReviews = db.query(`
  SELECT r.displayName, cr.pullRequestId, pr.title, pr.repository_name, COUNT(r.displayName) as reviews
  FROM reviewers as r
	JOIN code_reviews as cr ON r.id = cr.reviewerId
	JOIN pull_requests as pr ON cr.pullRequestId = pr.pullRequestId
	GROUP BY r.displayName;
`);
app
  .use("/favicon.ico", serveStatic({ path: "./favicon.ico" }))
  .use("/static/missing.css", serveStatic({ path: "./node_modules/missing.css/dist/missing.css" }))
  .get("/", async (c) => {
    const json = selectPullRequests.all({ $count: 15 });
    return c.html(<PullRequests pullRequests={json} />);
  });

export default {
  port: 4000,
  fetch: app.fetch,
};
