// ============================================================================
// THIS IS ME! - BUSINESS PROFILE PAGE
// ============================================================================
// User's business dashboard showing matrix position, downline, referral links,
// wallet summary, and commission history
// ============================================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Users,
    Crown,
    Share2,
    Copy,
    Check,
    ChevronRight,
    TrendingUp,
    PoundSterling,
    Wallet,
    Gift,
    Sparkles,
    UserPlus,
    Network,
    Loader2,
    ArrowUpRight,
    TreeDeciduous,
    List,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useProfile } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { formatGBP } from '@/utils/currency'

// Types for matrix data
interface MatrixPosition {
    id: string
    user_id: string
    sponsor_id: string | null
    matrix_level: number
    position_number: number
    depth: number
    children_count: number
    max_children: number
    is_full: boolean
    is_orphan: boolean
    is_spillover: boolean
    referrer_user_id: string | null
    visa_id: string
    created_at: string
}

interface WalletData {
    available_balance: number
    pending_balance: number
    this_month_earnings: number
    monthly_cap: number
    total_earned: number
}

interface DownlineUser {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
    visa_type: string
    badge_color: string
    matrix_level: number
    children_count: number
    max_children: number
    joined_at: string
}

interface VisaInfo {
    visa_type: string
    badge_color: string
    monthly_cap: number
    monthly_fee: number
}

// Level names mapping
const LEVEL_NAMES: Record<number, string> = {
    0: 'Poverty Relief',
    1: 'Founder',
    2: 'Premiere',
    3: 'Standard',
}

// Tab types
type TabType = 'overview' | 'matrix' | 'genealogy' | 'referrals' | 'earnings'

// Tree node for genealogy
interface TreeNode {
    id: string
    position: string
    name: string
    username: string | null
    visa: string | null
    badgeColor: string | null
    level: number
    team: string
    parent: string
    children: TreeNode[]
    isCurrentUser?: boolean
}

