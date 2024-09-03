import { FC, PropsWithChildren } from "hono/jsx";
import { PullRequestsQuery } from "./PullRequestsQuery.ts";

export const Top: FC<PropsWithChildren<{ class?: string }>> = (props) => {
  return (
    <html>
      <head>
        <title>User Pull Requests</title>
        <link rel="stylesheet" href="/static/missing.css"></link>
        <link rel="stylesheet" href="/static/style.css"></link>
        <script src="/static/htmx.js"></script>
      </head>
      <body class="sidebar-layout" hx-boost="true">
        <header>
          <div class="<h2>">PR Dashboard</div>
          <ul role="list">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/pullrequests">Pull Requests</a>
            </li>
            <li>
              <a href="/reviews">Reviews</a>
            </li>
          </ul>
        </header>
        <main class="padding-block-end">{props.children}</main>
      </body>
    </html>
  );
};

const PullRequests: FC<{
  pullRequests: PullRequestsQuery[];
  query: Record<string, string>;
  nextPage: number;
  prevPage: number;
  currentPage: number;
  pageCount: number;
}> = ({ pullRequests, query, nextPage, prevPage, currentPage, pageCount }) => (
  <Top>
    <h1>Pull Requests</h1>
    <div>
      <p>{pullRequests[0]?.createdBy_uniqueName}</p>
    </div>
    <div>
      <form
        method="GET"
        action="/pullrequests"
        hx-get="/pullrequests"
        hx-trigger="submit"
        hx-select="#table"
        hx-target="#table"
        hx-swap="outerHTML"
      >
        <section class="tool-bar margin-block">
          <label>
            T-Number
            <input
              type="text"
              name="tnumber"
              placeholder="t-number"
              value={query["tnumber"]}
            />
          </label>
          <label>
            Mute Noise PRs
            <input
              type="checkbox"
              id="mute_noise"
              name="mute_noise"
              checked={query["mute_noise"] === "on"}
            />
          </label>
          <label id="status">
            Status
            <select type="checkbox" name="status">
              <option value="">-------- Status --------</option>
              <option value="active" selected={query.status === "active"}>
                Active
              </option>
              <option value="completed" selected={query.status === "completed"}>
                Completed
              </option>
            </select>
          </label>
          <button type="submit">Filter</button>
        </section>
      </form>
      <div id="table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Closed</th>
              <th>
                <abbr title="business hours taken to complete the PR">
                  Hours
                </abbr>
              </th>
              <th>Reviews</th>
              <th>repository_name</th>
              <th>branch</th>
            </tr>
          </thead>
          <tbody>
            {pullRequests.map((pr) => (
              <tr>
                <td>
                  {pr.status !== "active" ? "✅" : ""} {pr.title}
                  <sup>
                    <abbr title={String(pr.pullRequestId)}>#</abbr>
                  </sup>
                </td>
                <td>{new Date(pr.closedDate).toDateString()}</td>
                <td>{pr.calculated_businessDuration}</td>
                <td>{pr.reviewsCount}</td>
                <td>{pr.repository_name}</td>
                <td>{pr.branch}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div class="toolbar">
          {prevPage > 1 ? (
            <button
              hx-get={`/pullrequests?page=${1}`}
              hx-trigger="click"
              hx-select="#table"
              hx-target="#table"
              hx-swap="outerHTML"
              type="button"
              disabled={currentPage == 1}
            >
              first
            </button>
          ) : null}

          {prevPage > 0 ? (
            <button
              hx-get={`/pullrequests?page=${prevPage}`}
              hx-trigger="click"
              hx-select="#table"
              hx-target="#table"
              hx-swap="outerHTML"
              type="button"
              disabled={!prevPage}
            >
              {prevPage}
            </button>
          ) : null}

          <button type="button" disabled>
            {currentPage}
          </button>
          {nextPage > currentPage ? (
            <button
              hx-get={`/pullrequests?page=${nextPage}`}
              hx-trigger="click"
              hx-select="#table"
              hx-target="#table"
              hx-swap="outerHTML"
              type="button"
              disabled={!nextPage}
            >
              {nextPage}
            </button>
          ) : null}
          <button
            hx-get={`/pullrequests?page=${pageCount}`}
            hx-trigger="click"
            hx-select="#table"
            hx-target="#table"
            hx-swap="outerHTML"
            type="button"
            disabled={currentPage == pageCount}
          >
            last
          </button>
        </div>
      </div>
    </div>
  </Top>
);

export default PullRequests;
