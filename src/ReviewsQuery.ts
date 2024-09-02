import { db } from "./db.ts";

export interface ReviewsQuery {
    displayName: string;
    tnumber: string;
    pullRequestId: number;
    title: string;
    reviews: number;
  }
  
  export const getReviews = db.query<ReviewsQuery, {}>(`
  SELECT r.displayName, cr.pullRequestId, pr.title, pr.repository_name, 
    COUNT(r.displayName) as reviews, 
    substr(r.uniqueName, 0, instr(r.uniqueName, '@')) as tnumber
  FROM reviewers as r
  JOIN code_reviews as cr ON r.id = cr.reviewerId
  JOIN pull_requests as pr ON cr.pullRequestId = pr.pullRequestId
  GROUP BY r.displayName
  ORDER BY reviews DESC;
  `);
  