import { redirect } from "next/navigation";

// Entry point — send visitors to the login screen (Screen 1).
export default function Home() {
  redirect("/login");
}
