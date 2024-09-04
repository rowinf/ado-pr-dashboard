import { db } from "./db.ts";

export interface PullRequestsQuery {
  status: string;
  pullRequestId: number;
  title: string;
  createdBy_uniqueName: string;
  creationDate: string;
  closedDate: string;
  branch: string;
  repository_name: string;
  reviewsCount: number;
  calculated_businessDuration: number;
  count: number;
}

const whereFragment = `
(status = $status) AND (branch LIKE $branch) AND NOT (title LIKE $bump)
`;

export const getPullRequests = db.query<
  PullRequestsQuery,
  {
    $limit: number;
    $offset: number;
    $status: string;
    $bump: string;
    $branch: string;
  }
>(`
  SELECT
    status,
    pr.pullRequestId,
    title,
    createdBy_uniqueName,
    datetime(creationDate, 'localtime') as creationDate,
    datetime(closedDate, 'localtime') as closedDate,
    (SELECT substr(timediff(closedDate, creationDate), 10, 2)) AS daysPassed,
    (SELECT substr(timediff(closedDate, creationDate), 13, 2)) AS hoursPassed,
    (SELECT substr(timediff(closedDate, creationDate), 16, 2)) AS minutesPassed,
    calculated_businessDuration,
    COUNT(cr.reviewerId) as reviewsCount,
    repository_name,
    substr(sourceRefName, 12) as branch,
    COUNT(*) as count
  FROM pull_requests as pr
  JOIN code_reviews as cr ON pr.pullRequestId = cr.pullRequestId
  WHERE (status = $status) AND (branch LIKE $branch) AND NOT (title LIKE $bump)
  GROUP BY pr.pullRequestId
  ORDER BY calculated_businessDuration DESC
  LIMIT $limit
  OFFSET $offset;
`);

interface CountPullRequests {
  count: number;
}

export const countPullRequests = db.query<
  CountPullRequests,
  {
    $status: string;
    $bump: string;
    $branch: string;
  }
>(`
  SELECT COUNT(*) as count, substr(sourceRefName, 12) as branch
  FROM pull_requests
  WHERE (status = $status) AND (branch LIKE $branch) AND NOT (title LIKE $bump);
`);
