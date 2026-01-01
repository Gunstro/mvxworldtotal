// ============================================================================
// TERRITORY PURCHASE MODAL WITH SURPRISE REVEAL
// ============================================================================
// Modal for purchasing territories with animated surprise bonus reveal
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
    X,
    MapPin,
    PoundSterling,
    Sparkles,
    Gift,
    CheckCircle,
    AlertCircle,
    Loader2,
    TrendingUp,
    Wallet,
    PartyPopper,
    Coins
} from 'lucide-react';
import type { AdminLevelCode, TerritoryPurchaseResult } from '../../types/territory';
import { purchaseTerritory, getTerritoryStatusPublic } from '../../lib/territoryApi';

interface TerritoryPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    territoryData: {
        adminLevel: AdminLevelCode;
        id: string;
        name: string;
        code: string;
        price: number;
        commissionRate: number;
    };
    userId: string;
    onPurchaseComplete?: (result: TerritoryPurchaseResult) => void;
}

type PurchaseStep = 'confirm' | 'processing' | 'revealing' | 'complete' | 'error';

const ADMIN_LEVEL_NAMES: Record<AdminLevelCode, string> = {
    'ADMIN0': 'Zone',
    'ADMIN1': 'Country',
    'ADMIN2': 'Province',
    'ADMIN3': 'Municipality',
    'ADMIN4': 'Ward',
    'ADMIN5': 'City',
    'FRAG': 'MegaFrag'
};

