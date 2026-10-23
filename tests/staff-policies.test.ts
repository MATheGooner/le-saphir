import assert from "node:assert/strict";
import test from "node:test";
import { can, canTransitionOrder } from "../lib/staff-permissions.ts";

test("unauthenticated users have no staff capabilities", () => {
  assert.equal(can(null, "VIEW_OPERATIONS"), false);
  assert.equal(can(undefined, "EDIT_SETTINGS"), false);
});
test("STAFF can operate service but cannot edit admin configuration", () => {
  assert.equal(can("STAFF", "UPDATE_ORDER"), true); assert.equal(can("STAFF", "UPDATE_RESERVATION"), true);
  assert.equal(can("STAFF", "TOGGLE_MENU"), true); assert.equal(can("STAFF", "EDIT_MENU"), false); assert.equal(can("STAFF", "EDIT_SETTINGS"), false);
});
test("ADMIN can edit menu and restaurant settings", () => {
  assert.equal(can("ADMIN", "EDIT_MENU"), true); assert.equal(can("ADMIN", "EDIT_SETTINGS"), true); assert.equal(can("ADMIN", "TOGGLE_MENU"), true);
});
test("order status progression rejects nonsensical transitions", () => {
  assert.equal(canTransitionOrder("PENDING", "ACCEPTED"), true); assert.equal(canTransitionOrder("ACCEPTED", "PREPARING"), true);
  assert.equal(canTransitionOrder("PREPARING", "READY"), true); assert.equal(canTransitionOrder("READY", "COMPLETED"), true);
  assert.equal(canTransitionOrder("PENDING", "READY"), false); assert.equal(canTransitionOrder("COMPLETED", "PREPARING"), false); assert.equal(canTransitionOrder("CANCELLED", "ACCEPTED"), false);
});
