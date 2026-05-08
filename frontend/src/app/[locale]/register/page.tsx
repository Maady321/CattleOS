import { Metadata } from "next";
import RegisterPage from "./RegisterClient";

export const metadata: Metadata = {
  title: "Register | CattleOS",
  description: "Create your CattleOS account and start managing your farm with precision.",
  alternates: {
    canonical: "/register",
  },
};

export default function Page() {
  return <RegisterPage />;
}