export const TerritoryPurchaseModal: React.FC<TerritoryPurchaseModalProps> = ({
    isOpen,
    onClose,
    territoryData,
    userId,
    onPurchaseComplete
}) => {
    const [step, setStep] = useState<PurchaseStep>('confirm');
    const [hasBonus, setHasBonus] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState<TerritoryPurchaseResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [revealedAmount, setRevealedAmount] = useState(0);

    // Check if territory has bonus on mount
    useEffect(() => {
        if (isOpen) {
            checkForBonus();
        }
    }, [isOpen, territoryData]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep('confirm');
            setPurchaseResult(null);
            setError(null);
            setRevealedAmount(0);
        }
    }, [isOpen]);

    const checkForBonus = async () => {
        try {
            const status = await getTerritoryStatusPublic(
                territoryData.adminLevel,
                territoryData.id
            );
            setHasBonus(status?.has_accrued_bonus || false);
        } catch (err) {
            console.error('Failed to check bonus status:', err);
        }
    };

    const handlePurchase = async () => {
        setStep('processing');
        setError(null);

        try {
            // Simulate payment processing (replace with actual payment integration)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const result = await purchaseTerritory(
                userId,
                territoryData.adminLevel,
                territoryData.id,
                territoryData.name,
                territoryData.price,
                `PAY-${Date.now()}`
            );

            setPurchaseResult(result);

            // If there's a surprise bonus, animate the reveal
            if (result.surprise_bonus > 0) {
                setStep('revealing');
                await animateSurpriseReveal(result.surprise_bonus);
            }

            setStep('complete');
            onPurchaseComplete?.(result);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Purchase failed');
            setStep('error');
        }
    };

    const animateSurpriseReveal = async (finalAmount: number) => {
        const duration = 3000; // 3 seconds
        const steps = 50;
        const interval = duration / steps;

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            // Ease out effect
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentAmount = finalAmount * eased;
            setRevealedAmount(Math.round(currentAmount * 100) / 100);
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        setRevealedAmount(finalAmount);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={step === 'confirm' || step === 'complete' || step === 'error' ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden">
                {/* Close button */}
                {(step === 'confirm' || step === 'complete' || step === 'error') && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Purchase Territory
                            </h2>
                            <p className="text-gray-400">
                                Own this territory and earn commissions on all sales
                            </p>
                        </div>

                        {/* Territory Details */}
                        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Territory</span>
                                <span className="text-white font-semibold">{territoryData.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Type</span>
                                <span className="text-emerald-400">{ADMIN_LEVEL_NAMES[territoryData.adminLevel]}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Commission Rate</span>
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    {territoryData.commissionRate}%
                                </span>
                            </div>
                            <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                                <span className="text-gray-400">Price</span>
                                <span className="text-2xl font-bold text-white flex items-center gap-1">
                                    <PoundSterling className="w-6 h-6" />
                                    £{territoryData.price.toLocaleString('en-GB')}
                                </span>
                            </div>
                        </div>

                        {/* Bonus Hint */}
                        {hasBonus && (
                            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <Gift className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-amber-400 mb-1">
                                        🎁 Surprise Bonus Available!
                                    </h3>
                                    <p className="text-sm text-amber-200/70">
                                        This territory has accrued earnings. Complete your purchase to reveal your bonus!
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Benefits */}
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>Earn {territoryData.commissionRate}% on all sales in this territory</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>Automatic deposits to your wallet</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>Transferable NFT ownership</span>
                            </div>
                        </div>

                        {/* Purchase Button */}
                        <button
                            onClick={handlePurchase}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Wallet className="w-5 h-5" />
                            Complete Purchase
                        </button>
                    </div>
                )}

                {/* Step: Processing */}
                {step === 'processing' && (
                    <div className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Processing Payment
                        </h2>
                        <p className="text-gray-400">
                            Please wait while we process your purchase...
                        </p>
                        <div className="mt-6 flex justify-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                {/* Step: Revealing Surprise */}
                {step === 'revealing' && (
                    <div className="p-6 text-center">
                        {/* Confetti effect (simplified) */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full animate-ping"
                                    style={{
                                        backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'][i % 5],
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 1000}ms`,
                                        animationDuration: '1s'
                                    }}
                                />
                            ))}
                        </div>

                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center animate-bounce">
                            <PartyPopper className="w-12 h-12 text-white" />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">
                            🎉 SURPRISE BONUS!
                        </h2>
                        <p className="text-gray-400 mb-6">
                            You've unlocked the territory's accrued earnings!
                        </p>

                        {/* Animated Amount */}
                        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-center gap-2">
                                <Coins className="w-8 h-8 text-amber-400 animate-pulse" />
                                <span className="text-5xl font-bold text-amber-400 font-mono">
                                    £{revealedAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <p className="text-amber-200/70 mt-2">
                                Credited to your wallet
                            </p>
                        </div>
                    </div>
                )}

                {/* Step: Complete */}
                {step === 'complete' && purchaseResult && (
                    <div className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Congratulations! 🎉
                        </h2>
                        <p className="text-gray-400 mb-6">
                            You now own <span className="text-emerald-400 font-semibold">{territoryData.name}</span>
                        </p>

                        {/* Summary */}
                        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 space-y-3 text-left">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Territory</span>
                                <span className="text-white font-semibold">{territoryData.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Commission Rate</span>
                                <span className="text-emerald-400">{territoryData.commissionRate}%</span>
                            </div>
                            {purchaseResult.surprise_bonus > 0 && (
                                <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                                    <span className="text-amber-400 flex items-center gap-1">
                                        <Sparkles className="w-4 h-4" />
                                        Surprise Bonus
                                    </span>
                                    <span className="text-amber-400 font-bold">
                                        £{purchaseResult.surprise_bonus.toLocaleString('en-GB')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-gray-400 mb-6">
                            All future sales in this territory will automatically earn you commissions!
                        </p>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-lg transition-all duration-300"
                        >
                            View My Territories
                        </button>
                    </div>
                )}

                {/* Step: Error */}
                {step === 'error' && (
                    <div className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Purchase Failed
                        </h2>
                        <p className="text-gray-400 mb-4">
                            {error || 'Something went wrong. Please try again.'}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setStep('confirm');
                                    setError(null);
                                }}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold transition-all duration-300"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerritoryPurchaseModal;

