import { Database } from "bun:sqlite";

export const db = new Database("hono-htmx.sqlite3");

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
    calculated_businessDuration NUMERIC
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
)`);

export const insertReviewers = db.prepare(`INSERT INTO reviewers (
    id,
    displayName,
    imageUrl,
    uniqueName
) VALUES ($id, $displayName, $imageUrl, $uniqueName)`);

export const insertCodeReviews = db.prepare(`INSERT INTO code_reviews (
    pullRequestId,
    reviewerId
) VALUES ($pullRequestId, $reviewerId)`);

export const insertPullRequests = db.prepare(`INSERT INTO pull_requests (
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
    calculated_businessDuration
) VALUES ($pullRequestId, $mergeStatus, $repository_name, $closedDate, $creationDate, $title, $createdBy_displayName, $createdBy_uniqueName, $createdBy_imageUrl, $status, $calculated_businessDuration);`);
