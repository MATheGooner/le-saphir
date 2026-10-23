export type StaffRole = "ADMIN" | "STAFF";
export type StaffCapability = "VIEW_OPERATIONS" | "UPDATE_ORDER" | "UPDATE_RESERVATION" | "TOGGLE_MENU" | "EDIT_MENU" | "EDIT_SETTINGS";
export type OrderStatus = "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

const staffCapabilities: StaffCapability[] = ["VIEW_OPERATIONS", "UPDATE_ORDER", "UPDATE_RESERVATION", "TOGGLE_MENU"];
export function can(role: StaffRole | null | undefined, capability: StaffCapability) {
  if (!role) return false;
  return role === "ADMIN" || staffCapabilities.includes(capability);
}

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"], ACCEPTED: ["PREPARING", "CANCELLED"], PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"], COMPLETED: [], CANCELLED: [],
};
export function canTransitionOrder(from: OrderStatus, to: OrderStatus) { return transitions[from].includes(to); }
export function nextOrderStatuses(status: OrderStatus) { return transitions[status]; }
