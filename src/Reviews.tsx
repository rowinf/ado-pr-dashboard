import { FC } from "hono/jsx";
import { ReviewsQuery } from "./ReviewsQuery.ts";
import { Top } from "./PullRequests.tsx";

const Reviews: FC<{ reviews: ReviewsQuery[] }> = ({ reviews }) => {
  return (
    <Top>
      <h1>Reviews</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>T-Number</th>
            <th>PR</th>
            <th>Title</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr>
              <td>{review.displayName}</td>
              <td>{review.tnumber}</td>
              <td>{review.pullRequestId}</td>
              <td>{review.title}</td>
              <td>{review.reviews}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Top>
  );
};

export default Reviews;
