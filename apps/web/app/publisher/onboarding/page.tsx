"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PublisherOnboarding } from "../../../components/publisher-onboarding";

export default function PublisherOnboardingPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const currentStep = parseInt(searchParams.get("step") || "1", 10);

	const handleComplete = () => {
		console.log("Publisher onboarding completed!");
		// Redirect to dashboard or success page
		router.push("/publisher/dashboard");
	};

	const handleSkip = () => {
		console.log("Publisher onboarding skipped");
		// Redirect to dashboard
		router.push("/publisher/dashboard");
	};

	return (
		<PublisherOnboarding
			currentStep={currentStep}
			onComplete={handleComplete}
			onSkip={handleSkip}
		/>
	);
}
