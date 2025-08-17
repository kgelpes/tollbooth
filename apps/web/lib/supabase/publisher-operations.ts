// Supabase operations for Publisher management

import type {
	Publisher,
	PublisherApiKeyInsert,
	PublisherInsert,
	PublisherOnboardingData,
	PublisherWithDetails,
	RevenueSplit,
	RevenueSplitInsert,
} from "../types/publisher";
import { createClient } from "./client";

/**
 * Generate a unique API key with the tollbooth prefix
 */
function generateApiKey(): string {
	const randomBytes = crypto.getRandomValues(new Uint8Array(24));
	const base64 = btoa(String.fromCharCode(...randomBytes))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
	return `tollbooth_${base64}`;
}

/**
 * Create a new publisher with all related data
 */
export async function createPublisher(
	userId: string,
	data: PublisherOnboardingData,
): Promise<{ publisher: Publisher; api_key: string } | { error: string }> {
	const supabase = createClient();

	try {
		// Start transaction by inserting publisher first
		const publisherData: PublisherInsert = {
			user_id: userId,
			site_name: data.site_name,
			site_url: data.site_url,
			base_fee_usdc: data.base_fee_usdc,
		};

		const { data: publisher, error: publisherError } = await supabase
			.from("publishers")
			.insert([publisherData])
			.select()
			.single();

		if (publisherError) {
			console.error("Publisher insert error:", publisherError);
			return { error: "Failed to create publisher" };
		}

		// Validate revenue splits total
		const totalPercentage = data.revenue_splits.reduce(
			(sum, split) => sum + split.percentage,
			0,
		);
		if (totalPercentage > 100) {
			return { error: "Revenue splits total cannot exceed 100%" };
		}

		// Insert revenue splits
		if (data.revenue_splits.length > 0) {
			const revenueSplitData: RevenueSplitInsert[] = data.revenue_splits.map(
				(split) => ({
					publisher_id: publisher.id,
					wallet_address: split.wallet_address,
					percentage: split.percentage,
				}),
			);

			const { error: splitsError } = await supabase
				.from("revenue_splits")
				.insert(revenueSplitData);

			if (splitsError) {
				console.error("Revenue splits insert error:", splitsError);
				// TODO: Cleanup publisher if splits fail
				return { error: "Failed to create revenue splits" };
			}
		}

		// Generate and insert API key
		const apiKey = generateApiKey();
		const apiKeyData: PublisherApiKeyInsert = {
			publisher_id: publisher.id,
			api_key: apiKey,
			key_name: "Default",
		};

		const { error: keyError } = await supabase
			.from("publisher_api_keys")
			.insert([apiKeyData]);

		if (keyError) {
			console.error("API key insert error:", keyError);
			// TODO: Cleanup publisher and splits if key fails
			return { error: "Failed to create API key" };
		}

		return { publisher, api_key: apiKey };
	} catch (error) {
		console.error("Unexpected error creating publisher:", error);
		return { error: "An unexpected error occurred" };
	}
}

/**
 * Get publisher by user ID
 */
export async function getPublisherByUserId(
	userId: string,
): Promise<Publisher | null> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("publishers")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) {
		console.error("Error fetching publisher:", error);
		return null;
	}

	return data;
}

/**
 * Get publisher with all related data
 */
export async function getPublisherWithDetails(
	publisherId: string,
): Promise<PublisherWithDetails | null> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("publishers")
		.select(`
      *,
      revenue_splits(*),
      publisher_api_keys:publisher_api_keys(*)
    `)
		.eq("id", publisherId)
		.single();

	if (error) {
		console.error("Error fetching publisher details:", error);
		return null;
	}

	return {
		...data,
		api_keys: data.publisher_api_keys || [],
	} as PublisherWithDetails;
}

/**
 * Update publisher basic information
 */
export async function updatePublisher(
	publisherId: string,
	updates: Partial<Pick<Publisher, "site_name" | "site_url" | "base_fee_usdc">>,
): Promise<Publisher | { error: string }> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("publishers")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", publisherId)
		.select()
		.single();

	if (error) {
		console.error("Error updating publisher:", error);
		return { error: "Failed to update publisher" };
	}

	return data;
}

/**
 * Add revenue split to publisher
 */
export async function addRevenueSplit(
	publisherId: string,
	revenueSplit: Omit<RevenueSplitInsert, "publisher_id">,
): Promise<RevenueSplit | { error: string }> {
	const supabase = createClient();

	// Check current total percentage
	const { data: existingSplits } = await supabase
		.from("revenue_splits")
		.select("percentage")
		.eq("publisher_id", publisherId);

	const currentTotal =
		existingSplits?.reduce((sum, split) => sum + split.percentage, 0) || 0;

	if (currentTotal + revenueSplit.percentage > 100) {
		return { error: "Adding this split would exceed 100% total" };
	}

	const { data, error } = await supabase
		.from("revenue_splits")
		.insert([{ ...revenueSplit, publisher_id: publisherId }])
		.select()
		.single();

	if (error) {
		console.error("Error adding revenue split:", error);
		return { error: "Failed to add revenue split" };
	}

	return data;
}

/**
 * Remove revenue split
 */
export async function removeRevenueSplit(splitId: string): Promise<boolean> {
	const supabase = createClient();

	const { error } = await supabase
		.from("revenue_splits")
		.delete()
		.eq("id", splitId);

	if (error) {
		console.error("Error removing revenue split:", error);
		return false;
	}

	return true;
}

/**
 * Generate new API key for publisher
 */
export async function generateNewApiKey(
	publisherId: string,
	keyName: string = "New Key",
): Promise<string | { error: string }> {
	const supabase = createClient();

	const apiKey = generateApiKey();
	const apiKeyData: PublisherApiKeyInsert = {
		publisher_id: publisherId,
		api_key: apiKey,
		key_name: keyName,
	};

	const { error } = await supabase
		.from("publisher_api_keys")
		.insert([apiKeyData]);

	if (error) {
		console.error("Error generating API key:", error);
		return { error: "Failed to generate API key" };
	}

	return apiKey;
}

/**
 * Revoke API key
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
	const supabase = createClient();

	const { error } = await supabase
		.from("publisher_api_keys")
		.update({ is_active: false })
		.eq("id", keyId);

	if (error) {
		console.error("Error revoking API key:", error);
		return false;
	}

	return true;
}

/**
 * Validate API key and get publisher info
 */
export async function validateApiKey(
	apiKey: string,
): Promise<Publisher | null> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("publisher_api_keys")
		.select(`
      publisher_id,
      is_active,
      usage_count,
      publishers(*)
    `)
		.eq("api_key", apiKey)
		.eq("is_active", true)
		.single<{ publisher_id: string; is_active: boolean; usage_count: number | null; publishers: Publisher }>();

	if (error || !data?.is_active) {
		return null;
	}

	// Update usage tracking
	const currentCount = typeof data.usage_count === "number" ? data.usage_count : 0;
	await supabase
		.from("publisher_api_keys")
		.update({
			last_used_at: new Date().toISOString(),
			usage_count: currentCount + 1,
		})
		.eq("api_key", apiKey);

	return data.publishers ?? null;
}
