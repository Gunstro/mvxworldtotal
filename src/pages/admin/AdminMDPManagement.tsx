// ============================================================================
// ADMIN MDP MANAGEMENT
// ============================================================================
// View and manage all Message Delivery Points in the system
// ============================================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Bluetooth,
    MapPin,
    Eye,
    Trash2,
    RefreshCw,
    ArrowUp,
    Search,
    Crown,
    Radio,
    Activity,
    CheckCircle,
    XCircle,
    Map as MapIcon,
    List
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MDP {
    id: string
    bluetooth_uuid: string
    device_name: string | null
    device_type: string
    owner_id: string | null
    is_owned: boolean
    is_active: boolean
    is_verified: boolean
    latitude: number | null
    longitude: number | null
    location_name: string | null
    total_impressions: number
    total_earnings: number
    earning_rate: number
    last_seen_at: string
    created_at: string
    owner?: {
        username: string
        display_name: string
    }
}

interface MDPStats {
    totalMDPs: number
    activeMDPs: number
    ownedMDPs: number
    totalImpressions: number
    totalEarnings: number
}

export function AdminMDPManagement() {
    const [mdps, setMdps] = useState<MDP[]>([])
    const [stats, setStats] = useState<MDPStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'owned' | 'unclaimed'>('all')
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Fetch stats
            const { count: totalMDPs } = await supabase
                .from('mdps')
                .select('*', { count: 'exact', head: true })

            const { count: activeMDPs } = await supabase
                .from('mdps')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true)

            const { count: ownedMDPs } = await supabase
                .from('mdps')
                .select('*', { count: 'exact', head: true })
                .eq('is_owned', true)

            const { data: impressionData } = await supabase
                .from('mdps')
                .select('total_impressions, total_earnings')

            const totalImpressions = impressionData?.reduce((sum, m) => sum + (m.total_impressions || 0), 0) || 0
            const totalEarnings = impressionData?.reduce((sum, m) => sum + (parseFloat(m.total_earnings) || 0), 0) || 0

            setStats({
                totalMDPs: totalMDPs || 0,
                activeMDPs: activeMDPs || 0,
                ownedMDPs: ownedMDPs || 0,
                totalImpressions,
                totalEarnings
            })

            // Fetch MDPs with owner info
            const { data: mdpsData } = await supabase
                .from('mdps')
                .select(`
                    *,
                    owner:profiles!mdps_owner_id_fkey (
                        username,
                        display_name
                    )
                `)
                .order('created_at', { ascending: false })

            if (mdpsData) {
                setMdps(mdpsData)
            }

        } catch (error) {
            console.error('Error fetching MDP data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Toggle MDP active status
    const toggleActive = async (mdpId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('mdps')
            .update({ is_active: !currentStatus })
            .eq('id', mdpId)

        if (!error) {
            setMdps(prev => prev.map(m =>
                m.id === mdpId ? { ...m, is_active: !currentStatus } : m
            ))
        }
    }

    // Toggle MDP verified status
    const toggleVerified = async (mdpId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('mdps')
            .update({ is_verified: !currentStatus })
            .eq('id', mdpId)

        if (!error) {
            setMdps(prev => prev.map(m =>
                m.id === mdpId ? { ...m, is_verified: !currentStatus } : m
            ))
        }
    }

    // Delete MDP
    const deleteMDP = async (mdpId: string) => {
        if (!confirm('Are you sure you want to delete this MDP?')) return

        const { error } = await supabase
            .from('mdps')
            .delete()
            .eq('id', mdpId)

        if (!error) {
            setMdps(prev => prev.filter(m => m.id !== mdpId))
            fetchData() // Refresh stats
        }
    }

    // Filter MDPs
    const filteredMDPs = mdps.filter(mdp => {
        const matchesSearch = !searchTerm ||
            mdp.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mdp.bluetooth_uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mdp.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase())

        let matchesStatus = true
        switch (filterStatus) {
            case 'active': matchesStatus = mdp.is_active; break
            case 'inactive': matchesStatus = !mdp.is_active; break
            case 'owned': matchesStatus = mdp.is_owned; break
            case 'unclaimed': matchesStatus = !mdp.is_owned; break
        }

        return matchesSearch && matchesStatus
    })

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading MDP data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0a' }}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                        >
                            <Radio className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">MDP Management</h1>
                            <p className="text-gray-400">Manage all Message Delivery Points</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/mdp/register">
                            <Button style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                                <Bluetooth className="w-4 h-4 mr-2" />
                                Register MDP
                            </Button>
                        </Link>
                        <button
                            onClick={fetchData}
                            className="p-2 rounded-lg transition-colors"
                            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        >
                            <RefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-5 gap-4">
                    <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #3b82f6' }}>
                        <div className="text-3xl font-bold text-blue-400">{stats?.totalMDPs || 0}</div>
                        <div className="text-sm text-gray-400">Total MDPs</div>
                    </Card>
                    <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #22c55e' }}>
                        <div className="text-3xl font-bold text-green-400">{stats?.activeMDPs || 0}</div>
                        <div className="text-sm text-gray-400">Active</div>
                    </Card>
                    <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #d4af37' }}>
                        <div className="text-3xl font-bold text-amber-400">{stats?.ownedMDPs || 0}</div>
                        <div className="text-sm text-gray-400">Owned</div>
                    </Card>
                    <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #9333ea' }}>
                        <div className="text-3xl font-bold text-purple-400">{stats?.totalImpressions || 0}</div>
                        <div className="text-sm text-gray-400">Impressions</div>
                    </Card>
                    <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #f59e0b' }}>
                        <div className="text-3xl font-bold text-orange-400">AF {stats?.totalEarnings?.toFixed(2) || '0.00'}</div>
                        <div className="text-sm text-gray-400">Total Earnings</div>
                    </Card>
                </div>

                {/* Search, Filter, and View Toggle */}
                <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by device name, UUID, or owner..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg"
                                style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#f5f5f5' }}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2 rounded-lg"
                            style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#f5f5f5' }}
                        >
                            <option value="all">All MDPs</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="owned">Owned</option>
                            <option value="unclaimed">Unclaimed</option>
                        </select>

                        {/* View Toggle */}
                        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #333' }}>
                            <button
                                onClick={() => setViewMode('list')}
                                className="px-4 py-2 flex items-center gap-2 transition-colors"
                                style={{
                                    backgroundColor: viewMode === 'list' ? '#3b82f6' : '#0a0a0a',
                                    color: viewMode === 'list' ? 'white' : '#888'
                                }}
                            >
                                <List className="w-4 h-4" />
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className="px-4 py-2 flex items-center gap-2 transition-colors"
                                style={{
                                    backgroundColor: viewMode === 'map' ? '#3b82f6' : '#0a0a0a',
                                    color: viewMode === 'map' ? 'white' : '#888'
                                }}
                            >
                                <MapIcon className="w-4 h-4" />
                                Map
                            </button>
                        </div>
                    </div>
                </Card>

                {/* MAP VIEW */}
                {viewMode === 'map' && (
                    <Card className="p-4 overflow-hidden" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            MDP Locations ({filteredMDPs.filter(m => m.latitude && m.longitude).length} with coordinates)
                        </h3>
                        <div className="h-96 rounded-lg overflow-hidden">
                            <MapContainer
                                center={[-26.2041, 28.0473]} // Johannesburg, South Africa as default
                                zoom={10}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {filteredMDPs
                                    .filter(mdp => mdp.latitude && mdp.longitude)
                                    .map((mdp) => (
                                        <Marker
                                            key={mdp.id}
                                            position={[mdp.latitude!, mdp.longitude!]}
                                        >
                                            <Popup>
                                                <div className="text-sm">
                                                    <div className="font-bold">{mdp.device_name || 'Unknown Device'}</div>
                                                    <div className="text-gray-500 text-xs">{mdp.bluetooth_uuid.slice(0, 20)}...</div>
                                                    <div className="mt-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${mdp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {mdp.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        {mdp.is_owned && (
                                                            <span className="ml-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
                                                                Owned
                                                            </span>
                                                        )}
                                                    </div>
                                                    {mdp.owner && (
                                                        <div className="mt-1 text-xs text-gray-600">
                                                            Owner: {mdp.owner.display_name || mdp.owner.username}
                                                        </div>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                            </MapContainer>
                        </div>
                    </Card>
                )}

                {/* MDPs List */}
                {viewMode === 'list' && (
                    <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            MDPs ({filteredMDPs.length})
                        </h3>

                        {filteredMDPs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Bluetooth className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>No MDPs found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                                            <th className="pb-3">Device</th>
                                            <th className="pb-3">Owner</th>
                                            <th className="pb-3">Location</th>
                                            <th className="pb-3">Impressions</th>
                                            <th className="pb-3">Earnings</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMDPs.map((mdp) => (
                                            <tr key={mdp.id} className="border-b border-gray-800/50 hover:bg-white/5">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: '#3b82f620' }}
                                                        >
                                                            <Bluetooth className="w-5 h-5 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">
                                                                {mdp.device_name || 'Unknown Device'}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-mono">
                                                                {mdp.bluetooth_uuid.slice(0, 16)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {mdp.is_owned && mdp.owner ? (
                                                        <div className="flex items-center gap-2">
                                                            <Crown className="w-4 h-4 text-amber-400" />
                                                            <span className="text-white">
                                                                {mdp.owner.display_name || mdp.owner.username}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Unclaimed</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    {mdp.latitude && mdp.longitude ? (
                                                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                                                            <MapPin className="w-4 h-4" />
                                                            {mdp.latitude.toFixed(2)}, {mdp.longitude.toFixed(2)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-600">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-1 text-purple-400">
                                                        <Eye className="w-4 h-4" />
                                                        {mdp.total_impressions || 0}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-green-400">
                                                        AF {parseFloat(mdp.total_earnings?.toString() || '0').toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs ${mdp.is_active
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-red-500/20 text-red-400'
                                                                }`}
                                                        >
                                                            {mdp.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        {mdp.is_verified && (
                                                            <span title="Verified">
                                                                <CheckCircle className="w-4 h-4 text-blue-400" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleActive(mdp.id, mdp.is_active)}
                                                            className="p-2 rounded hover:bg-white/10 transition-colors"
                                                            title={mdp.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {mdp.is_active ? (
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => toggleVerified(mdp.id, mdp.is_verified)}
                                                            className="p-2 rounded hover:bg-white/10 transition-colors"
                                                            title={mdp.is_verified ? 'Unverify' : 'Verify'}
                                                        >
                                                            <Activity className={`w-4 h-4 ${mdp.is_verified ? 'text-blue-400' : 'text-gray-500'}`} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMDP(mdp.id)}
                                                            className="p-2 rounded hover:bg-red-500/20 transition-colors"
                                                            title="Delete MDP"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                )}

                {/* Back to Top */}
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white'
                    }}
                    title="Back to Top"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}

export default AdminMDPManagement
