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
