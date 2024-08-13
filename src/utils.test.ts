import { test, expect } from "bun:test";

import { getBusinessHours } from "./utils.ts";
import json from "../data/t979140.json";

test("getBusinessHours", () => {
  const [one, two, three] = json;
  function getDates(obj: (typeof json)[0]): [Date, Date] {
    const { creationDate, closedDate } = obj;
    return [new Date(creationDate), new Date(closedDate)];
  }
  expect(getBusinessHours(...getDates(one))).toEqual(1);
  expect(getBusinessHours(...getDates(two))).toEqual(-0);
  expect(getBusinessHours(...getDates(three))).toEqual(6);
});
