import { redirect } from "next/navigation";

// No standalone dashboard-summary requirement in the plan -- listings is the
// natural landing view for every staff role (agent/manager/superadmin all see it).
export default function AdminHome() {
  redirect("/admin/listings");
}
