import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import PullRequests, { Top } from "./PullRequests.tsx";
import Reviews from "./Reviews.tsx";
import { countPullRequests, getPullRequests } from "./PullRequestsQuery.ts";
import { getReviews } from "./ReviewsQuery.ts";

dayjs.extend(relativeTime);

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

app
  .use("/favicon.ico", serveStatic({ path: "./favicon.ico" }))
  .use("/static/style.css", serveStatic({ path: "./public/style.css" }))
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
    const perPage = 20.0;
    const query = c.req.query();
    const currentPage = Number(query.page ?? 1);
    const json = getPullRequests.all({
      $limit: 20,
      $status: query.status || "completed",
      $bump: query.mute_noise === "on" ? "%bump%" : "",
      $sourceRefName: query.mute_noise === "on" ? `%${query.tnumber}%` : "%%",
      $tnumber: query.tnumber ?? "",
      $offset: (currentPage - 1) * perPage,
    });
    const total = countPullRequests.get({});
    let pageCount = Math.ceil((1.0 * (total?.count ?? 0)) / perPage);
    const nextPage = currentPage < pageCount ? currentPage + 1 : 0;
    const prevPage = currentPage > 0 ? currentPage - 1 : 0;
    return c.html(
      <PullRequests
        pullRequests={json}
        nextPage={nextPage}
        prevPage={prevPage}
        currentPage={currentPage}
        pageCount={pageCount}
        query={query}
      />
    );
  })
  .get("/reviews", async (c) => {
    const json = getReviews.all({});
    return c.html(<Reviews reviews={json} />);
  });

export default {
  port: 4000,
  fetch: app.fetch,
};
