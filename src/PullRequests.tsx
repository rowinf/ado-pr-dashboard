import { FC, PropsWithChildren } from "hono/jsx";

export const Top: FC<PropsWithChildren<{ class?: string }>> = (props) => {
  return (
    <html>
      <head>
        <title>User Pull Requests</title>
        <link rel="stylesheet" href="/static/missing.css"></link>
      </head>
      <body>
        <main class={props.class}>{props.children}</main>
      </body>
    </html>
  );
};

const NestedValue: FC<{ label: string; value: unknown }> = ({ label, value }) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return <li>{label}: (empty)</li>;
    return (
      <li>
        {label}: <NestedValueList obj={value} />
      </li>
    );
  }
  if (typeof value === "object" && value !== null)
    return (
      <li>
        {label}: <NestedValueList obj={value} />
      </li>
    );
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

const PullRequests: FC<{ pullRequests: Array<unknown> }> = ({ pullRequests }) => (
  <Top>
    <h1>Pull Requests</h1>
    <div>
      <p>{pullRequests[0]?.createdBy_uniqueName}</p>
    </div>
    <div>
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Closed</th>
            <th>
              <abbr title="business hours taken to complete the PR">Hours</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {pullRequests.map((pr: unknown) => (
            <tr>
              <td>{pr.pullRequestId}</td>
              <td>{pr.title}</td>
              <td>{pr.status}</td>
              <td>{new Date(pr.creationDate).toDateString()}</td>
              <td>{new Date(pr.closedDate).toDateString()}</td>
              <td>{pr.calculated_businessDuration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Top>
);

export default PullRequests;
