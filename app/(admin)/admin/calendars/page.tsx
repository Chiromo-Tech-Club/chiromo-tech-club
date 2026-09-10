import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Calendar management lives on Dashboard → Calendar (and Social Calendar). */
export default function AdminCalendarsRedirectPage() {
  redirect(`${ROUTES.dashboard}/calendar`);
}
