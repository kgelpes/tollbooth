"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AgentOnboarding } from "../../../components/agent-onboarding/agent-onboarding";

export default function AgentOnboardingPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const currentStep = parseInt(searchParams.get("step") || "1", 10);

	const handleComplete = () => {
		console.log("Agent onboarding completed!");
		// Redirect to dashboard or success page
		router.push("/agent/dashboard");
	};

	const handleSkip = () => {
		console.log("Agent onboarding skipped");
		// Redirect to dashboard
		router.push("/agent/dashboard");
	};

	return (
		<AgentOnboarding
			currentStep={currentStep}
			onComplete={handleComplete}
			onSkip={handleSkip}
		/>
	);
}
