import { $ } from "bun";
import { Database } from "bun:sqlite";

import PullRequestData from "../data/active.json";
import { calculateWorkingHours } from "./workingHoursBetweenDates.ts";

/**
 * STEP ZERO:\n
 * Get the azure cli with devops extension and run this in the command line:\n
 * $ `az login --allow-no-subscriptions`\n
 */
$.env({ AZURE_DEVOPS_EXT_PAT: Bun.env.AZURE_DEVOPS_EXT_PAT });

const db = new Database("hono-htmx.sqlite3");
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

let insertCodeReviews = db.prepare(`INSERT INTO code_reviews (
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

const insertData = db.transaction((prs: typeof PullRequestData) => {
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

const tnumbers = ["t979140"];

tnumbers.forEach(async (tnumber) => {
  console.log("fetching active PRs");
  let active = [];
  let completed = [];
  // try {
  //   active = await $`az repos pr list --creator ${tnumber}`.json();
  // } catch (e) {
  //   console.error("couldnt fetch active PRs", e);
  // }
  // console.log("fetching completed PRs");
  try {
    completed =
      await $`az repos pr list --status {completed,active} --creator ${tnumber}`.json();
  } catch (e) {
    console.error("couldnt fetch completed PRs", e);
  }

  const pullRequests: typeof PullRequestData = [...active, ...completed];
  const count = await insertData(pullRequests);
  console.log(`${count} pull requests were processed`);
});
