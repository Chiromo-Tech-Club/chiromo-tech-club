import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Legacy /join → full membership registration (account + application in one flow). */
export default function JoinPage() {
  redirect(ROUTES.register);
}
