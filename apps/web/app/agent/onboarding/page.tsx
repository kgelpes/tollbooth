"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AgentOnboarding } from "../../../components/agent-onboarding/agent-onboarding";

function AgentOnboardingContent() {
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
		// Redirect back to role selection
		router.push("/");
	};

	return (
		<AgentOnboarding
			currentStep={currentStep}
			onComplete={handleComplete}
			onSkip={handleSkip}
		/>
	);
}

export default function AgentOnboardingPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AgentOnboardingContent />
		</Suspense>
	);
}
