export interface StepProps {
	onSubmit: (data: Record<string, unknown>) => void;
	onBack: () => void;
	initialData?: Record<string, unknown>;
}

export interface PublisherOnboardingData {
	siteName: string;
	siteUrl: string;
	baseFee: number;
	recipients: Array<{
		walletAddress: string;
		percentage: number;
	}>;
}
