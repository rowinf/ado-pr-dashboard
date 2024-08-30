import { $ } from "bun";

const tnumbers = ["t979140"];

for (let tnumber of tnumbers) {
  console.log("fetching active PRs", tnumber);
  let active = [];
  let completed = [];
  try {
    await $`az repos pr list --creator ${tnumber} > data/${tnumber}-active.json`;
  } catch (e) {
    console.error("couldnt fetch active PRs", e);
  }
  console.log("fetching completed PRs");
  try {
    await $`az repos pr list --status completed --creator ${tnumber} > data/${tnumber}-completed.json`;
  } catch (e) {
    console.error("couldnt fetch completed PRs", e);
  }
}
