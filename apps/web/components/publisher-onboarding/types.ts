export interface StepProps {
	onNext: () => void;
	onBack: () => void;
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
