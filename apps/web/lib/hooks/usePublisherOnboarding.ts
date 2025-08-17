// React hook for managing publisher onboarding form state

import { useCallback, useState } from "react";
import { createPublisher } from "../supabase/publisher-operations";
import type {
	PublisherOnboardingData,
	PublisherOnboardingStep1,
	PublisherOnboardingStep2,
	PublisherOnboardingStep3,
} from "../types/publisher";

interface UsePublisherOnboardingReturn {
	// Form state
	step1Data: PublisherOnboardingStep1;
	step2Data: PublisherOnboardingStep2;
	step3Data: PublisherOnboardingStep3;

	// Form actions
	updateStep1: (data: Partial<PublisherOnboardingStep1>) => void;
	updateStep2: (data: Partial<PublisherOnboardingStep2>) => void;
	updateStep3: (data: Partial<PublisherOnboardingStep3>) => void;
	addRevenueSplit: () => void;
	removeRevenueSplit: (index: number) => void;
	updateRevenueSplit: (
		index: number,
		data: Partial<PublisherOnboardingStep3["revenue_splits"][0]>,
	) => void;

	// Validation
	validateStep1: () => string[];
	validateStep2: () => string[];
	validateStep3: () => string[];

	// Submission
	submitOnboarding: (
		userId: string,
	) => Promise<
		| { success: true; publisherId: string; apiKey: string }
		| { success: false; error: string }
	>;

	// State
	isSubmitting: boolean;
	errors: string[];

	// Reset
	reset: () => void;
}

const initialStep1: PublisherOnboardingStep1 = {
	site_name: "",
	site_url: "",
};

const initialStep2: PublisherOnboardingStep2 = {
	base_fee_usdc: 0.01,
};

const initialStep3: PublisherOnboardingStep3 = {
	revenue_splits: [{ wallet_address: "", percentage: 100 }],
};

export function usePublisherOnboarding(): UsePublisherOnboardingReturn {
	const [step1Data, setStep1Data] =
		useState<PublisherOnboardingStep1>(initialStep1);
	const [step2Data, setStep2Data] =
		useState<PublisherOnboardingStep2>(initialStep2);
	const [step3Data, setStep3Data] =
		useState<PublisherOnboardingStep3>(initialStep3);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);

	const updateStep1 = useCallback((data: Partial<PublisherOnboardingStep1>) => {
		setStep1Data((prev) => ({ ...prev, ...data }));
		setErrors([]); // Clear errors when user makes changes
	}, []);

	const updateStep2 = useCallback((data: Partial<PublisherOnboardingStep2>) => {
		setStep2Data((prev) => ({ ...prev, ...data }));
		setErrors([]);
	}, []);

	const updateStep3 = useCallback((data: Partial<PublisherOnboardingStep3>) => {
		setStep3Data((prev) => ({ ...prev, ...data }));
		setErrors([]);
	}, []);

	const addRevenueSplit = useCallback(() => {
		setStep3Data((prev) => ({
			...prev,
			revenue_splits: [
				...prev.revenue_splits,
				{ wallet_address: "", percentage: 0 },
			],
		}));
	}, []);

	const removeRevenueSplit = useCallback((index: number) => {
		setStep3Data((prev) => ({
			...prev,
			revenue_splits: prev.revenue_splits.filter((_, i) => i !== index),
		}));
	}, []);

	const updateRevenueSplit = useCallback(
		(
			index: number,
			data: Partial<PublisherOnboardingStep3["revenue_splits"][0]>,
		) => {
			setStep3Data((prev) => ({
				...prev,
				revenue_splits: prev.revenue_splits.map((split, i) =>
					i === index ? { ...split, ...data } : split,
				),
			}));
		},
		[],
	);

	const validateStep1 = useCallback((): string[] => {
		const errors: string[] = [];

		if (!step1Data.site_name.trim()) {
			errors.push("Site name is required");
		}

		if (!step1Data.site_url.trim()) {
			errors.push("Site URL is required");
		} else {
			try {
				const url = new URL(step1Data.site_url);
				if (!["http:", "https:"].includes(url.protocol)) {
					errors.push("Site URL must use HTTP or HTTPS protocol");
				}
			} catch {
				errors.push("Site URL must be a valid URL");
			}
		}

		return errors;
	}, [step1Data]);

	const validateStep2 = useCallback((): string[] => {
		const errors: string[] = [];

		if (step2Data.base_fee_usdc <= 0) {
			errors.push("Base fee must be greater than 0");
		}

		if (step2Data.base_fee_usdc > 1000) {
			errors.push("Base fee seems too high (max 1000 USDC)");
		}

		return errors;
	}, [step2Data]);

	const validateStep3 = useCallback((): string[] => {
		const errors: string[] = [];

		if (step3Data.revenue_splits.length === 0) {
			errors.push("At least one revenue split is required");
		}

		let totalPercentage = 0;
		step3Data.revenue_splits.forEach((split, index) => {
			if (!split.wallet_address.trim()) {
				errors.push(`Revenue split ${index + 1}: Wallet address is required`);
			} else if (!/^0x[a-fA-F0-9]{40}$/.test(split.wallet_address)) {
				errors.push(
					`Revenue split ${index + 1}: Invalid Ethereum address format`,
				);
			}

			if (split.percentage < 0 || split.percentage > 100) {
				errors.push(
					`Revenue split ${index + 1}: Percentage must be between 0 and 100`,
				);
			}

			totalPercentage += split.percentage;
		});

		if (totalPercentage > 100) {
			errors.push("Total revenue splits cannot exceed 100%");
		}

		if (totalPercentage === 0) {
			errors.push(
				"At least one revenue split must have a percentage greater than 0",
			);
		}

		return errors;
	}, [step3Data]);

	const submitOnboarding = useCallback(
		async (
			userId: string,
		): Promise<
			| { success: true; publisherId: string; apiKey: string }
			| { success: false; error: string }
		> => {
			setIsSubmitting(true);
			setErrors([]);

			try {
				// Validate all steps
				const step1Errors = validateStep1();
				const step2Errors = validateStep2();
				const step3Errors = validateStep3();
				const allErrors = [...step1Errors, ...step2Errors, ...step3Errors];

				if (allErrors.length > 0) {
					setErrors(allErrors);
					return { success: false, error: "Please fix validation errors" };
				}

				// Combine all data
				const onboardingData: PublisherOnboardingData = {
					...step1Data,
					...step2Data,
					revenue_splits: step3Data.revenue_splits,
				};

				// Submit to Supabase
				const result = await createPublisher(userId, onboardingData);

				if ("error" in result) {
					setErrors([result.error]);
					return { success: false, error: result.error };
				}

				return {
					success: true,
					publisherId: result.publisher.id,
					apiKey: result.api_key,
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "An unexpected error occurred";
				setErrors([errorMessage]);
				return { success: false, error: errorMessage };
			} finally {
				setIsSubmitting(false);
			}
		},
		[
			step1Data,
			step2Data,
			step3Data,
			validateStep1,
			validateStep2,
			validateStep3,
		],
	);

	const reset = useCallback(() => {
		setStep1Data(initialStep1);
		setStep2Data(initialStep2);
		setStep3Data(initialStep3);
		setIsSubmitting(false);
		setErrors([]);
	}, []);

	return {
		step1Data,
		step2Data,
		step3Data,
		updateStep1,
		updateStep2,
		updateStep3,
		addRevenueSplit,
		removeRevenueSplit,
		updateRevenueSplit,
		validateStep1,
		validateStep2,
		validateStep3,
		submitOnboarding,
		isSubmitting,
		errors,
		reset,
	};
}
