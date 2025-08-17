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
import { useState } from "react";
import { IntegrationSetup } from "./integration-setup";
import { PaymentConfiguration } from "./payment-configuration";
import { RevenueSplits } from "./revenue-splits";
import { SiteInformation } from "./site-information";

interface PublisherOnboardingProps {
	onComplete: () => void;
	onSkip: () => void;
	currentStep?: number;
}

interface FormData {
	siteName: string;
	siteUrl: string;
	baseFee: number;
	revenueSplits: Array<{
		address: string;
		percentage: number;
	}>;
}

export function PublisherOnboarding({
	onComplete,
	onSkip,
	currentStep = 1,
}: PublisherOnboardingProps) {
	const router = useRouter();
	const totalSteps = 4;
	const progress = (currentStep / totalSteps) * 100;
	const [formData, setFormData] = useState<FormData>({
		siteName: "",
		siteUrl: "",
		baseFee: 0.01,
		revenueSplits: [{ address: "", percentage: 100 }],
	});

	const handleFormSubmit = (stepData: Record<string, unknown>) => {
		const updatedFormData = { ...formData, ...stepData };
		setFormData(updatedFormData);

		if (currentStep === totalSteps) {
			// Complete the onboarding with all collected data
			console.log(
				"Completing publisher onboarding with data:",
				updatedFormData,
			);
			onComplete();
		} else {
			router.push(`/publisher/onboarding?step=${currentStep + 1}`);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			router.push(`/publisher/onboarding?step=${currentStep - 1}`);
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<SiteInformation
						onSubmit={handleFormSubmit}
						onBack={handleBack}
						initialData={{
							siteName: formData.siteName,
							siteUrl: formData.siteUrl,
						}}
					/>
				);
			case 2:
				return (
					<PaymentConfiguration
						onSubmit={handleFormSubmit}
						onBack={handleBack}
						initialData={{
							baseFee: formData.baseFee,
						}}
					/>
				);
			case 3:
				return (
					<RevenueSplits
						onSubmit={handleFormSubmit}
						onBack={handleBack}
						initialData={{
							revenueSplits: formData.revenueSplits,
						}}
					/>
				);
			case 4:
				return (
					<IntegrationSetup
						onSubmit={handleFormSubmit}
						onBack={handleBack}
						initialData={{}}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl">
				<CardHeader className="text-center">
					<div className="flex items-center justify-between mb-4">
						<Badge variant="outline">Publisher Setup</Badge>
						<Badge variant="secondary">
							{currentStep} of {totalSteps}
						</Badge>
					</div>
					<Progress value={progress} className="mb-4" />
					<CardTitle>Welcome to Tollbooth</CardTitle>
					<CardDescription>
						Let's get your site set up to start earning revenue from automated
						requests
					</CardDescription>
				</CardHeader>

				<CardContent>
					{renderStep()}

					<div className="flex justify-between mt-8">
						{currentStep === 1 ? (
							<Button variant="outline" onClick={onSkip}>
								Back to Role Selection
							</Button>
						) : (
							<Button variant="outline" onClick={handleBack}>
								Back
							</Button>
						)}
						
						<Button 
							onClick={() => {
								// Trigger form submission for the current step
								const form = document.querySelector('form');
								if (form) {
									form.requestSubmit();
								}
							}}
						>
							{currentStep === totalSteps ? "Complete Setup" : "Next"}
							{currentStep !== totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
