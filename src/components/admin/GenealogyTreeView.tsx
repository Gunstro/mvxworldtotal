import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Loader2, Users, TrendingUp, Award, List, Network, UserPlus, Copy, Check, X, Send, Link2 } from 'lucide-react'

interface TreeNode {
    position: string
    name: string
    username: string | null
    visa: string | null
    badgeColor: string | null
    level: number
    team: string
    parent: string
    children: TreeNode[]
}

export function GenealogyTreeView() {
    const [treeData, setTreeData] = useState<TreeNode[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal')

    // Panning state
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState({ x: 0, y: 0 })
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

    // Invite modal state
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
    const [referralLink, setReferralLink] = useState('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchGenealogyData()
    }, [])

    const fetchGenealogyData = async () => {
        try {
            // Fetch all matrix positions with relationships
            const { data: positions, error } = await supabase
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

            if (error) {
                console.error('Error fetching genealogy:', error)
                throw error
            }

            console.log('Fetched positions:', positions?.length)

            // Fetch profiles separately
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, username, display_name')

            const profileMap = new Map(profilesData?.map(p => [p.id, p]) || [])

            // Fetch visas
            const { data: visasData } = await supabase
                .from('visas')
                .select('id, visa_type, badge_color')

            const visaMap = new Map(visasData?.map(v => [v.id, v]) || [])


            // Build tree structure
            const nodeMap = new Map<string, TreeNode>()
            const roots: TreeNode[] = []

            // Create nodes
            positions?.forEach((pos: any) => {
                const profile = profileMap.get(pos.user_id)
                const visa = visaMap.get(pos.visa_id)

                const node: TreeNode = {
                    position: pos.readable_position || `${pos.level_depth},${pos.level_position}`,
                    name: profile?.display_name || profile?.username || 'System',
                    username: profile?.username || null,
                    visa: visa?.visa_type || 'Free',
                    badgeColor: visa?.badge_color || '#888',
                    level: pos.level_depth,
                    team: `${pos.children_count}/${pos.max_children}`,
                    parent: '',
                    children: []
                }
                nodeMap.set(pos.id, node)
            })

            // Link children to parents
            positions?.forEach((pos: any) => {
                const node = nodeMap.get(pos.id)
                if (!node) return

                if (pos.sponsor_id) {
                    const parent = nodeMap.get(pos.sponsor_id)
                    if (parent) {
                        parent.children.push(node)
                        node.parent = parent.position
                    }
                } else {
                    // Root node
                    roots.push(node)
                }
            })

            setTreeData(roots)

            // Calculate stats
            const totalUsers = positions?.length || 0
            const totalTeamSize = positions?.reduce((sum: number, p: any) => sum + p.children_count, 0) || 0
            const avgTeamSize = totalUsers > 0 ? (totalTeamSize / totalUsers).toFixed(2) : 0

            setStats({
                totalUsers,
                avgTeamSize,
                maxDepth: Math.max(...(positions?.map((p: any) => p.level_depth) || [0]))
            })

        } catch (error) {
            console.error('Error fetching genealogy:', error)
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
    const handleInvite = (node: TreeNode, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent panning when clicking button
        setSelectedNode(node)

        // Generate referral link
        const baseUrl = window.location.origin
        const link = `${baseUrl}/register?ref=${node.username || node.position}`
        setReferralLink(link)
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
        setSelectedNode(null)
        setReferralLink('')
        setCopied(false)
    }

    const renderNode = (node: TreeNode, depth: number = 0) => {
        const indent = depth * 40

        return (
            <div key={node.position} className="mb-2">
                {/* Node Display */}
                <div
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                    style={{ marginLeft: `${indent}px` }}
                >
                    {/* Position Badge */}
                    <div
                        className="px-3 py-1 rounded-lg font-mono text-sm font-bold"
                        style={{
                            backgroundColor: 'rgba(212, 175, 55, 0.2)',
                            color: '#d4af37',
                            border: '1px solid #d4af37'
                        }}
                    >
                        {node.position}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{node.name}</span>
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

                    {/* Invite Button */}
                    <button
                        onClick={(e) => handleInvite(node, e)}
                        className="ml-3 p-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg hover:shadow-amber-500/25 transition-all duration-200 hover:scale-105"
                        title={`Invite to ${node.position}`}
                    >
                        <UserPlus className="w-4 h-4" />
                    </button>
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
                    className="relative p-4 rounded-xl border-2 hover:shadow-lg transition-all min-w-[200px]"
                    style={{
                        backgroundColor: '#1a1a1a',
                        borderColor: '#d4af37'
                    }}
                >
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

                    {/* Invite Button */}
                    <button
                        onClick={(e) => handleInvite(node, e)}
                        className="mt-3 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-medium shadow-lg hover:shadow-amber-500/25 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                        title={`Invite to ${node.position}`}
                    >
                        <UserPlus className="w-3 h-3" />
                        Invite
                    </button>
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
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <span className="ml-3 text-gray-400">Loading genealogy tree...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}>
                                <Users className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                                <div className="text-sm text-gray-400">Total Users</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)' }}>
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.avgTeamSize}</div>
                                <div className="text-sm text-gray-400">Avg Team Size</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                                <Award className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.maxDepth}</div>
                                <div className="text-sm text-gray-400">Max Depth</div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Tree View */}
            <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" />
                        Complete Genealogy Tree
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
                        {treeData.length > 0 ? (
                            treeData.map(node => renderNode(node))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No users in matrix yet
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
                            {treeData.length > 0 ? (
                                <div className="flex justify-center pt-8">
                                    {treeData.map(node => renderVerticalNode(node))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No users in matrix yet
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* Invite Modal */}
            {showInviteModal && selectedNode && (
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
                                    <h3 className="text-lg font-bold text-white">Invite New User</h3>
                                    <p className="text-xs text-gray-400">Position: {selectedNode.position}</p>
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
                            {/* Selected Position Info */}
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
                                        {selectedNode.position}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{selectedNode.name}</div>
                                        <div className="text-xs text-gray-400">Level {selectedNode.level} • {selectedNode.team} team</div>
                                    </div>
                                </div>
                            </div>

                            {/* Referral Link */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Link2 className="w-4 h-4 text-amber-400" />
                                    Referral Link
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
                                    Share this link to invite someone to join under position <strong className="text-amber-400">{selectedNode.position}</strong>
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
                                Cancel
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
