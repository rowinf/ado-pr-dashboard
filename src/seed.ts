import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { calculateWorkingHours } from "./workingHoursBetweenDates.ts";
import { db } from "./db.ts";

interface PullRequestData {
  pullRequestId: number;
  mergeStatus: string;
  status: string;
  closedDate: string;
  creationDate: string;
  title: string;
  createdBy: {
    displayName: string;
    uniqueName: string;
    imageUrl: string;
    name: string;
  };
  repository: { name: string };
  sourceRefName: string;
  reviewers: {
    id: string;
    displayName: string;
    imageUrl: string;
    uniqueName: string;
  }[];
}

db.run(`CREATE TABLE IF NOT EXISTS pull_requests(
    pullRequestId INTEGER PRIMARY KEY,
    mergeStatus TEXT,
    status TEXT,
    repository_name TEXT,
    closedDate TEXT,
    creationDate TEXT,
    title TEXT,
    createdBy_displayName TEXT,
    createdBy_uniqueName TEXT,
    createdBy_imageUrl TEXT,
    calculated_businessDuration NUMERIC,
    sourceRefName TEXT
);`);

db.run(`CREATE TABLE IF NOT EXISTS reviewers(
    id TEXT PRIMARY KEY,
    displayName TEXT,
    imageUrl TEXT,
    uniqueName TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS code_reviews(
  pullRequestId TEXT,
  reviewerId TEXT,
  FOREIGN KEY(pullRequestId) REFERENCES pull_requests(pullRequestId),
  FOREIGN KEY(reviewerId) REFERENCES reviewers(id)
  UNIQUE(pullRequestId, reviewerId)
)`);

let insertReviewers = db.prepare(`INSERT OR IGNORE INTO reviewers (
    id,
    displayName,
    imageUrl,
    uniqueName
) VALUES ($id, $displayName, $imageUrl, $uniqueName)`);

let insertCodeReviews = db.prepare(`INSERT OR IGNORE INTO code_reviews (
    pullRequestId,
    reviewerId
) VALUES ($pullRequestId, $reviewerId)`);

let insertPullRequests = db.prepare(`INSERT OR REPLACE INTO pull_requests (
    pullRequestId,
    mergeStatus,
    repository_name,
    closedDate,
    creationDate,
    title,
    createdBy_displayName,
    createdBy_uniqueName,
    createdBy_imageUrl,
    status,
    calculated_businessDuration,
    sourceRefName
) VALUES ($pullRequestId, $mergeStatus, $repository_name, $closedDate, $creationDate, $title, $createdBy_displayName, $createdBy_uniqueName, $createdBy_imageUrl, $status, $calculated_businessDuration, $sourceRefName);`);

const insertData = db.transaction((prs: PullRequestData[]) => {
  let count = 0;
  prs
    .map((pr) => ({
      $pullRequestId: pr.pullRequestId,
      $mergeStatus: pr.mergeStatus,
      $status: pr.status,
      $closedDate: pr.closedDate,
      $creationDate: pr.creationDate,
      $title: pr.title,
      $createdBy_displayName: pr.createdBy.displayName,
      $createdBy_uniqueName: pr.createdBy.uniqueName,
      $createdBy_imageUrl: pr.createdBy.imageUrl,
      $repository_name: pr.repository.name,
      $calculated_businessDuration: calculateWorkingHours(
        pr.creationDate,
        pr.closedDate
      ),
      $sourceRefName: pr.sourceRefName,
    }))
    .forEach((pr) => {
      insertPullRequests.run(pr);
      count += 1;
    });
  prs
    .flatMap((pr) => {
      return pr.reviewers;
    })
    .forEach((reviewer) => {
      insertReviewers.run({
        $id: reviewer.id,
        $displayName: reviewer.displayName,
        $imageUrl: reviewer.imageUrl,
        $uniqueName: reviewer.uniqueName,
      });
    });
  prs.forEach((pr) => {
    pr.reviewers.forEach((rev) => {
      insertCodeReviews.run({
        $pullRequestId: pr.pullRequestId,
        $reviewerId: rev.id,
      });
    });
  });
  return count;
});

let total = 0;
const files = await readdir(join(import.meta.dir, "../data"));
Promise.all(
  files.map(async (file) => {
    const json = await Bun.file(join(import.meta.dir, "../data", file)).json();
    const awaitable = insertData(json as PullRequestData);
    total += await awaitable;
    console.log(`progress: ${total} PRs processed`);
    return awaitable;
  })
).then(() => {
  console.log(`complete: ${total} pull requests were processed`);
});
