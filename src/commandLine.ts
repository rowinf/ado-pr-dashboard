import { $ } from "bun";

/**
 * STEP ZERO:\n
 * Get the azure cli with devops extension and run this in the command line:\n
 * $ `az login --allow-no-subscriptions`\n
 */

$.env({ AZURE_DEVOPS_EXT_PAT: Bun.env.AZURE_DEVOPS_EXT_PAT });

const getPullRequests = async (tnumber: string) => {
  let pullRequests = [];

  const file = Bun.file("data/raw.json");
  if (!(await file.exists())) {
    await $`az repos pr list --status completed --creator ${tnumber} > data/raw.json`;
  }
  pullRequests = (await file.json()) as any[];
  // console.log(prs[0])
  const results = [];
  for (let pr of pullRequests) {
    let result = {
      pullRequestId: pr.pullRequestId,
      mergeStatus: String(pr.mergeStatus),
      status: String(pr.status),
      closedDate: String(pr.closedDate),
      creationDate: String(pr.creationDate),
      title: pr.title,
      createdBy: pr.createdBy,
      repository: pr.repository,
      reviewers: pr.reviewers,
    };
    results.push(result);
  }
  return results;
};
export default getPullRequests;
