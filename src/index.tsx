import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { serveStatic } from "hono/bun";

import type PullRequestData from "../t979140.json";

const app = new Hono();

app.use("/favicon.ico*", serveStatic({ root: "./favicon.ico" }));
app.use("/missing.css/*", serveStatic({ path: "../node_modules/missing.css/" }));

const PullRequests: FC<{ pullRequests: typeof PullRequestData }> = ({
  pullRequests,
}) => (
  <div>
    {pullRequests.map((pr) => (
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
              <td>Closed</td>
              <td>{new Date(pr.closedDate).toISOString()}</td>
            </tr>
          </tbody>
        </table>
        <ul>
          {Object.entries(pr).map(([key, value]) => {
            if (
              value == null ||
              typeof value == "string" ||
              typeof value == "number"
            ) {
              return (
                <li>
                  {key}: {value}
                </li>
              );
            } else if (Array.isArray(value)) {
              return <li>{key}: [Array]</li>;
            } else {
              <li>
                {key}: {Object}
              </li>;
            }
          })}
        </ul>
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
  const file = Bun.file("./t979140.json");
  const json = await file.json();
  return c.html(<Top pullRequests={json} />);
});

app.get("/prs", async (c) => {
  const file = Bun.file("./t979140.json");
  const json = await file.json();
  return c.html(<PullRequests pullRequests={json} />);
});

export default {
  port: 4000,
  fetch: app.fetch,
};
