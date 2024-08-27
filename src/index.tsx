import { Hono } from "hono";
import type { FC, PropsWithChildren } from "hono/jsx";
import { Database } from "bun:sqlite";
import { serveStatic } from "hono/bun";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import PullRequestData from "../data/raw.json";
import PullRequests, { Top } from "./PullRequests.tsx";
import Reviews from "./Reviews.tsx";

dayjs.extend(relativeTime);
const db = new Database("hono-htmx.sqlite3");

const file = Bun.file("data/raw.json");
const json: typeof PullRequestData = await file.json();

const Home = () => (
  <Top>
    <h1>How to use this</h1>
    <p>
      This is a demo of using HTMX with Hono. It shows a list of pull requests
      from a SQLite database.
    </p>
    <p>
      <a href="/pullrequests">View Pull Requests</a>
    </p>
    <p>
      <a href="/reviews">View Reviews</a>
    </p>
  </Top>
);

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
    WHERE status='completed'
    ORDER BY calculated_businessDuration DESC
    LIMIT $count;
`);

const selectReviews = db.query(`
  SELECT r.displayName, cr.pullRequestId, pr.title, pr.repository_name, COUNT(r.displayName) as reviews
  FROM reviewers as r
	JOIN code_reviews as cr ON r.id = cr.reviewerId
	JOIN pull_requests as pr ON cr.pullRequestId = pr.pullRequestId
	GROUP BY r.displayName
	ORDER BY reviews DESC;
`);
app
  .use("/favicon.ico", serveStatic({ path: "./favicon.ico" }))
  .use(
    "/static/missing.css",
    serveStatic({ path: "./node_modules/missing.css/dist/missing.css" })
  )
  .use(
    "/static/htmx.js",
    serveStatic({ path: "./node_modules/htmx.org/dist/htmx.js" })
  )
  .get("/", (c) => {
    return c.html(<Home />);
  })
  .get("/pullrequests", async (c) => {
    const json = selectPullRequests.all({ $count: 15 });
    return c.html(<PullRequests pullRequests={json} />);
  })
  .get("/reviews", async (c) => {
    const json = selectReviews.all();
    return c.html(<Reviews reviews={json} />);
  });

export default {
  port: 4000,
  fetch: app.fetch,
};
