import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import {
    Loader2,
    Users,
    TrendingUp,
    Award,
    List,
    Network,
    UserPlus,
    Copy,
    Check,
    X,
    Send,
    Link2,
    Crown,
    ChevronUp,
    Share2,
    Sparkles
} from 'lucide-react'

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

interface MyPosition {
    id: string
    readable_position: string
    level_depth: number
    level_position: number
    children_count: number
    max_children: number
    sponsor_id: string | null
    visa_type: string
    badge_color: string
}

interface Upline {
    id: string
    position: string
    name: string
    username: string | null
    visa: string | null
    badgeColor: string | null
    level: number
}

export function MyTeamPage() {
    const [myPosition, setMyPosition] = useState<MyPosition | null>(null)
    const [upline, setUpline] = useState<Upline[]>([])
    const [teamTree, setTeamTree] = useState<TreeNode[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal')
    const [stats, setStats] = useState<{
        totalTeam: number
        directReferrals: number
        myLevel: number
        potentialEarnings: number
    } | null>(null)

    // Panning state
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState({ x: 0, y: 0 })
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

    // Invite modal state
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [copied, setCopied] = useState(false)

    const user = useAuthStore((state) => state.user)
    const profile = useAuthStore((state) => state.profile)

    useEffect(() => {
        if (user) {
            fetchMyTeamData()
        }
    }, [user])

    const fetchMyTeamData = async () => {
        if (!user) return

        try {
            // 1. Fetch my position
            const { data: myPos, error: myPosError } = await supabase
                .from('matrix_positions')
                .select(`
                    id,
                    readable_position,
                    level_depth,
                    level_position,
                    children_count,
                    max_children,
                    sponsor_id,
                    visa_id
                `)
                .eq('user_id', user.id)
                .single()

            if (myPosError) {
                console.log('No position found for user')
                setLoading(false)
                return
            }

            // Get visa info
            let visaType = 'Free'
            let badgeColor = '#888'
            if (myPos.visa_id) {
                const { data: visa } = await supabase
                    .from('visas')
                    .select('visa_type, badge_color')
                    .eq('id', myPos.visa_id)
                    .single()
                if (visa) {
                    visaType = visa.visa_type
                    badgeColor = visa.badge_color
                }
            }

            setMyPosition({
                ...myPos,
                visa_type: visaType,
                badge_color: badgeColor
            })

            // 2. Fetch upline (sponsors above me)
            const uplineData: Upline[] = []
            let currentSponsorId = myPos.sponsor_id

            while (currentSponsorId) {
                const { data: sponsor } = await supabase
                    .from('matrix_positions')
                    .select(`
                        id,
                        user_id,
                        readable_position,
                        level_depth,
                        sponsor_id,
                        visa_id
                    `)
                    .eq('id', currentSponsorId)
                    .single()

                if (!sponsor) break

                // Get sponsor profile
                const { data: sponsorProfile } = await supabase
                    .from('profiles')
                    .select('username, display_name')
                    .eq('id', sponsor.user_id)
                    .single()

                // Get sponsor visa
                let sponsorVisa = 'Free'
                let sponsorBadge = '#888'
                if (sponsor.visa_id) {
                    const { data: visa } = await supabase
                        .from('visas')
                        .select('visa_type, badge_color')
                        .eq('id', sponsor.visa_id)
                        .single()
                    if (visa) {
                        sponsorVisa = visa.visa_type
                        sponsorBadge = visa.badge_color
                    }
                }

                uplineData.push({
                    id: sponsor.id,
                    position: sponsor.readable_position,
                    name: sponsorProfile?.display_name || sponsorProfile?.username || 'Unknown',
                    username: sponsorProfile?.username || null,
                    visa: sponsorVisa,
                    badgeColor: sponsorBadge,
                    level: sponsor.level_depth
                })

                currentSponsorId = sponsor.sponsor_id
            }

            setUpline(uplineData.reverse()) // Reverse to show from top down

            // 3. Fetch my downline (team below me)
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
                // Get all profiles and visas
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, username, display_name')

                const { data: visas } = await supabase
                    .from('visas')
                    .select('id, visa_type, badge_color')

                const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
                const visaMap = new Map(visas?.map(v => [v.id, v]) || [])

                // Build tree starting from my position
                const nodeMap = new Map<string, TreeNode>()

                allPositions.forEach((pos: any) => {
                    const posProfile = profileMap.get(pos.user_id)
                    const posVisa = visaMap.get(pos.visa_id)

                    const node: TreeNode = {
                        id: pos.id,
                        position: pos.readable_position || `${pos.level_depth},${pos.level_position}`,
                        name: posProfile?.display_name || posProfile?.username || 'System',
                        username: posProfile?.username || null,
                        visa: posVisa?.visa_type || 'Free',
                        badgeColor: posVisa?.badge_color || '#888',
                        level: pos.level_depth,
                        team: `${pos.children_count}/${pos.max_children}`,
                        parent: '',
                        children: [],
                        isCurrentUser: pos.user_id === user.id
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

                // Get my node and its children
                const myNode = nodeMap.get(myPos.id)
                if (myNode) {
                    setTeamTree([myNode])

                    // Calculate total team size (recursive)
                    const countTeam = (node: TreeNode): number => {
                        return 1 + node.children.reduce((sum, child) => sum + countTeam(child), 0)
                    }

                    const totalTeam = countTeam(myNode) - 1 // Exclude self

                    setStats({
                        totalTeam,
                        directReferrals: myNode.children.length,
                        myLevel: myPos.level_depth,
                        potentialEarnings: totalTeam * 10 // Example: $10 per team member
                    })
                }
            }

            // Generate referral link
            const baseUrl = window.location.origin
            const link = `${baseUrl}/register?ref=${profile?.username || user.id}`
            setReferralLink(link)

        } catch (error) {
            console.error('Error fetching team data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Panning handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsPanning(true)
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return
        setPanOffset({
            x: e.clientX - panStart.x,
            y: e.clientY - panStart.y
        })
    }

    const handleMouseUp = () => {
        setIsPanning(false)
    }

    const handleMouseLeave = () => {
        setIsPanning(false)
    }

    // Invite handlers
    const handleOpenInvite = () => {
        setShowInviteModal(true)
        setCopied(false)
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const closeInviteModal = () => {
        setShowInviteModal(false)
        setCopied(false)
    }

    const renderNode = (node: TreeNode, depth: number = 0) => {
        const indent = depth * 40

        return (
            <div key={node.position} className="mb-2">
                {/* Node Display */}
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${node.isCurrentUser
                        ? 'ring-2 ring-amber-400 bg-amber-500/10'
                        : 'hover:bg-gray-800/50'
                        }`}
                    style={{ marginLeft: `${indent}px` }}
                >
                    {/* Position Badge */}
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

                    {/* User Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                                {node.name}
                                {node.isCurrentUser && <span className="text-amber-400 ml-2">(You)</span>}
                            </span>
                            {node.username && (
                                <span className="text-sm text-gray-400">@{node.username}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                    backgroundColor: node.badgeColor || '#888',
                                    color: '#fff'
                                }}
                            >
                                {node.visa}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Team: {node.team}
                            </span>
                        </div>
                    </div>

                    {/* Level Indicator */}
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Level {node.level}</div>
                        {node.children.length > 0 && (
                            <div className="text-xs text-amber-400">{node.children.length} direct</div>
                        )}
                    </div>
                </div>

                {/* Children */}
                {node.children.length > 0 && (
                    <div className="border-l-2 border-gray-700 ml-4">
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    const renderVerticalNode = (node: TreeNode) => {
        return (
            <div key={node.position} className="flex flex-col items-center">
                {/* Node Card */}
                <div
                    className={`relative p-4 rounded-xl border-2 hover:shadow-lg transition-all min-w-[200px] ${node.isCurrentUser ? 'ring-2 ring-amber-400 shadow-amber-500/20 shadow-lg' : ''
                        }`}
                    style={{
                        backgroundColor: node.isCurrentUser ? '#1f1a0f' : '#1a1a1a',
                        borderColor: node.isCurrentUser ? '#f59e0b' : '#d4af37'
                    }}
                >
                    {/* Current User Indicator */}
                    {node.isCurrentUser && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black">
                            YOU
                        </div>
                    )}

                    {/* Position Badge */}
                    <div
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg font-mono text-xs font-bold"
                        style={{
                            backgroundColor: 'rgba(212, 175, 55, 0.3)',
                            color: '#d4af37',
                            border: '1px solid #d4af37'
                        }}
                    >
                        {node.position}
                    </div>

                    {/* User Info */}
                    <div className="mt-2 text-center">
                        <div className="font-semibold text-white text-sm">{node.name}</div>
                        {node.username && (
                            <div className="text-xs text-gray-400">@{node.username}</div>
                        )}
                    </div>

                    {/* VISA Badge */}
                    <div className="mt-2 flex justify-center">
                        <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                                backgroundColor: node.badgeColor || '#888',
                                color: '#fff'
                            }}
                        >
                            {node.visa}
                        </span>
                    </div>

                    {/* Team Info */}
                    <div className="mt-2 text-center text-xs text-gray-400">
                        <div className="flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            {node.team}
                        </div>
                    </div>
                </div>

                {/* Children Container */}
                {node.children.length > 0 && (
                    <div className="relative mt-8">
                        {/* Vertical Line */}
                        <div
                            className="absolute left-1/2 transform -translate-x-1/2 w-px bg-gray-600"
                            style={{ height: '32px', top: '-32px' }}
                        />

                        {/* Horizontal Line (for multiple children) */}
                        {node.children.length > 1 && (
                            <div
                                className="absolute top-0 bg-gray-600"
                                style={{
                                    height: '1px',
                                    left: `calc(${(1 / node.children.length) * 50}%)`,
                                    right: `calc(${(1 / node.children.length) * 50}%)`
                                }}
                            />
                        )}

                        {/* Children Grid */}
                        <div className="flex gap-8 justify-center">
                            {node.children.map(child => (
                                <div key={child.position} className="relative">
                                    {/* Connecting Line */}
                                    <div
                                        className="absolute left-1/2 transform -translate-x-1/2 w-px bg-gray-600"
                                        style={{ height: '32px', top: '-32px' }}
                                    />
                                    {renderVerticalNode(child)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <span className="ml-3 text-gray-400">Loading your team...</span>
                </div>
            </div>
        )
    }

    if (!myPosition) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Card className="p-8 text-center" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-600/20">
                        <Network className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">You're Not in the Matrix Yet!</h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        To see your genealogy and team, you need to be placed in the matrix.
                        This happens automatically when you upgrade your VISA.
                    </p>
                    <button
                        className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black transition-all"
                    >
                        Upgrade Your VISA
                    </button>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Network className="w-8 h-8 text-amber-400" />
                        My Team
                    </h1>
                    <p className="text-gray-400 mt-1">Your position and genealogy in the matrix</p>
                </div>
                <button
                    onClick={handleOpenInvite}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg hover:shadow-amber-500/25 transition-all"
                >
                    <UserPlus className="w-5 h-5" />
                    Invite New Member
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}>
                                <Crown className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">L{stats.myLevel}</div>
                                <div className="text-sm text-gray-400">My Level</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)' }}>
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.directReferrals}</div>
                                <div className="text-sm text-gray-400">Direct Referrals</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.totalTeam}</div>
                                <div className="text-sm text-gray-400">Total Team</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                                <Sparkles className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">${stats.potentialEarnings}</div>
                                <div className="text-sm text-gray-400">Est. Earnings</div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* My Position Card */}
            <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #d4af37' }}>
                <div className="flex items-center gap-4">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-xl"
                        style={{
                            background: 'linear-gradient(135deg, #d4af37, #f4cf47)',
                            color: '#0a0a0a'
                        }}
                    >
                        {myPosition.readable_position}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white">
                                {profile?.display_name || profile?.username}
                            </h2>
                            <span
                                className="px-3 py-1 rounded-lg text-sm font-medium"
                                style={{
                                    backgroundColor: myPosition.badge_color,
                                    color: '#fff'
                                }}
                            >
                                {myPosition.visa_type} VISA
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span>Level {myPosition.level_depth}</span>
                            <span>•</span>
                            <span>Position {myPosition.level_position}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {myPosition.children_count}/{myPosition.max_children} direct slots filled
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenInvite}
                        className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black transition-all"
                        title="Share your referral link"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </Card>

            {/* Upline Chain */}
            {upline.length > 0 && (
                <Card className="p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ChevronUp className="w-5 h-5 text-amber-400" />
                        My Upline
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {upline.map((sponsor, index) => (
                            <div
                                key={sponsor.id}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                                style={{ backgroundColor: '#111', border: '1px solid #333' }}
                            >
                                <span className="text-amber-400 font-mono text-sm">{sponsor.position}</span>
                                <span className="text-white">{sponsor.name}</span>
                                <span
                                    className="px-2 py-0.5 rounded text-xs"
                                    style={{ backgroundColor: sponsor.badgeColor || '#888', color: '#fff' }}
                                >
                                    {sponsor.visa}
                                </span>
                                {index < upline.length - 1 && <span className="text-gray-600 ml-2">→</span>}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Team Tree View */}
            <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" />
                        My Team Tree
                    </h2>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('horizontal')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'horizontal'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            <span className="text-sm font-medium">List View</span>
                        </button>
                        <button
                            onClick={() => setViewMode('vertical')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'vertical'
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
                {viewMode === 'horizontal' && (
                    <div className="max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {teamTree.length > 0 ? (
                            teamTree.map(node => renderNode(node))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No team members yet. Share your referral link to grow your team!
                            </div>
                        )}
                    </div>
                )}

                {/* Vertical Tree Diagram */}
                {viewMode === 'vertical' && (
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
                            {teamTree.length > 0 ? (
                                <div className="flex justify-center pt-8">
                                    {teamTree.map(node => renderVerticalNode(node))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No team members yet. Share your referral link to grow your team!
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* Invite Modal */}
            {showInviteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={closeInviteModal}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Modal Content */}
                    <div
                        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #d4af37'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="px-6 py-4 flex items-center justify-between"
                            style={{
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))'
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600">
                                    <Send className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Invite New Member</h3>
                                    <p className="text-xs text-gray-400">Share your referral link</p>
                                </div>
                            </div>
                            <button
                                onClick={closeInviteModal}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Position Info */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ backgroundColor: '#111' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="px-3 py-1 rounded-lg font-mono text-sm font-bold"
                                        style={{
                                            backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                            color: '#d4af37',
                                            border: '1px solid #d4af37'
                                        }}
                                    >
                                        {myPosition?.readable_position}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{profile?.display_name || profile?.username}</div>
                                        <div className="text-xs text-gray-400">{myPosition?.children_count}/{myPosition?.max_children} slots filled</div>
                                    </div>
                                </div>
                            </div>

                            {/* Referral Link */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Link2 className="w-4 h-4 text-amber-400" />
                                    Your Referral Link
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={referralLink}
                                        readOnly
                                        className="flex-1 px-4 py-3 rounded-xl text-sm font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        style={{
                                            backgroundColor: '#111',
                                            border: '1px solid #333'
                                        }}
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${copied
                                            ? 'bg-green-500/20 text-green-400 border border-green-500'
                                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg hover:shadow-amber-500/25'
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Share Hint */}
                            <div className="pt-4 border-t border-gray-800">
                                <p className="text-xs text-gray-500 text-center">
                                    Anyone who registers with this link will be placed under you in the matrix
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            className="px-6 py-4 flex gap-3"
                            style={{ backgroundColor: '#111' }}
                        >
                            <button
                                onClick={closeInviteModal}
                                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
