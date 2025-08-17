"use client";

import { Badge } from "@tollbooth/ui/badge";
import { Button } from "@tollbooth/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tollbooth/ui/card";
import { Progress } from "@tollbooth/ui/components/progress";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { AgentInformation } from "./agent-information";
import { IntegrationReady } from "./integration-ready";
import { PaymentSetup } from "./payment-setup";
import { SpendingControls } from "./spending-controls";

interface AgentOnboardingProps {
	onComplete: () => void;
	onSkip: () => void;
	currentStep?: number;
}

export function AgentOnboarding({
	onComplete,
	onSkip,
	currentStep = 1,
}: AgentOnboardingProps) {
	const router = useRouter();
	const totalSteps = 4;
	const progress = (currentStep / totalSteps) * 100;

	const handleNext = () => {
		if (currentStep === totalSteps) {
			onComplete();
		} else {
			router.push(`/agent/onboarding?step=${currentStep + 1}`);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			router.push(`/agent/onboarding?step=${currentStep - 1}`);
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <AgentInformation onNext={handleNext} onBack={handleBack} />;
			case 2:
				return <PaymentSetup onNext={handleNext} onBack={handleBack} />;
			case 3:
				return <SpendingControls onNext={handleNext} onBack={handleBack} />;
			case 4:
				return <IntegrationReady onNext={handleNext} onBack={handleBack} />;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl">
				<CardHeader className="text-center">
					<div className="flex items-center justify-between mb-4">
						<Badge variant="outline">Agent Setup</Badge>
						<Badge variant="secondary">
							{currentStep} of {totalSteps}
						</Badge>
					</div>
					<Progress value={progress} className="mb-4" />
					<CardTitle>Welcome to Tollbooth</CardTitle>
					<CardDescription>
						Let's get your agent set up to seamlessly pay for content and API
						access
					</CardDescription>
				</CardHeader>

				<CardContent>
					{renderStep()}

					<div className="flex justify-between mt-8">
						<div className="flex gap-2">
							{currentStep === 1 ? (
								<Button variant="outline" onClick={onSkip}>
									Back to Role Selection
								</Button>
							) : (
								<Button variant="outline" onClick={handleBack}>
									Back
								</Button>
							)}
						</div>

						<Button onClick={handleNext}>
							{currentStep === totalSteps ? (
								"Complete Setup"
							) : (
								<>
									Next
									<ArrowRight className="w-4 h-4 ml-2" />
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
