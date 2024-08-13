import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { serveStatic } from "hono/bun";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import type PullRequestData from "../data/raw.json";
import { getBusinessHours } from "./utils.ts";

const app = new Hono();

dayjs.extend(relativeTime);

app.use("/favicon.ico*", serveStatic({ path: "../favicon.ico" }));
app.use(
  "/static/missing.css",
  serveStatic({ path: "./node_modules/missing.css/dist/missing.css" })
);

const NestedValue: FC<{ label: string; value: unknown }> = ({
  label,
  value,
}) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return <li>{label}: (empty)</li>
    return <li>{label}: <NestedValueList obj={value} /></li>;
  }
  if (typeof value === "object" && value !== null)
    return <li>{label}: <NestedValueList obj={value} /></li>;
  return (
    <li>
      {label}: {String(value)}
    </li>
  );
};

const NestedValueList: FC<{ obj: object }> = ({ obj }) => (
  <ul>
    {Object.entries(obj).map(([key, value]) => {
      return <NestedValue label={key} value={value} />;
    })}
  </ul>
);

const PullRequests: FC<{ pullRequests: typeof PullRequestData }> = ({
  pullRequests,
}) => (
  <div>
    {pullRequests.slice(0, 15).map((pr) => (
      <details>
        <summary>
          {pr.pullRequestId} {pr.title}
        </summary>
        <table>
          <tbody>
            <tr>
              <td>Status</td>
              <td>{pr.status}</td>
            </tr>
            <tr>
              <td>Created</td>
              <td>{new Date(pr.creationDate).toISOString()}</td>
            </tr>
            <tr>
              <td>Closed Date</td>
              <td>{new Date(pr.closedDate).toISOString()}</td>
            </tr>
            <tr>
              <td>Business Hours</td>
              <td>{getBusinessHours(new Date(pr.creationDate), new Date(pr.closedDate))}</td>
            </tr>
          </tbody>
        </table>
        <NestedValueList obj={pr} />
        <ul>{pr.completionOptions}</ul>
      </details>
    ))}
  </div>
);

const Top: FC<{ pullRequests: typeof PullRequestData }> = (props) => {
  return (
    <html>
      <head>
        <title>User Pull Requests</title>
        <link rel="stylesheet" href="/static/missing.css"></link>
      </head>
      <body>
        <main>
          <h1>Pull Requests</h1>
          <PullRequests pullRequests={props.pullRequests} />
        </main>
      </body>
    </html>
  );
};

app.get("/", async (c) => {
  const file = Bun.file("data/raw.json");
  const json = await file.json();
  return c.html(<Top pullRequests={json} />);
});

app.get("/prs", async (c) => {
  const file = Bun.file("data/raw.json");
  const json: typeof PullRequestData = await file.json();
  return c.html(<PullRequests pullRequests={json} />);
});

export default {
  port: 4000,
  fetch: app.fetch,
};
