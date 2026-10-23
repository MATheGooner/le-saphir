import assert from "node:assert/strict";
import test from "node:test";
import { addMinutes, dayOfWeek, fitsWindow, isFutureLocal } from "../lib/time-rules.ts";

test("adds preparation minutes to a service time", () => {
  assert.equal(addMinutes("18:10", 40), "18:50");
  assert.equal(addMinutes("12:00", 20), "12:20");
});

test("accepts only future Paris-local date/time combinations", () => {
  assert.equal(isFutureLocal("2026-10-22", "19:00", "2026-10-22", "18:59"), true);
  assert.equal(isFutureLocal("2026-10-22", "18:59", "2026-10-22", "18:59"), false);
  assert.equal(isFutureLocal("2026-10-21", "22:00", "2026-10-22", "09:00"), false);
});

test("opening windows include opening time and exclude closing time", () => {
  assert.equal(fitsWindow("12:00", "12:00:00", "14:30:00"), true);
  assert.equal(fitsWindow("14:29", "12:00:00", "14:30:00"), true);
  assert.equal(fitsWindow("14:30", "12:00:00", "14:30:00"), false);
});

test("calculates stable weekdays from ISO dates", () => {
  assert.equal(dayOfWeek("2026-10-22"), 4);
  assert.equal(dayOfWeek("2026-10-25"), 0);
});
