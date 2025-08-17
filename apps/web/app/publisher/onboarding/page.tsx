"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PublisherOnboarding } from "../../../components/publisher-onboarding/publisher-onboarding";

function PublisherOnboardingContent() {
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
		// Redirect back to role selection
		router.push("/");
	};

	return (
		<PublisherOnboarding
			currentStep={currentStep}
			onComplete={handleComplete}
			onSkip={handleSkip}
		/>
	);
}

export default function PublisherOnboardingPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PublisherOnboardingContent />
		</Suspense>
	);
}
