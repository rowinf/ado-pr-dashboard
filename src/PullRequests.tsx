import { FC, PropsWithChildren } from "hono/jsx";

export const Top: FC<PropsWithChildren<{ class?: string }>> = (props) => {
  return (
    <html>
      <head>
        <title>User Pull Requests</title>
        <link rel="stylesheet" href="/static/missing.css"></link>
        <link rel="stylesheet" href="/static/style.css"></link>
      </head>
      <body class="sidebar-layout">
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
        <main class="padding-bloc-start">{props.children}</main>
      </body>
    </html>
  );
};

const PullRequests: FC<{
  pullRequests: Array<unknown>;
  query: Map<string, string>;
}> = ({ pullRequests, query }) => (
  <Top>
    <h1>Pull Requests</h1>
    <div>
      <p>{pullRequests[0]?.createdBy_uniqueName}</p>
    </div>
    <div>
      <form method="GET" action="/pullrequests">
        <section class="tool-bar margin-block">
          <label>
            T-Number
            <input
              type="text"
              name="tnumber"
              placeholder="t-number"
              value={query.get("tnumber")}
            />
          </label>
          <label>
            Mute Noise PRs
            <input
              type="checkbox"
              id="mute_noise"
              name="mute_noise"
              checked={query.get("mute_noise") === "on"}
            />
          </label>
          <label id="status">
            Status
            <select type="checkbox" name="status">
              <option value="">-------- Status --------</option>
              <option
                value="active"
                selected={query.get("status") === "active"}
              >
                Active
              </option>
              <option
                value="completed"
                selected={query.get("status") === "completed"}
              >
                Completed
              </option>
            </select>
          </label>
          <button type="submit">Filter</button>
        </section>
      </form>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Closed</th>
            <th>
              <abbr title="business hours taken to complete the PR">Hours</abbr>
            </th>
            <th>Reviews</th>
          </tr>
        </thead>
        <tbody>
          {pullRequests.map((pr: unknown) => (
            <tr>
              <td>
                {pr.title}
                <sup>
                  <abbr title={pr.pullRequestId}>#</abbr>
                </sup>
              </td>
              <td>{pr.status}</td>
              <td>{new Date(pr.creationDate).toDateString()}</td>
              <td>{new Date(pr.closedDate).toDateString()}</td>
              <td>{pr.calculated_businessDuration}</td>
              <td>{pr.reviewsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Top>
);

export default PullRequests;
