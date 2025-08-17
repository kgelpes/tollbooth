export interface StepProps {
	onSubmit: (data: Record<string, unknown>) => void;
	onBack: () => void;
	initialData?: Record<string, unknown>;
}

export interface AgentOnboardingData {
	agentName: string;
	agentType: string;
	dailyLimit: number;
	monthlyLimit: number;
	whitelistedDomains: string[];
}
