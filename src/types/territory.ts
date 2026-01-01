// ============================================================================
// MEGAVX TERRITORY TYPES
// ============================================================================

// Admin Levels
export type AdminLevelCode = 'ADMIN0' | 'ADMIN1' | 'ADMIN2' | 'ADMIN3' | 'ADMIN4' | 'ADMIN5' | 'FRAG';

export interface AdminLevel {
    id: string;
    level_code: AdminLevelCode;
    level_name: string;
    level_order: number;
    commission_rate: number;
    table_name: string;
    description?: string;
    is_active: boolean;
}

// Base territory interface
export interface Territory {
    id: string;
    code: string;
    name: string;
    description?: string;
    admin_level: AdminLevelCode;
    parent_id?: string;

    // Location
    latitude?: number;
    longitude?: number;
    center_lat?: number;
    center_lng?: number;
    boundary_coordinates?: GeoJSON.FeatureCollection;

    // Ownership
    available_for_purchase: boolean;
    territory_price: number;
    commission_rate: number;
    owner_id?: string;
    owner_name?: string;
    purchase_date?: string;
    territory_status: 'available' | 'owned' | 'reserved' | 'unavailable';

    // Wallet info (hidden from non-owners)
    has_accrued_bonus?: boolean;
    accrued_balance?: number; // Only visible to admin
    potential_surprise?: number; // Only visible to admin

    // Stats
    total_sales?: number;

    // Metadata
    created_at: string;
    updated_at: string;
}

// Specific territory types
export interface MegaZone extends Territory {
    zone_code: string;
    zone_name: string;
    region_type?: string;
}

export interface MegaCountry extends Territory {
    megacountry_code: string;
    megacountry_name: string;
    megazone_id: string;
    total_population?: number;
    total_area_sq_km?: number;
}

export interface MegaProvince extends Territory {
    province_code: string;
    province_name: string;
    megacountry_id: string;
    megazone_id?: string;
    capital_city?: string;
    total_population?: number;
    total_area_sq_km?: number;
}

export interface MegaMunicipality extends Territory {
    municipality_code: string;
    municipality_name: string;
    municipality_type?: string;
    province_id: string;
    megacountry_id?: string;
    population?: number;
    area_sq_km?: number;
}

export interface MegaWard extends Territory {
    ward_code: string;
    ward_name: string;
    ward_type?: string;
    municipality_id: string;
    province_id?: string;
    population?: number;
    area_sq_km?: number;
}

export interface MegaCity extends Territory {
    city_code: string;
    city_name: string;
    city_type?: string;
    municipality_id?: string;
    province_id?: string;
    megacountry_id?: string;
    population?: number;
    area_sq_km?: number;
    is_capital: boolean;
    is_major_city: boolean;
    hero_image_url?: string;
    thumbnail_url?: string;
}

// MegaFrag - Special landmarks/POIs
export interface MegaFrag {
    id: string;
    frag_code: string;
    frag_name: string;
    frag_description?: string;

    // Categorization
    frag_type: 'landmark' | 'natural_wonder' | 'architecture' | 'beach' | 'park' | 'monument' | 'museum' | 'other';
    frag_category?: string;
    frag_subcategory?: string;
    tags?: string[];

    // Location hierarchy
    city_id?: string;
    city_name?: string;
    municipality_id?: string;
    province_id?: string;
    province_name?: string;
    megacountry_id?: string;
    country_name?: string;
    megazone_id?: string;
    zone_name?: string;

    // Precise location
    latitude: number;
    longitude: number;
    altitude_meters?: number;
    address?: string;
    radius_meters?: number;
    boundary_coordinates?: GeoJSON.FeatureCollection;

    // Ownership
    available_for_purchase: boolean;
    territory_price: number;
    commission_rate: number;
    owner_id?: string;
    owner_name?: string;
    purchase_date?: string;
    territory_status: 'available' | 'owned' | 'reserved' | 'unavailable';

    // Advertising
    is_advertising_enabled: boolean;
    advertising_revenue_share: number;
    ad_slots_available: number;
    ad_slots_filled: number;
    monthly_ad_views?: number;
    total_ad_revenue?: number;

