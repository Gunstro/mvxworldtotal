// ============================================================================
// MEGAVX WORLD MAP COMPONENT
// ============================================================================
// Interactive world map with drilldown: Zone → Country → Province → Municipality → Ward/City
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
    Globe,
    MapPin,
    ChevronRight,
    ChevronDown,
    ArrowLeft,
    Sparkles,
    Landmark,
    Building2,
    Map as MapIcon,
    Lock,
    Unlock
} from 'lucide-react';
import type {
    AdminLevelCode,
    MegaZone,
    MegaCountry,
    MegaProvince,
    MegaMunicipality,
    MegaWard,
    MegaCity,
    MegaFrag,
    MapDrilldownState
} from '../../types/territory';
import {
    getMegaZones,
    getCountriesByZone,
    getProvincesByCountry,
    getMunicipalitiesByProvince,
    getWardsByMunicipality,
    getCitiesByMunicipality,
    getMegaFrags,
    getTerritoryStatusPublic
} from '../../lib/territoryApi';

interface WorldMapProps {
    onTerritorySelect?: (territory: {
        adminLevel: AdminLevelCode;
        id: string;
        name: string;
    }) => void;
    showMegaFrags?: boolean;
    className?: string;
}

interface TerritoryItemProps {
    id: string;
    name: string;
    code: string;
    adminLevel: AdminLevelCode;
    commissionRate: number;
    isOwned: boolean;
    hasBonus: boolean;
    childCount?: number;
    onSelect: () => void;
    onDrillDown?: () => void;
}

const ADMIN_LEVEL_ICONS: Record<AdminLevelCode, React.ReactNode> = {
    'ADMIN0': <Globe className="w-5 h-5" />,
    'ADMIN1': <MapIcon className="w-5 h-5" />,
    'ADMIN2': <Building2 className="w-5 h-5" />,
    'ADMIN3': <Building2 className="w-5 h-5" />,
    'ADMIN4': <MapPin className="w-5 h-5" />,
    'ADMIN5': <Building2 className="w-5 h-5" />,
    'FRAG': <Landmark className="w-5 h-5" />
};

const ADMIN_LEVEL_COLORS: Record<AdminLevelCode, string> = {
    'ADMIN0': 'from-purple-500 to-indigo-600',
    'ADMIN1': 'from-blue-500 to-cyan-600',
    'ADMIN2': 'from-green-500 to-emerald-600',
    'ADMIN3': 'from-yellow-500 to-orange-600',
    'ADMIN4': 'from-red-500 to-pink-600',
    'ADMIN5': 'from-teal-500 to-cyan-600',
    'FRAG': 'from-amber-500 to-yellow-600'
};

const ADMIN_LEVEL_NAMES: Record<AdminLevelCode, string> = {
    'ADMIN0': 'Zone',
    'ADMIN1': 'Country',
    'ADMIN2': 'Province',
    'ADMIN3': 'Municipality',
    'ADMIN4': 'Ward',
    'ADMIN5': 'City',
    'FRAG': 'MegaFrag'
};

const COMMISSION_RATES: Record<AdminLevelCode, number> = {
    'ADMIN0': 2.10,
    'ADMIN1': 3.50,
    'ADMIN2': 4.50,
    'ADMIN3': 5.40,
    'ADMIN4': 6.50,
    'ADMIN5': 6.50,
    'FRAG': 7.50
};

