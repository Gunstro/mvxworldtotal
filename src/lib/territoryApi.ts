// ============================================================================
// MEGAVX TERRITORY API SERVICE
// ============================================================================

import { supabase } from './supabase';
import type {
    AdminLevelCode,
    MegaZone,
    MegaCountry,
    MegaProvince,
    MegaMunicipality,
    MegaWard,
    MegaCity,
    MegaFrag,
    TerritoryWallet,
    UserWallet,
    TerritoryPurchaseResult,
    TerritoryCardData,
    WalletTransaction,
    TerritoryDashboardStats
} from '../types/territory';

// ============================================================================
// TERRITORY FETCHING
// ============================================================================

/**
 * Get all MegaZones (World regions)
 */
export async function getMegaZones(): Promise<MegaZone[]> {
    const { data, error } = await supabase
        .from('megazones')
        .select('*')
        .order('zone_name');

    if (error) throw error;
    return data || [];
}

/**
 * Get countries within a zone
 */
export async function getCountriesByZone(zoneId: string): Promise<MegaCountry[]> {
    const { data, error } = await supabase
        .from('megacountries')
        .select('*')
        .eq('megazone_id', zoneId)
        .order('megacountry_name');

    if (error) throw error;
    return data || [];
}

/**
 * Get provinces within a country
 */
export async function getProvincesByCountry(countryId: string): Promise<MegaProvince[]> {
    const { data, error } = await supabase
        .from('megaprovinces')
        .select('*')
        .eq('megacountry_id', countryId)
        .order('province_name');

    if (error) throw error;
    return data || [];
}

/**
 * Get municipalities within a province
 */
export async function getMunicipalitiesByProvince(provinceId: string): Promise<MegaMunicipality[]> {
    const { data, error } = await supabase
        .from('megamunicipalities')
        .select('*')
        .eq('province_id', provinceId)
        .order('municipality_name');

    if (error) throw error;
    return data || [];
}

/**
 * Get wards within a municipality
 */
export async function getWardsByMunicipality(municipalityId: string): Promise<MegaWard[]> {
    const { data, error } = await supabase
        .from('megawards')
        .select('*')
        .eq('municipality_id', municipalityId)
        .order('ward_name');

    if (error) throw error;
    return data || [];
}

/**
 * Get cities within a municipality or province
 */
export async function getCitiesByMunicipality(municipalityId: string): Promise<MegaCity[]> {
    const { data, error } = await supabase
        .from('megacities')
        .select('*')
        .eq('municipality_id', municipalityId)
        .order('city_name');

    if (error) throw error;
    return data || [];
}

/**
 * Get major cities (2M+ population) globally
 */
