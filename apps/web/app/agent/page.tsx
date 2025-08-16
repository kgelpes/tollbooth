import { redirect } from "next/navigation";

export default function AgentPage() {
	// Redirect to agent onboarding
	redirect("/agent/onboarding?step=1");
}
