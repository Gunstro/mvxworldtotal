// ============================================================================
// MEGAVX TERRITORY PAGE
// ============================================================================
// Main page for exploring and purchasing territories
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
    Globe,
    Map,
    LayoutDashboard,
    Landmark,
    Sparkles
} from 'lucide-react';
import { WorldMap, TerritoryPurchaseModal, TerritoryDashboard } from '../components/territory';
import type { AdminLevelCode } from '../types/territory';
import { supabase } from '../lib/supabase';

type TabType = 'map' | 'dashboard' | 'megafrags';

export const TerritoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('map');
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedTerritory, setSelectedTerritory] = useState<{
        adminLevel: AdminLevelCode;
        id: string;
        name: string;
        code: string;
        price: number;
        commissionRate: number;
    } | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleTerritorySelect = (territory: { adminLevel: AdminLevelCode; id: string; name: string }) => {
        // Fetch territory details and show purchase modal
        // For now, use placeholder data
        const commissionRates: Record<AdminLevelCode, number> = {
            'ADMIN0': 2.10,
            'ADMIN1': 3.50,
            'ADMIN2': 4.50,
            'ADMIN3': 5.40,
            'ADMIN4': 6.50,
            'ADMIN5': 6.50,
            'FRAG': 7.50
        };

        setSelectedTerritory({
            ...territory,
            code: `${territory.adminLevel}-${territory.id.slice(0, 8)}`,
            price: 1000, // Would come from API
            commissionRate: commissionRates[territory.adminLevel]
        });
        setIsPurchaseModalOpen(true);
    };

    const handlePurchaseComplete = () => {
        // Refresh the dashboard or map after purchase
        setIsPurchaseModalOpen(false);
        setSelectedTerritory(null);
        // You could trigger a refresh here
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'map', label: 'World Map', icon: <Map className="w-5 h-5" /> },
        { id: 'dashboard', label: 'My Territories', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'megafrags', label: 'MegaFrags', icon: <Landmark className="w-5 h-5" /> }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
            {/* Header */}
            <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">MegaVX Territories</h1>
                                <p className="text-sm text-gray-400">Own the world, earn commissions</p>
                            </div>
                        </div>

                        {/* User info or login prompt */}
                        {userId ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                                    U
                                </div>
                                <span className="text-sm text-gray-300">Connected</span>
                            </div>
                        ) : (
                            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold transition-colors">
                                Connect Wallet
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                  ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }
                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Map Tab */}
                {activeTab === 'map' && (
                    <div className="space-y-6">
                        {/* Hero Section */}
                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl p-8 border border-emerald-500/30">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">
                                        Own a Piece of the Planet
                                    </h2>
                                    <p className="text-gray-300 max-w-2xl">
                                        Purchase territories at any level - from global zones to local wards.
                                        Every sale in your territory earns you automatic commissions.
                                        Start building your global empire today!
                                    </p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-lg px-4 py-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    <span className="text-amber-400 font-medium">Surprise Bonuses Available!</span>
                                </div>
                            </div>

                            {/* Commission Rates */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
                                {[
                                    { level: 'Zone', rate: '2.10%', color: 'from-purple-500 to-indigo-600' },
                                    { level: 'Country', rate: '3.50%', color: 'from-blue-500 to-cyan-600' },
                                    { level: 'Province', rate: '4.50%', color: 'from-green-500 to-emerald-600' },
                                    { level: 'Municipality', rate: '5.40%', color: 'from-yellow-500 to-orange-600' },
                                    { level: 'Ward', rate: '6.50%', color: 'from-red-500 to-pink-600' },
                                    { level: 'City', rate: '6.50%', color: 'from-teal-500 to-cyan-600' },
                                    { level: 'MegaFrag', rate: '7.50%', color: 'from-amber-500 to-yellow-600' }
                                ].map(item => (
                                    <div
                                        key={item.level}
                                        className={`bg-gradient-to-br ${item.color} rounded-lg p-3 text-center`}
                                    >
                                        <div className="text-lg font-bold text-white">{item.rate}</div>
                                        <div className="text-xs text-white/80">{item.level}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* World Map */}
                        <WorldMap
                            onTerritorySelect={handleTerritorySelect}
                            showMegaFrags={true}
                        />
                    </div>
                )}

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && userId && (
                    <TerritoryDashboard
                        userId={userId}
                        onNavigateToMap={() => setActiveTab('map')}
                    />
                )}

                {activeTab === 'dashboard' && !userId && (
                    <div className="text-center py-20">
                        <Globe className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
                        <p className="text-gray-400 mb-6">
                            Connect your wallet or sign in to view your territory dashboard
                        </p>
                        <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg text-white font-semibold transition-all duration-300">
                            Connect Wallet
                        </button>
                    </div>
                )}

                {/* MegaFrags Tab */}
                {activeTab === 'megafrags' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-2xl p-8 border border-amber-500/30">
                            <div className="flex items-center gap-3 mb-4">
                                <Landmark className="w-8 h-8 text-amber-400" />
                                <h2 className="text-3xl font-bold text-white">MegaFrags</h2>
                            </div>
                            <p className="text-gray-300 max-w-3xl">
                                MegaFrags are unique landmarks and points of interest around the world.
                                Own iconic locations like the Eiffel Tower, Grand Canyon, or Machu Picchu.
                                Enable advertising, gamification, and AR/VR experiences to monetize your MegaFrag
                                and let people explore the world virtually!
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-amber-400">7.50%</div>
                                    <div className="text-sm text-gray-400">Commission Rate</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-emerald-400">70%</div>
                                    <div className="text-sm text-gray-400">Ad Revenue Share</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-cyan-400">AR/VR</div>
                                    <div className="text-sm text-gray-400">Experiences</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-400">Games</div>
                                    <div className="text-sm text-gray-400">Gamification</div>
                                </div>
                            </div>
                        </div>

                        {/* MegaFrags would be listed here */}
                        <div className="text-center py-12 text-gray-400">
                            <Landmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>MegaFrag listings coming soon...</p>
                            <p className="text-sm mt-2">Explore countries on the map to find MegaFrags</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Purchase Modal */}
            {selectedTerritory && (
                <TerritoryPurchaseModal
                    isOpen={isPurchaseModalOpen}
                    onClose={() => {
                        setIsPurchaseModalOpen(false);
                        setSelectedTerritory(null);
                    }}
                    territoryData={selectedTerritory}
                    userId={userId || ''}
                    onPurchaseComplete={handlePurchaseComplete}
                />
            )}
        </div>
    );
};

export default TerritoryPage;