export async function getMajorCities(): Promise<MegaCity[]> {
    const { data, error } = await supabase
        .from('megacities')
        .select('*')
        .eq('is_major_city', true)
        .order('population', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get MegaFrags (landmarks/POIs)
 */
export async function getMegaFrags(filters?: {
    countryId?: string;
    provinceId?: string;
    cityId?: string;
    fragType?: string;
    hasAR?: boolean;
    hasVR?: boolean;
    isUNESCO?: boolean;
}): Promise<MegaFrag[]> {
    let query = supabase
        .from('megafrags')
        .select('*');

    if (filters?.countryId) {
        query = query.eq('megacountry_id', filters.countryId);
    }
    if (filters?.provinceId) {
        query = query.eq('province_id', filters.provinceId);
    }
    if (filters?.cityId) {
        query = query.eq('city_id', filters.cityId);
    }
    if (filters?.fragType) {
        query = query.eq('frag_type', filters.fragType);
    }
    if (filters?.hasAR) {
        query = query.eq('ar_enabled', true);
    }
    if (filters?.hasVR) {
        query = query.eq('vr_enabled', true);
    }
    if (filters?.isUNESCO) {
        query = query.eq('is_unesco_site', true);
    }

    const { data, error } = await query.order('frag_name');

    if (error) throw error;
    return data || [];
}

/**
 * Get single MegaFrag by ID
 */
export async function getMegaFragById(fragId: string): Promise<MegaFrag | null> {
    const { data, error } = await supabase
        .from('vw_megafrags_full')
        .select('*')
        .eq('id', fragId)
        .single();

    if (error) throw error;
    return data;
}

// ============================================================================
// TERRITORY WALLET & STATUS
// ============================================================================

/**
 * Get territory wallet status (public view - hidden balance)
 */
export async function getTerritoryStatusPublic(
    adminLevelCode: AdminLevelCode,
    territoryId: string
): Promise<{
    wallet_id: string;
    territory_name: string;
    is_owned: boolean;
    is_available_for_purchase: boolean;
    owner_name: string | null;
    total_sales: number;
    has_accrued_bonus: boolean;
}> {
    const { data, error } = await supabase
        .rpc('get_territory_wallet_status_public', {
            p_admin_level_code: adminLevelCode,
            p_territory_id: territoryId
        });

    if (error) throw error;
    return data?.[0] || null;
}

/**
 * Get territory wallet balance (Admin only)
 */
export async function getTerritoryWalletAdmin(
    adminLevelCode: AdminLevelCode,
    territoryId: string
): Promise<TerritoryWallet | null> {
    const { data, error } = await supabase
        .rpc('get_territory_wallet_balance_admin', {
            p_admin_level_code: adminLevelCode,
            p_territory_id: territoryId
        });

    if (error) throw error;
    return data?.[0] || null;
}

/**
 * Get all unowned territories with accrued balances (Admin)
 */
export async function getUnownedTerritoriesWithBalance(): Promise<{
    wallet_id: string;
    admin_level_code: AdminLevelCode;
    level_name: string;
    territory_id: string;
    territory_name: string;
    accrued_balance: number;
    surprise_bonus_value: number;
    total_sales: number;
}[]> {
    const { data, error } = await supabase
        .from('vw_unowned_territories_with_balance')
        .select('*')
        .order('accrued_balance', { ascending: false });

    if (error) throw error;
    return data || [];
}

// ============================================================================
// USER WALLET
// ============================================================================

/**
 * Get user's wallet
 */
export async function getUserWallet(userId: string): Promise<UserWallet | null> {
    const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

/**
 * Get user's wallet transactions
 */
export async function getUserWalletTransactions(
    userId: string,
    limit: number = 50
): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

/**
 * Get user's owned territories
 */
export async function getUserTerritories(userId: string): Promise<{
    ownership_id: string;
    admin_level_code: AdminLevelCode;
    level_name: string;
    territory_id: string;
    territory_name: string;
    commission_rate: number;
    purchase_date: string;
    status: string;
}[]> {
    const { data, error } = await supabase
        .from('vw_territory_owners')
        .select('*')
        .eq('user_id', userId)
        .order('level_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get user's earnings report
 */
export async function getUserEarningsReport(
    userId: string,
    startDate?: string,
    endDate?: string
): Promise<{
    admin_level_code: AdminLevelCode;
    territory_name: string;
    total_sales: number;
    total_sale_value: number;
    total_commission: number;
    commission_rate: number;
}[]> {
    const { data, error } = await supabase
        .rpc('get_user_earnings_report', {
            p_user_id: userId,
            p_start_date: startDate || null,
            p_end_date: endDate || null
        });

    if (error) throw error;
    return data || [];
}

// ============================================================================
// TERRITORY PURCHASE
// ============================================================================

/**
 * Purchase a territory
 */
export async function purchaseTerritory(
    userId: string,
    adminLevelCode: AdminLevelCode,
    territoryId: string,
    territoryName: string,
    purchasePrice: number,
    paymentReference: string
): Promise<TerritoryPurchaseResult> {
    const { data, error } = await supabase
        .rpc('process_territory_purchase', {
            p_user_id: userId,
            p_admin_level_code: adminLevelCode,
            p_territory_id: territoryId,
            p_territory_name: territoryName,
            p_purchase_price: purchasePrice,
            p_payment_reference: paymentReference
        });

    if (error) throw error;

    if (!data || data.length === 0) {
        throw new Error('Purchase failed - no result returned');
    }

    return data[0];
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * Get territory dashboard statistics
 */
export async function getTerritoryDashboardStats(): Promise<TerritoryDashboardStats> {
    // Fetch counts from each table
    const [zones, countries, provinces, municipalities, wards, cities, frags] = await Promise.all([
        supabase.from('megazones').select('id', { count: 'exact', head: true }),
        supabase.from('megacountries').select('id', { count: 'exact', head: true }),
        supabase.from('megaprovinces').select('id', { count: 'exact', head: true }),
        supabase.from('megamunicipalities').select('id', { count: 'exact', head: true }),
        supabase.from('megawards').select('id', { count: 'exact', head: true }),
        supabase.from('megacities').select('id', { count: 'exact', head: true }),
        supabase.from('megafrags').select('id', { count: 'exact', head: true })
    ]);

    // Fetch owned/available counts
    const { count: ownedCount } = await supabase
        .from('territory_ownership')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

    const { count: availableCount } = await supabase
        .from('territory_wallets')
        .select('id', { count: 'exact', head: true })
        .eq('is_owned', false);

    return {
        total_zones: zones.count || 0,
        total_countries: countries.count || 0,
        total_provinces: provinces.count || 0,
        total_municipalities: municipalities.count || 0,
        total_wards: wards.count || 0,
        total_cities: cities.count || 0,
        total_frags: frags.count || 0,
        owned_territories: ownedCount || 0,
        available_territories: availableCount || 0,
        total_commission_earned: 0, // Would need separate query
        pending_commissions: 0,
        total_sales_today: 0,
        total_sales_this_month: 0
    };
}

// ============================================================================
// TERRITORY CARDS (for listing)
// ============================================================================

/**
 * Get territory cards for a specific level
 */
export async function getTerritoryCards(
    adminLevelCode: AdminLevelCode,
    parentId?: string
): Promise<TerritoryCardData[]> {
    let tableName: string;
    let codeField: string;
    let nameField: string;
    let parentField: string | null = null;
    let commissionRate: number;

    switch (adminLevelCode) {
        case 'ADMIN0':
            tableName = 'megazones';
            codeField = 'zone_code';
            nameField = 'zone_name';
            commissionRate = 2.10;
            break;
        case 'ADMIN1':
            tableName = 'megacountries';
            codeField = 'megacountry_code';
            nameField = 'megacountry_name';
            parentField = 'megazone_id';
            commissionRate = 3.50;
            break;
        case 'ADMIN2':
            tableName = 'megaprovinces';
            codeField = 'province_code';
            nameField = 'province_name';
            parentField = 'megacountry_id';
            commissionRate = 4.50;
            break;
        case 'ADMIN3':
            tableName = 'megamunicipalities';
            codeField = 'municipality_code';
            nameField = 'municipality_name';
            parentField = 'province_id';
            commissionRate = 5.40;
            break;
        case 'ADMIN4':
            tableName = 'megawards';
            codeField = 'ward_code';
            nameField = 'ward_name';
            parentField = 'municipality_id';
            commissionRate = 6.50;
            break;
        case 'ADMIN5':
            tableName = 'megacities';
            codeField = 'city_code';
            nameField = 'city_name';
            parentField = 'municipality_id';
            commissionRate = 6.50;
            break;
        default:
            throw new Error(`Unknown admin level: ${adminLevelCode}`);
    }

    let query = supabase.from(tableName).select('*');

    if (parentField && parentId) {
        query = query.eq(parentField, parentId);
    }

    const { data, error } = await query.order(nameField);

    if (error) throw error;

    // Transform to TerritoryCardData
    return (data || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        code: item[codeField] as string,
        name: item[nameField] as string,
        admin_level: adminLevelCode,
        admin_level_name: getAdminLevelName(adminLevelCode),
        commission_rate: commissionRate,
        territory_price: (item.territory_price as number) || 0,
        is_owned: item.territory_status === 'owned',
        owner_name: undefined,
        has_accrued_bonus: false, // Would need to check wallet
        total_sales: 0,
        thumbnail_url: (item.thumbnail_url as string) || undefined
    }));
}

function getAdminLevelName(code: AdminLevelCode): string {
    const names: Record<AdminLevelCode, string> = {
        'ADMIN0': 'Zone',
        'ADMIN1': 'Country',
        'ADMIN2': 'Province',
        'ADMIN3': 'Municipality',
        'ADMIN4': 'Ward',
        'ADMIN5': 'City',
        'FRAG': 'MegaFrag'
    };
    return names[code] || code;
}

