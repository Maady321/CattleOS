import { Metadata } from "next";
import LoginPage from "./LoginClient";

export const metadata: Metadata = {
  title: "Login | CattleOS",
  description: "Sign in to your CattleOS account to manage your farm assets.",
  alternates: {
    canonical: "/login",
  },
};

export default function Page() {
  return <LoginPage />;
}
