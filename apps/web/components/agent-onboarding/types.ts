export interface StepProps {
	onNext: () => void;
	onBack: () => void;
}

export interface AgentOnboardingData {
	agentName: string;
	agentType: string;
	dailyLimit: number;
	monthlyLimit: number;
	whitelistedDomains: string[];
}
