// TypeScript types for Publisher database schema

export interface Publisher {
  id: string;
  user_id: string;
  site_name: string;
  site_url: string;
  base_fee_usdc: number;
  created_at: string;
  updated_at: string;
}

export interface RevenueSplit {
  id: string;
  publisher_id: string;
  wallet_address: string;
  percentage: number;
  created_at: string;
}

export interface PublisherApiKey {
  id: string;
  publisher_id: string;
  api_key: string;
  key_name: string;
  is_active: boolean;
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
}

// Form data types for onboarding steps
export interface PublisherOnboardingStep1 {
  site_name: string;
  site_url: string;
}

export interface PublisherOnboardingStep2 {
  base_fee_usdc: number;
}

export interface PublisherOnboardingStep3 {
  revenue_splits: Array<{
    wallet_address: string;
    percentage: number;
  }>;
}

export interface PublisherOnboardingStep4 {
  api_key: string;
  integration_code: string;
}

// Complete onboarding data
export interface PublisherOnboardingData extends 
  PublisherOnboardingStep1, 
  PublisherOnboardingStep2 {
  revenue_splits: PublisherOnboardingStep3['revenue_splits'];
}

// Database insert types (without auto-generated fields)
export interface PublisherInsert {
  user_id: string;
  site_name: string;
  site_url: string;
  base_fee_usdc: number;
}

export interface RevenueSplitInsert {
  publisher_id: string;
  wallet_address: string;
  percentage: number;
}

export interface PublisherApiKeyInsert {
  publisher_id: string;
  api_key: string;
  key_name?: string;
}

// Complete publisher data with related tables
export interface PublisherWithDetails extends Publisher {
  revenue_splits: RevenueSplit[];
  api_keys: PublisherApiKey[];
}