    // Gamification
    is_gamification_enabled: boolean;
    game_type?: 'treasure_hunt' | 'quiz' | 'photo_challenge' | 'ar_game';
    reward_points?: number;
    total_players?: number;
    total_completions?: number;

    // AR/VR
    ar_enabled: boolean;
    vr_enabled: boolean;
    ar_model_url?: string;
    vr_scene_url?: string;
    photosphere_url?: string;
    video_360_url?: string;
    audio_guide_url?: string;

    // Experience
    experience_rating: number;
    total_visits: number;
    total_virtual_visits: number;
    total_reviews: number;

    // Visual
    hero_image_url?: string;
    thumbnail_url?: string;
    gallery_images?: string[];

    // Recognition
    is_unesco_site: boolean;
    is_world_wonder: boolean;
    year_established?: number;
    historical_significance?: string;

    // Visitor info
    visiting_hours?: Record<string, string>;
    entry_fee?: number;
    entry_fee_currency?: string;
    average_visit_duration_minutes?: number;
    best_time_to_visit?: string;

    // Wallet info (hidden)
    has_accrued_bonus?: boolean;

    verified: boolean;
    created_at: string;
    updated_at: string;
}

// Territory Wallet
export interface TerritoryWallet {
    id: string;
    admin_level_code: AdminLevelCode;
    territory_id: string;
    territory_name: string;

    total_earned: number;
    accrued_balance: number;
    current_balance: number;
    transferred_to_owner: number;

    surprise_bonus_pool: number;
    last_surprise_paid: number;
    last_surprise_date?: string;

    current_owner_id?: string;
    owner_wallet_id?: string;
    is_owned: boolean;
    ownership_date?: string;

    total_sales_processed: number;
    total_commissions_received: number;

    currency: string;
    created_at: string;
    updated_at: string;
}

// User Wallet
export interface UserWallet {
    id: string;
    user_id: string;

    total_earned: number;
    total_withdrawn: number;
    pending_balance: number;
    available_balance: number;

    total_sales_in_territories: number;
    total_territories_owned: number;

    currency: string;
    created_at: string;
    updated_at: string;
}

// Territory Purchase Result
export interface TerritoryPurchaseResult {
    territory_wallet_id: string;
    ownership_id: string;
    accrued_balance: number;
    surprise_bonus: number;
}

// Map Drilldown State
export interface MapDrilldownState {
    currentLevel: AdminLevelCode;
    selectedZone?: MegaZone;
    selectedCountry?: MegaCountry;
    selectedProvince?: MegaProvince;
    selectedMunicipality?: MegaMunicipality;
    selectedWard?: MegaWard;
    selectedCity?: MegaCity;
    selectedFrag?: MegaFrag;
}

// Commission Distribution
export interface CommissionDistribution {
    id: string;
    sale_id: string;
    sale_reference: string;
    recipient_user_id?: string;
    admin_level_code: AdminLevelCode;
    territory_id: string;
    territory_name: string;
    territory_wallet_id: string;
    sale_amount: number;
    commission_rate: number;
    commission_amount: number;
    was_territory_owned: boolean;
    status: 'pending' | 'accrued' | 'approved' | 'paid' | 'cancelled';
    created_at: string;
}

// Wallet Transaction
export interface WalletTransaction {
    id: string;
    wallet_id: string;
    user_id: string;
    transaction_type: 'commission' | 'withdrawal' | 'bonus' | 'adjustment' | 'refund';
    transaction_reference: string;
    description: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    currency: string;
    sale_id?: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

// Territory Card Display
export interface TerritoryCardData {
    id: string;
    code: string;
    name: string;
    admin_level: AdminLevelCode;
    admin_level_name: string;
    commission_rate: number;
    territory_price: number;
    is_owned: boolean;
    owner_name?: string;
    has_accrued_bonus: boolean;
    total_sales: number;
    thumbnail_url?: string;
}

// Dashboard Stats
export interface TerritoryDashboardStats {
    total_zones: number;
    total_countries: number;
    total_provinces: number;
    total_municipalities: number;
    total_wards: number;
    total_cities: number;
    total_frags: number;

    owned_territories: number;
    available_territories: number;

    total_commission_earned: number;
    pending_commissions: number;

    total_sales_today: number;
    total_sales_this_month: number;
}

