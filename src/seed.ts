import { $ } from "bun";
import { Database } from "bun:sqlite";

import PullRequestData from "../data/raw.json";

/**
 * STEP ZERO:\n
 * Get the azure cli with devops extension and run this in the command line:\n
 * $ `az login --allow-no-subscriptions`\n
 */

$.env({ AZURE_DEVOPS_EXT_PAT: Bun.env.AZURE_DEVOPS_EXT_PAT });


const file = Bun.file("raw.json");
let pullRequests: typeof PullRequestData = await file.json();

// const tnumber = "t979140";
// let prs = await $`az repos pr list --status completed --creator ${tnumber} > raw.json`;
// console.log(prs[0])

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
    createdBy_imageUrl TEXT
);`);

db.run(`CREATE TABLE IF NOT EXISTS reviewers(
    id TEXT PRIMARY KEY,
    displayName TEXT,
    imageUrl TEXT,
    uniqueName TEXT
)`);

let insertReviewers = db.prepare(`INSERT INTO reviewers (
    id,
    displayName,
    imageUrl,
    uniqueName
) VALUES ($id, $displayName, $imageUrl, $uniqueName)`);

db.run(`CREATE TABLE IF NOT EXISTS code_reviews(
    pullRequestId TEXT,
    reviewerId TEXT,
    FOREIGN KEY(pullRequestId) REFERENCES pull_requests(pullRequestId),
    FOREIGN KEY(reviewerId) REFERENCES reviewers(id)
)`);

let insertCodeReviews = db.prepare(`INSERT INTO code_reviews (
    pullRequestId,
    reviewerId
) VALUES ($pullRequestId, $reviewerId)`);

let insertPullRequests = db.prepare(`INSERT INTO pull_requests (
    pullRequestId,
    mergeStatus,
    repository_name,
    closedDate,
    creationDate,
    title,
    createdBy_displayName,
    createdBy_uniqueName,
    createdBy_imageUrl,
    status
) VALUES ($pullRequestId, $mergeStatus, $repository_name, $closedDate, $creationDate, $title, $createdBy_displayName, $createdBy_uniqueName, $createdBy_imageUrl, $status);`);

const count = db.transaction((prs: typeof PullRequestData) => {
  let count = 0;
  pullRequests
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
    }))
    .forEach((pr) => {
      insertPullRequests.run(pr);
      count += 1;
    });
  let flatReviewers = prs
    .map((pr) => {
      return pr.reviewers;
    })
    .flat();
  let uniqueReviewers = new Map<
    string,
    (typeof PullRequestData)[0]["reviewers"][0]
  >();
  flatReviewers.forEach((rev) => {
    uniqueReviewers.set(rev.id, rev);
  });
  for (let val of uniqueReviewers.values()) {
    insertReviewers.run({
      $id: val.id,
      $displayName: val.displayName,
      $imageUrl: val.imageUrl,
      $uniqueName: val.uniqueName,
    });
  }
  prs.forEach((pr) => {
    pr.reviewers.forEach((rev) => {
      insertCodeReviews.run({
        $pullRequestId: pr.pullRequestId,
        $reviewerId: rev.id,
      });
    });
  });
  return count;
})(pullRequests);

console.log(`${count} pull requests were processed`);
