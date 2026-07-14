import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export function getCurrentSession() {
  return getServerSession(authOptions);
}

/**
 * Throws a 401/403-style error for use inside route handlers:
 *   const session = await requireRole(["superadmin", "manager"]);
 */
export async function requireRole(allowedRoles = []) {
  const session = await getCurrentSession();
  if (!session?.user) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  if (allowedRoles.length && !allowedRoles.includes(session.user.role)) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }
  return session;
}

// Agents may only manage their own listings; manager/superadmin bypass ownership.
export function canManageListing(session, listing) {
  const role = session?.user?.role;
  if (role === "superadmin" || role === "manager") return true;
  if (role === "agent") {
    return String(listing.agent) === String(session.user.id);
  }
  return false;
}

// Staff oversight (superadmin/manager) or the requester who owns this
// UserRequest. Used for staff detail access -- accepting an offer uses a
// stricter, explicit ownership check instead of this function's oversight
// bypass, since accepting is the requester's action alone.
export function canManageRequest(session, userRequest) {
  const role = session?.user?.role;
  if (role === "superadmin" || role === "manager") return true;
  return String(userRequest.userId) === String(session?.user?.id);
}

// Only the agent/manager who created an offer, or staff oversight
// (superadmin/manager) may act on it -- the route itself decides which
// status transitions each side is allowed (owner edits/withdraws while
// pending; staff may only force-decline someone else's pending offer).
export function canManageOffer(session, offer) {
  const role = session?.user?.role;
  if (role === "superadmin" || role === "manager") return true;
  return String(offer.agent) === String(session?.user?.id);
}

// Single source of truth for sealed-bid visibility: the requester and staff
// oversight (superadmin/manager) see every offer on a request; an agent sees
// only their own. One function, one place to adjust if this rule ever changes.
export function offerVisibilityFilter(session, userRequest) {
  const role = session?.user?.role;
  const isOversight = role === "superadmin" || role === "manager";
  const isRequester = String(userRequest.userId) === String(session?.user?.id);
  if (isOversight || isRequester) return {};
  return { agent: session?.user?.id };
}