// Territory Item Component
const TerritoryItem: React.FC<TerritoryItemProps> = ({
    id,
    name,
    code,
    adminLevel,
    commissionRate,
    isOwned,
    hasBonus,
    childCount,
    onSelect,
    onDrillDown
}) => {
    return (
        <div
            className={`
        relative p-4 rounded-xl border transition-all duration-300 cursor-pointer
        ${isOwned
                    ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20'
                }
      `}
            onClick={onSelect}
        >
            {/* Bonus indicator */}
            {hasBonus && !isOwned && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    BONUS
                </div>
            )}

            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${ADMIN_LEVEL_COLORS[adminLevel]}`}>
                        {ADMIN_LEVEL_ICONS[adminLevel]}
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="font-semibold text-white">{name}</h3>
                        <p className="text-xs text-gray-400">{code}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                {commissionRate}% Commission
                            </span>
                            {isOwned ? (
                                <span className="text-xs bg-gray-600/50 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Owned
                                </span>
                            ) : (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Unlock className="w-3 h-3" /> Available
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Drill down button */}
                {onDrillDown && childCount !== undefined && childCount > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDrillDown();
                        }}
                        className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                )}
            </div>

            {childCount !== undefined && childCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-sm text-gray-400">
                    <span>{childCount} {adminLevel === 'ADMIN0' ? 'countries' : 'areas'} inside</span>
                    <ChevronDown className="w-4 h-4" />
                </div>
            )}
        </div>
    );
};

// Breadcrumb Component
const Breadcrumb: React.FC<{
    items: { label: string; onClick?: () => void }[];
}> = ({ items }) => {
    return (
        <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                    <button
                        onClick={item.onClick}
                        disabled={!item.onClick}
                        className={`
              whitespace-nowrap px-2 py-1 rounded transition-colors
              ${item.onClick
                                ? 'text-gray-400 hover:text-white hover:bg-gray-700/50 cursor-pointer'
                                : 'text-white font-medium cursor-default'
                            }
            `}
                    >
                        {item.label}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
};

// Main World Map Component
export const WorldMap: React.FC<WorldMapProps> = ({
    onTerritorySelect,
    showMegaFrags = true,
    className = ''
}) => {
    const [drilldownState, setDrilldownState] = useState<MapDrilldownState>({
        currentLevel: 'ADMIN0'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data for each level
    const [zones, setZones] = useState<MegaZone[]>([]);
    const [countries, setCountries] = useState<MegaCountry[]>([]);
    const [provinces, setProvinces] = useState<MegaProvince[]>([]);
    const [municipalities, setMunicipalities] = useState<MegaMunicipality[]>([]);
    const [wards, setWards] = useState<MegaWard[]>([]);
    const [cities, setCities] = useState<MegaCity[]>([]);
    const [frags, setFrags] = useState<MegaFrag[]>([]);

    // Load zones on mount
    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMegaZones();
            setZones(data);
        } catch (err) {
            setError('Failed to load zones');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadCountries = async (zoneId: string) => {
        setLoading(true);
        try {
            const data = await getCountriesByZone(zoneId);
            setCountries(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadProvinces = async (countryId: string) => {
        setLoading(true);
        try {
            const data = await getProvincesByCountry(countryId);
            setProvinces(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMunicipalities = async (provinceId: string) => {
        setLoading(true);
        try {
            const data = await getMunicipalitiesByProvince(provinceId);
            setMunicipalities(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadWardsAndCities = async (municipalityId: string) => {
        setLoading(true);
        try {
            const [wardsData, citiesData] = await Promise.all([
                getWardsByMunicipality(municipalityId),
                getCitiesByMunicipality(municipalityId)
            ]);
            setWards(wardsData);
            setCities(citiesData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadFrags = async (countryId?: string) => {
        if (!showMegaFrags) return;
        try {
            const data = await getMegaFrags({ countryId });
            setFrags(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Drill down handlers
    const drillToZone = useCallback((zone: MegaZone) => {
        setDrilldownState({
            currentLevel: 'ADMIN1',
            selectedZone: zone
        });
        loadCountries(zone.id);
    }, []);

    const drillToCountry = useCallback((country: MegaCountry) => {
        setDrilldownState(prev => ({
            ...prev,
            currentLevel: 'ADMIN2',
            selectedCountry: country
        }));
        loadProvinces(country.id);
        loadFrags(country.id);
    }, []);

    const drillToProvince = useCallback((province: MegaProvince) => {
        setDrilldownState(prev => ({
            ...prev,
            currentLevel: 'ADMIN3',
            selectedProvince: province
        }));
        loadMunicipalities(province.id);
    }, []);

    const drillToMunicipality = useCallback((municipality: MegaMunicipality) => {
        setDrilldownState(prev => ({
            ...prev,
            currentLevel: 'ADMIN4',
            selectedMunicipality: municipality
        }));
        loadWardsAndCities(municipality.id);
    }, []);

    // Navigation handlers
    const goBack = useCallback(() => {
        const { currentLevel, selectedZone, selectedCountry, selectedProvince } = drilldownState;

        switch (currentLevel) {
            case 'ADMIN1':
                setDrilldownState({ currentLevel: 'ADMIN0' });
                break;
            case 'ADMIN2':
                setDrilldownState({ currentLevel: 'ADMIN1', selectedZone });
                if (selectedZone) loadCountries(selectedZone.id);
                break;
            case 'ADMIN3':
                setDrilldownState({ currentLevel: 'ADMIN2', selectedZone, selectedCountry });
                if (selectedCountry) loadProvinces(selectedCountry.id);
                break;
            case 'ADMIN4':
            case 'ADMIN5':
                setDrilldownState({ currentLevel: 'ADMIN3', selectedZone, selectedCountry, selectedProvince });
                if (selectedProvince) loadMunicipalities(selectedProvince.id);
                break;
        }
    }, [drilldownState]);

    // Build breadcrumb items
    const breadcrumbItems = [
        { label: '🌍 World', onClick: drilldownState.currentLevel !== 'ADMIN0' ? () => setDrilldownState({ currentLevel: 'ADMIN0' }) : undefined }
    ];

    if (drilldownState.selectedZone) {
        breadcrumbItems.push({
            label: drilldownState.selectedZone.zone_name,
            onClick: drilldownState.currentLevel !== 'ADMIN1' ? () => drillToZone(drilldownState.selectedZone!) : undefined
        });
    }

    if (drilldownState.selectedCountry) {
        breadcrumbItems.push({
            label: drilldownState.selectedCountry.megacountry_name,
            onClick: drilldownState.currentLevel !== 'ADMIN2' ? () => drillToCountry(drilldownState.selectedCountry!) : undefined
        });
    }

    if (drilldownState.selectedProvince) {
        breadcrumbItems.push({
            label: drilldownState.selectedProvince.province_name,
            onClick: drilldownState.currentLevel !== 'ADMIN3' ? () => drillToProvince(drilldownState.selectedProvince!) : undefined
        });
    }

    if (drilldownState.selectedMunicipality) {
        breadcrumbItems.push({
            label: drilldownState.selectedMunicipality.municipality_name,
            onClick: undefined
        });
    }

    // Render content based on current level
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12 text-red-400">
                    <p>{error}</p>
                    <button onClick={loadZones} className="mt-2 text-emerald-400 hover:underline">
                        Retry
                    </button>
                </div>
            );
        }

        switch (drilldownState.currentLevel) {
            case 'ADMIN0':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {zones.map(zone => (
                            <TerritoryItem
                                key={zone.id}
                                id={zone.id}
                                name={zone.zone_name}
                                code={zone.zone_code}
                                adminLevel="ADMIN0"
                                commissionRate={COMMISSION_RATES.ADMIN0}
                                isOwned={zone.territory_status === 'owned'}
                                hasBonus={false}
                                childCount={countries.length}
                                onSelect={() => onTerritorySelect?.({ adminLevel: 'ADMIN0', id: zone.id, name: zone.zone_name })}
                                onDrillDown={() => drillToZone(zone)}
                            />
                        ))}
                    </div>
                );

            case 'ADMIN1':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {countries.map(country => (
                            <TerritoryItem
                                key={country.id}
                                id={country.id}
                                name={country.megacountry_name}
                                code={country.megacountry_code}
                                adminLevel="ADMIN1"
                                commissionRate={COMMISSION_RATES.ADMIN1}
                                isOwned={country.territory_status === 'owned'}
                                hasBonus={false}
                                onSelect={() => onTerritorySelect?.({ adminLevel: 'ADMIN1', id: country.id, name: country.megacountry_name })}
                                onDrillDown={() => drillToCountry(country)}
                            />
                        ))}
                    </div>
                );

            case 'ADMIN2':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {provinces.map(province => (
                            <TerritoryItem
                                key={province.id}
                                id={province.id}
                                name={province.province_name}
                                code={province.province_code}
                                adminLevel="ADMIN2"
                                commissionRate={COMMISSION_RATES.ADMIN2}
                                isOwned={province.territory_status === 'owned'}
                                hasBonus={false}
                                onSelect={() => onTerritorySelect?.({ adminLevel: 'ADMIN2', id: province.id, name: province.province_name })}
                                onDrillDown={() => drillToProvince(province)}
                            />
                        ))}
                    </div>
                );

            case 'ADMIN3':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {municipalities.map(municipality => (
                            <TerritoryItem
                                key={municipality.id}
                                id={municipality.id}
                                name={municipality.municipality_name}
                                code={municipality.municipality_code}
                                adminLevel="ADMIN3"
                                commissionRate={COMMISSION_RATES.ADMIN3}
                                isOwned={municipality.territory_status === 'owned'}
                                hasBonus={false}
                                onSelect={() => onTerritorySelect?.({ adminLevel: 'ADMIN3', id: municipality.id, name: municipality.municipality_name })}
                                onDrillDown={() => drillToMunicipality(municipality)}
                            />
                        ))}
                    </div>
                );

            case 'ADMIN4':
            case 'ADMIN5':
                return (
                    <div className="space-y-6">
                        {/* Wards */}
                        {wards.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-red-400" />
                                    Wards
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {wards.map(ward => (
                                        <TerritoryItem
                                            key={ward.id}
                                            id={ward.id}
                                            name={ward.ward_name}
                                            code={ward.ward_code}
                                            adminLevel="ADMIN4"
                                            commissionRate={COMMISSION_RATES.ADMIN4}
                                            isOwned={ward.territory_status === 'owned'}
                                            hasBonus={false}
                                            onSelect={() => onTerritorySelect?.({ adminLevel: 'ADMIN4', id: ward.id, name: ward.ward_name })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cities */}
                        {cities.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-teal-400" />
                                    Cities
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cities.map(city => (
                                        <TerritoryItem
                                            key={city.id}
                                            id={city.id}
                                            name={city.city_name}
                                            code={city.city_code}
                                            adminLevel="ADMIN5"
                                            commissionRate={COMMISSION_RATES.ADMIN5}
                                            isOwned={city.territory_status === 'owned'}
                                            hasBonus={false}
                                            onSelect={() => onTerritorySelect?.({ adminLevel: 'ADMIN5', id: city.id, name: city.city_name })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {wards.length === 0 && cities.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No wards or cities found in this municipality</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`bg-gray-900/50 rounded-2xl border border-gray-800 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${ADMIN_LEVEL_COLORS[drilldownState.currentLevel]}`}>
                            {ADMIN_LEVEL_ICONS[drilldownState.currentLevel]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {ADMIN_LEVEL_NAMES[drilldownState.currentLevel]}s
                            </h2>
                            <p className="text-sm text-gray-400">
                                Select a territory to view details or purchase
                            </p>
                        </div>
                    </div>

                    {drilldownState.currentLevel !== 'ADMIN0' && (
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors text-gray-300"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                </div>

                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Content */}
            <div className="p-4">
                {renderContent()}
            </div>

            {/* MegaFrags Section */}
            {showMegaFrags && frags.length > 0 && drilldownState.currentLevel === 'ADMIN2' && (
                <div className="p-4 border-t border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-amber-400" />
                        MegaFrags in {drilldownState.selectedCountry?.megacountry_name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {frags.slice(0, 6).map(frag => (
                            <TerritoryItem
                                key={frag.id}
                                id={frag.id}
                                name={frag.frag_name}
                                code={frag.frag_code}
                                adminLevel="FRAG"
                                commissionRate={COMMISSION_RATES.FRAG}
                                isOwned={frag.territory_status === 'owned'}
                                hasBonus={false}
                                onSelect={() => onTerritorySelect?.({ adminLevel: 'FRAG', id: frag.id, name: frag.frag_name })}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorldMap;

