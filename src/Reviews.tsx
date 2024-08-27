import { Top } from "./PullRequests.tsx";

const Reviews = ({ reviews }) => {
  return (
    <Top>
      <h1>Reviews</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>PR</th>
            <th>Title</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr>
              <td>{review.displayName}</td>
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