export function BusinessProfilePage() {
    const profile = useProfile()
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [isLoading, setIsLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    // Data states
    const [matrixPosition, setMatrixPosition] = useState<MatrixPosition | null>(null)
    const [wallet, setWallet] = useState<WalletData | null>(null)
    const [downline, setDownline] = useState<DownlineUser[]>([])
    const [visaInfo, setVisaInfo] = useState<VisaInfo | null>(null)
    const [totalDownlineCount, setTotalDownlineCount] = useState(0)

    // Genealogy tree state
    const [genealogyTree, setGenealogyTree] = useState<TreeNode[]>([])
    const [genealogyViewMode, setGenealogyViewMode] = useState<'horizontal' | 'vertical'>('horizontal')
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState({ x: 0, y: 0 })
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

    // Generate referral link
    const referralLink = profile?.username
        ? `${window.location.origin}/auth?ref=${profile.username}`
        : ''

    // Copy referral link
    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Fetch all data
    useEffect(() => {
        async function fetchBusinessData() {
            if (!profile?.id) return

            setIsLoading(true)
            try {
                // Fetch matrix position
                const { data: positionData } = await supabase
                    .from('matrix_positions')
                    .select('*')
                    .eq('user_id', profile.id)
                    .single()

                if (positionData) {
                    setMatrixPosition(positionData)
                }

                // Fetch wallet data
                const { data: walletData } = await supabase
                    .from('user_wallets')
                    .select('*')
                    .eq('user_id', profile.id)
                    .single()

                if (walletData) {
                    setWallet(walletData)
                }

                // Fetch visa info
                if (positionData?.visa_id) {
                    const { data: visaData } = await supabase
                        .from('visas')
                        .select('visa_type, badge_color, income_cap, monthly_fee')
                        .eq('id', positionData.visa_id)
                        .single()

                    if (visaData) {
                        setVisaInfo({
                            visa_type: visaData.visa_type,
                            badge_color: visaData.badge_color,
                            monthly_cap: parseFloat(visaData.income_cap),
                            monthly_fee: parseFloat(visaData.monthly_fee),
                        })
                    }
                }

                // Fetch direct downline
                if (positionData) {
                    const { data: downlineData } = await supabase
                        .from('matrix_positions')
                        .select(`
                            id,
                            user_id,
                            matrix_level,
                            children_count,
                            max_children,
                            created_at,
                            profiles!matrix_positions_user_id_fkey (
                                username,
                                full_name,
                                avatar_url
                            ),
                            visas!matrix_positions_visa_id_fkey (
                                visa_type,
                                badge_color
                            )
                        `)
                        .eq('sponsor_id', positionData.id)
                        .order('position_number')

                    if (downlineData) {
                        setDownline(downlineData.map((d: any) => ({
                            id: d.id,
                            username: d.profiles?.username || 'Unknown',
                            full_name: d.profiles?.full_name || 'Unknown',
                            avatar_url: d.profiles?.avatar_url,
                            visa_type: d.visas?.visa_type || 'Free',
                            badge_color: d.visas?.badge_color || '#888',
                            matrix_level: d.matrix_level,
                            children_count: d.children_count,
                            max_children: d.max_children,
                            joined_at: d.created_at,
                        })))
                    }

                    // Get total downline count (recursive)
                    const { count } = await supabase
                        .rpc('count_total_downline', { position_id: positionData.id })

                    setTotalDownlineCount(count || 0)
                }

                // Fetch genealogy tree data
                if (positionData) {
                    // Get all positions to build the tree
                    const { data: allPositions } = await supabase
                        .from('matrix_positions')
                        .select(`
                            id,
                            user_id,
                            readable_position,
                            level_depth,
                            level_position,
                            children_count,
                            max_children,
                            sponsor_id,
                            visa_id
                        `)
                        .order('level_depth')
                        .order('level_position')

                    if (allPositions) {
                        // Get all profiles and visas for mapping
                        const { data: allProfiles } = await supabase
                            .from('profiles')
                            .select('id, username, display_name')

                        const { data: allVisas } = await supabase
                            .from('visas')
                            .select('id, visa_type, badge_color')

                        const profileMap = new Map(allProfiles?.map(p => [p.id, p]) || [])
                        const visaMap = new Map(allVisas?.map(v => [v.id, v]) || [])

                        // Build node map
                        const nodeMap = new Map<string, TreeNode>()
                        allPositions.forEach((pos: any) => {
                            const posProfile = profileMap.get(pos.user_id)
                            const posVisa = visaMap.get(pos.visa_id)
                            const node: TreeNode = {
                                id: pos.id,
                                position: pos.readable_position || `${pos.level_depth},${pos.level_position}`,
                                name: posProfile?.display_name || posProfile?.username || 'Unknown',
                                username: posProfile?.username || null,
                                visa: posVisa?.visa_type || 'Free',
                                badgeColor: posVisa?.badge_color || '#888',
                                level: pos.level_depth,
                                team: `${pos.children_count}/${pos.max_children}`,
                                parent: '',
                                children: [],
                                isCurrentUser: pos.user_id === profile.id
                            }
                            nodeMap.set(pos.id, node)
                        })

                        // Link children to parents
                        allPositions.forEach((pos: any) => {
                            const node = nodeMap.get(pos.id)
                            if (!node) return
                            if (pos.sponsor_id) {
                                const parent = nodeMap.get(pos.sponsor_id)
                                if (parent) {
                                    parent.children.push(node)
                                    node.parent = parent.position
                                }
                            }
                        })

                        // Get user's tree
                        const myNode = nodeMap.get(positionData.id)
                        if (myNode) {
                            setGenealogyTree([myNode])
                        }
                    }
                }

            } catch (error) {
                console.error('Error fetching business data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBusinessData()
    }, [profile?.id])

    // Tabs configuration
    const tabs = [
        { id: 'overview' as TabType, icon: TrendingUp, label: 'Overview' },
        { id: 'matrix' as TabType, icon: Network, label: 'My Matrix' },
        { id: 'genealogy' as TabType, icon: TreeDeciduous, label: 'My Team', badge: 'NEW' },
        { id: 'referrals' as TabType, icon: UserPlus, label: 'Referrals' },
        { id: 'earnings' as TabType, icon: PoundSterling, label: 'Earnings' },
    ]

    // Panning handlers for genealogy tree
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsPanning(true)
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return
        setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    }
    const handleMouseUp = () => setIsPanning(false)
    const handleMouseLeave = () => setIsPanning(false)

    // Render genealogy tree node (list view)
    const renderGenealogyNode = (node: TreeNode, depth: number = 0) => {
        const indent = depth * 40
        return (
            <div key={node.position} className="mb-2">
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${node.isCurrentUser ? 'ring-2 ring-amber-400 bg-amber-500/10' : 'hover:bg-gray-800/50'}`}
                    style={{ marginLeft: `${indent}px` }}
                >
                    <div
                        className="px-3 py-1 rounded-lg font-mono text-sm font-bold"
                        style={{
                            backgroundColor: node.isCurrentUser ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.2)',
                            color: '#d4af37',
                            border: node.isCurrentUser ? '2px solid #d4af37' : '1px solid #d4af37'
                        }}
                    >
                        {node.position}
                        {node.isCurrentUser && <span className="ml-2">⭐</span>}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                                {node.name}
                                {node.isCurrentUser && <span className="text-amber-400 ml-2">(You)</span>}
                            </span>
                            {node.username && <span className="text-sm text-gray-400">@{node.username}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: node.badgeColor || '#888', color: '#fff' }}>
                                {node.visa}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Team: {node.team}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Level {node.level}</div>
                        {node.children.length > 0 && <div className="text-xs text-amber-400">{node.children.length} direct</div>}
                    </div>
                </div>
                {node.children.length > 0 && (
                    <div className="border-l-2 border-gray-700 ml-4">
                        {node.children.map(child => renderGenealogyNode(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    // Render genealogy tree node (vertical/diagram view)
    const renderGenealogyVerticalNode = (node: TreeNode) => (
        <div key={node.position} className="flex flex-col items-center">
            <div
                className={`relative p-4 rounded-xl border-2 hover:shadow-lg transition-all min-w-[200px] ${node.isCurrentUser ? 'ring-2 ring-amber-400 shadow-amber-500/20 shadow-lg' : ''}`}
                style={{ backgroundColor: node.isCurrentUser ? '#1f1a0f' : '#1a1a1a', borderColor: node.isCurrentUser ? '#f59e0b' : '#d4af37' }}
            >
                {node.isCurrentUser && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black">YOU</div>
                )}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg font-mono text-xs font-bold" style={{ backgroundColor: 'rgba(212, 175, 55, 0.3)', color: '#d4af37', border: '1px solid #d4af37' }}>
                    {node.position}
                </div>
                <div className="mt-2 text-center">
                    <div className="font-semibold text-white text-sm">{node.name}</div>
                    {node.username && <div className="text-xs text-gray-400">@{node.username}</div>}
                </div>
                <div className="mt-2 flex justify-center">
                    <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: node.badgeColor || '#888', color: '#fff' }}>{node.visa}</span>
                </div>
                <div className="mt-2 text-center text-xs text-gray-400">
                    <div className="flex items-center justify-center gap-1"><Users className="w-3 h-3" />{node.team}</div>
                </div>
            </div>
            {node.children.length > 0 && (
                <div className="relative mt-8">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-px bg-gray-600" style={{ height: '32px', top: '-32px' }} />
                    {node.children.length > 1 && (
                        <div className="absolute top-0 bg-gray-600" style={{ height: '1px', left: `calc(${(1 / node.children.length) * 50}%)`, right: `calc(${(1 / node.children.length) * 50}%)` }} />
                    )}
                    <div className="flex gap-8 justify-center">
                        {node.children.map(child => (
                            <div key={child.position} className="relative">
                                <div className="absolute left-1/2 transform -translate-x-1/2 w-px bg-gray-600" style={{ height: '32px', top: '-32px' }} />
                                {renderGenealogyVerticalNode(child)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
            {/* Header */}
            <div
                className="relative px-4 py-8"
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                    borderBottom: '1px solid #2a2a2a'
                }}
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)' }}
                        >
                            <Crown className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">This is Me!</h1>
                            <p className="text-gray-400">Your Business Profile & Matrix Overview</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-gray-400">Available</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {formatGBP(wallet?.available_balance || 0)}
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-gray-400">This Month</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {formatGBP(wallet?.this_month_earnings || 0)}
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-gray-400">Direct Team</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {matrixPosition?.children_count || 0}
                                <span className="text-sm text-gray-500">/{matrixPosition?.max_children || 5}</span>
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <TreeDeciduous className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-gray-400">Total Network</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {totalDownlineCount}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b" style={{ borderColor: '#2a2a2a' }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-amber-500 text-amber-400'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {'badge' in tab && tab.badge && (
                                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-black font-bold">{tab.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* ============================== */}
                {/* OVERVIEW TAB */}
                {/* ============================== */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Visa Status Card */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Your Visa Status</h2>
                                <Link
                                    to="/wallet"
                                    className="text-sm text-amber-400 hover:underline flex items-center gap-1"
                                >
                                    Upgrade <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: visaInfo?.badge_color || '#888' }}
                                >
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xl font-bold text-white">{visaInfo?.visa_type || 'Free'}</div>
                                    <div className="text-sm text-gray-400">
                                        Level {LEVEL_NAMES[matrixPosition?.matrix_level || 3] || 'Standard'}
                                    </div>
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <span className="text-gray-400">
                                            Cap: <span className="text-white">{formatGBP(visaInfo?.monthly_cap || 95)}/mo</span>
                                        </span>
                                        <span className="text-gray-400">
                                            Fee: <span className="text-white">{formatGBP(visaInfo?.monthly_fee || 0)}/mo</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress to Cap */}
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Monthly Earnings Progress</span>
                                    <span className="text-white">
                                        {formatGBP(wallet?.this_month_earnings || 0)} / {formatGBP(visaInfo?.monthly_cap || 95)}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, ((wallet?.this_month_earnings || 0) / (visaInfo?.monthly_cap || 95)) * 100)}%`,
                                            background: 'linear-gradient(to right, #d4af37, #f4cf47)'
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Referral Link Card */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <Share2 className="w-5 h-5 text-amber-400" />
                                <h2 className="text-lg font-semibold text-white">Your Referral Link</h2>
                            </div>

                            <p className="text-sm text-gray-400 mb-4">
                                Share this link to invite new members to your network. They'll be placed in your matrix tree!
                            </p>

                            <div className="flex gap-2">
                                <div
                                    className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-300 truncate"
                                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #3a3a3a' }}
                                >
                                    {referralLink}
                                </div>
                                <Button
                                    onClick={copyReferralLink}
                                    className="px-4 py-3 flex items-center gap-2"
                                    style={{
                                        background: copied ? '#22c55e' : 'linear-gradient(to right, #d4af37, #c9a227)',
                                        color: '#0a0a0a'
                                    }}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        </Card>

                        {/* Direct Team Preview */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-amber-400" />
                                    <h2 className="text-lg font-semibold text-white">Your Direct Team</h2>
                                </div>
                                <button
                                    onClick={() => setActiveTab('matrix')}
                                    className="text-sm text-amber-400 hover:underline flex items-center gap-1"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {downline.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserPlus className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                                    <p className="text-gray-400">No team members yet</p>
                                    <p className="text-sm text-gray-500 mt-1">Share your referral link to grow your network!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {downline.slice(0, 5).map(member => (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-3 p-3 rounded-lg"
                                            style={{ backgroundColor: '#0a0a0a' }}
                                        >
                                            <Avatar
                                                src={member.avatar_url || ''}
                                                alt={member.username}
                                                size="md"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-white">{member.full_name || member.username}</div>
                                                <div className="text-xs text-gray-400">@{member.username}</div>
                                            </div>
                                            <div
                                                className="px-2 py-1 rounded text-xs font-medium"
                                                style={{ backgroundColor: member.badge_color, color: '#fff' }}
                                            >
                                                {member.visa_type}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* ============================== */}
                {/* MATRIX TAB */}
                {/* ============================== */}
                {activeTab === 'matrix' && (
                    <div className="space-y-6">
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Your Matrix Position</h2>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">Global Position:</span>
                                    <span className="text-amber-400 font-bold">#{matrixPosition?.depth || 1}</span>
                                </div>
                            </div>

                            {/* Matrix Tree Visualization */}
                            <div className="space-y-4">
                                {/* Current User (Root of their view) */}
                                <div
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)',
                                        border: '2px solid #d4af37'
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            src={profile?.avatar_url || ''}
                                            alt={profile?.username || ''}
                                            size="lg"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{profile?.full_name || profile?.username}</span>
                                                <span className="text-xs text-amber-400">(You)</span>
                                            </div>
                                            <div className="text-sm text-gray-400">@{profile?.username}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{ backgroundColor: visaInfo?.badge_color || '#888', color: '#fff' }}
                                                >
                                                    {visaInfo?.visa_type}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {matrixPosition?.children_count}/{matrixPosition?.max_children} slots filled
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Direct Downline */}
                                {downline.length > 0 && (
                                    <div className="pl-6 border-l-2 border-gray-700 ml-6 space-y-3">
                                        {downline.map(member => (
                                            <div
                                                key={member.id}
                                                className="p-4 rounded-xl"
                                                style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar
                                                        src={member.avatar_url || ''}
                                                        alt={member.username}
                                                        size="md"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-white">{member.full_name || member.username}</div>
                                                        <div className="text-xs text-gray-400">@{member.username}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span
                                                                className="px-2 py-0.5 rounded text-xs font-medium"
                                                                style={{ backgroundColor: member.badge_color, color: '#fff' }}
                                                            >
                                                                {member.visa_type}
                                                            </span>
                                                            {member.children_count > 0 && (
                                                                <span className="text-xs text-gray-500">
                                                                    {member.children_count} in team
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                                </div>
                                            </div>
                                        ))}

                                        {/* Empty Slots */}
                                        {matrixPosition && matrixPosition.children_count < matrixPosition.max_children && (
                                            Array.from({ length: matrixPosition.max_children - matrixPosition.children_count }).map((_, i) => (
                                                <div
                                                    key={`empty-${i}`}
                                                    className="p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2"
                                                    style={{ borderColor: '#3a3a3a' }}
                                                >
                                                    <UserPlus className="w-5 h-5 text-gray-500" />
                                                    <span className="text-gray-500">Empty Slot</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {downline.length === 0 && (
                                    <div className="pl-6 border-l-2 border-gray-700 ml-6 space-y-3">
                                        {matrixPosition && Array.from({ length: matrixPosition.max_children }).map((_, i) => (
                                            <div
                                                key={`empty-${i}`}
                                                className="p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2"
                                                style={{ borderColor: '#3a3a3a' }}
                                            >
                                                <UserPlus className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-500">Empty Slot</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* ============================== */}
                {/* GENEALOGY TAB - MY TEAM */}
                {/* ============================== */}
                {activeTab === 'genealogy' && (
                    <div className="space-y-6">
                        {/* Team Tree View */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <TreeDeciduous className="w-5 h-5 text-amber-400" />
                                    My Team Tree
                                </h2 >

                                {/* View Mode Toggle */}
                                <div className="flex gap-2" >
                                    <button
                                        onClick={() => setGenealogyViewMode('horizontal')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${genealogyViewMode === 'horizontal'
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                                            : 'bg-gray-800 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                        <span className="text-sm font-medium">List View</span>
                                    </button>
                                    <button
                                        onClick={() => setGenealogyViewMode('vertical')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${genealogyViewMode === 'vertical'
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                                            : 'bg-gray-800 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Network className="w-4 h-4" />
                                        <span className="text-sm font-medium">Tree Diagram</span>
                                    </button>
                                </div>
                            </div>

                            {/* Horizontal List View */}
                            {genealogyViewMode === 'horizontal' && (
                                <div className="max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                    {genealogyTree.length > 0 ? (
                                        genealogyTree.map(node => renderGenealogyNode(node))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            No team members yet. Share your referral link to grow your team!
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Vertical Tree Diagram */}
                            {genealogyViewMode === 'vertical' && (
                                <div
                                    className="overflow-hidden max-h-[600px] pb-8 select-none"
                                    style={{
                                        scrollbarWidth: 'thin',
                                        cursor: isPanning ? 'grabbing' : 'grab'
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div
                                        className="inline-block min-w-full transition-transform"
                                        style={{
                                            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                                            transitionDuration: isPanning ? '0ms' : '200ms'
                                        }}
                                    >
                                        {genealogyTree.length > 0 ? (
                                            <div className="flex justify-center pt-8">
                                                {genealogyTree.map(node => renderGenealogyVerticalNode(node))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-400">
                                                No team members yet. Share your referral link to grow your team!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tips */}
                            {genealogyViewMode === 'vertical' && (
                                <div className="mt-4 text-center text-xs text-gray-500">
                                    💡 Click and drag to pan around the tree
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* ============================== */}
                {/* REFERRALS TAB */}
                {/* ============================== */}
                {activeTab === 'referrals' && (
                    <div className="space-y-6">
                        {/* Referral Link Card */}
                        <Card
                            className="p-6"
                            style={{
                                background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 100%)',
                                border: '1px solid #d4af37'
                            }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Gift className="w-6 h-6 text-amber-400" />
                                <h2 className="text-xl font-bold text-white">Invite & Earn</h2>
                            </div>

                            <p className="text-gray-300 mb-6">
                                Share your unique referral link and earn <span className="text-amber-400 font-bold">20% commission</span> on
                                every visa purchase from your direct referrals!
                            </p>

                            <div className="flex gap-2">
                                <div
                                    className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-300 truncate font-mono"
                                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #3a3a3a' }}
                                >
                                    {referralLink}
                                </div>
                                <Button
                                    onClick={copyReferralLink}
                                    className="px-6 py-3 flex items-center gap-2 font-bold"
                                    style={{
                                        background: copied ? '#22c55e' : 'linear-gradient(to right, #d4af37, #c9a227)',
                                        color: '#0a0a0a'
                                    }}
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </Button>
                            </div>

                            {/* Share buttons */}
                            <div className="flex gap-3 mt-4">
                                <a
                                    href={`https://wa.me/?text=Join MegaVX World and start earning! ${encodeURIComponent(referralLink)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#25D366', color: '#fff' }}
                                >
                                    WhatsApp
                                </a >
                                <a
                                    href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join MegaVX World!`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#0088cc', color: '#fff' }}
                                >
                                    Telegram
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=Join MegaVX World and start earning!&url=${encodeURIComponent(referralLink)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#1DA1F2', color: '#fff' }}
                                >
                                    Twitter
                                </a>
                            </div >
                        </Card >

                        {/* Commission Structure */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <h2 className="text-lg font-semibold text-white mb-4">Commission Structure</h2>
                            <div className="space-y-3">
                                {[
                                    { level: 1, rate: '20%', desc: 'Direct Referrals' },
                                    { level: 2, rate: '3%', desc: 'Level 2' },
                                    { level: 3, rate: '4%', desc: 'Level 3' },
                                    { level: 4, rate: '5%', desc: 'Level 4' },
                                    { level: 5, rate: '8%', desc: 'Level 5' },
                                ].map(tier => (
                                    <div
                                        key={tier.level}
                                        className="flex items-center justify-between p-3 rounded-lg"
                                        style={{ backgroundColor: '#0a0a0a' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                                style={{
                                                    backgroundColor: tier.level === 1 ? '#d4af37' : '#3a3a3a',
                                                    color: tier.level === 1 ? '#0a0a0a' : '#fff'
                                                }}
                                            >
                                                {tier.level}
                                            </div>
                                            <span className="text-gray-300">{tier.desc}</span>
                                        </div>
                                        <span className="text-amber-400 font-bold">{tier.rate}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Total: 40% of every visa purchase flows up 5 levels
                            </p>
                        </Card >
                    </div >
                )}

                {/* ============================== */}
                {/* EARNINGS TAB */}
                {/* ============================== */}
                {activeTab === 'earnings' && (
                    <div className="space-y-6">
                        {/* Balance Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card
                                className="p-6"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, #121212 100%)',
                                    border: '1px solid #d4af37'
                                }}
                            >
                                <div className="text-sm text-amber-300 mb-1">Available Balance</div>
                                <div className="text-3xl font-bold text-white">
                                    {formatGBP(wallet?.available_balance || 0)}
                                </div>
                            </Card>

                            <Card
                                className="p-6"
                                style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}
                            >
                                <div className="text-sm text-gray-400 mb-1">Pending (10-day hold)</div>
                                <div className="text-3xl font-bold text-white">
                                    {formatGBP(wallet?.pending_balance || 0)}
                                </div>
                            </Card>

                            <Card
                                className="p-6"
                                style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}
                            >
                                <div className="text-sm text-gray-400 mb-1">Total Earned (Lifetime)</div>
                                <div className="text-3xl font-bold text-white">
                                    {formatGBP(wallet?.total_earned || 0)}
                                </div>
                            </Card>
                        </div>

                        {/* Monthly Progress */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <h2 className="text-lg font-semibold text-white mb-4">Monthly Progress</h2>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Earnings This Month</span>
                                    <span className="text-white font-medium">
                                        {formatGBP(wallet?.this_month_earnings || 0)} / {formatGBP(visaInfo?.monthly_cap || 95)}
                                    </span>
                                </div>
                                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, ((wallet?.this_month_earnings || 0) / (visaInfo?.monthly_cap || 95)) * 100)}%`,
                                            background: 'linear-gradient(to right, #22c55e, #16a34a)'
                                        }}
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-gray-400">
                                {(visaInfo?.monthly_cap || 95) - (wallet?.this_month_earnings || 0) > 0 ? (
                                    <>
                                        You can earn <span className="text-amber-400">{formatGBP((visaInfo?.monthly_cap || 95) - (wallet?.this_month_earnings || 0))}</span> more
                                        this month before hitting your cap. Consider upgrading your visa to increase your cap!
                                    </>
                                ) : (
                                    <span className="text-green-400">You've reached your monthly cap! Upgrade your visa to earn more.</span>
                                )}
                            </p>

                            <Link
                                to="/wallet"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium text-sm"
                                style={{
                                    background: 'linear-gradient(to right, #d4af37, #c9a227)',
                                    color: '#0a0a0a'
                                }}
                            >
                                <Sparkles className="w-4 h-4" />
                                Upgrade Visa
                            </Link>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BusinessProfilePage
