// ============================================================================
// BLUETOOTH MDP REGISTRATION
// ============================================================================
// Scan for Bluetooth devices and register them as Message Delivery Points
// ============================================================================

import { useState, useEffect } from 'react'
import {
    Bluetooth,
    MapPin,
    Radio,
    CheckCircle,
    AlertCircle,
    Loader2,
    Smartphone,
    Crown,
    RefreshCw,
    Plus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/stores/authStore'

interface BluetoothDevice {
    id: string
    name: string | null
    connected: boolean
}

interface MDP {
    id: string
    bluetooth_uuid: string
    device_name: string | null
    owner_id: string | null
    is_owned: boolean
    latitude: number | null
    longitude: number | null
    location_name: string | null
    created_at: string
}

export function BluetoothMDPRegister() {
    const profile = useProfile()
    const [isScanning, setIsScanning] = useState(false)
    const [bluetoothSupported, setBluetoothSupported] = useState(true)
    const [detectedDevices, setDetectedDevices] = useState<BluetoothDevice[]>([])
    const [registeredMDPs, setRegisteredMDPs] = useState<MDP[]>([])
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
    const [isRegistering, setIsRegistering] = useState<string | null>(null)

    // Check Bluetooth support and get location on mount
    useEffect(() => {
        // Check if Web Bluetooth is supported
        if (!navigator.bluetooth) {
            setBluetoothSupported(false)
        }

        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (error) => {
                    console.warn('Geolocation error:', error)
                }
            )
        }

        // Load user's registered MDPs
        loadUserMDPs()
    }, [profile?.id])

    const loadUserMDPs = async () => {
        if (!profile?.id) return

        const { data, error } = await supabase
            .from('mdps')
            .select('*')
            .eq('owner_id', profile.id)
            .order('created_at', { ascending: false })

        if (data) {
            setRegisteredMDPs(data)
        }
    }

    // Scan for Bluetooth devices
    const scanForDevices = async () => {
        if (!navigator.bluetooth) {
            setMessage({ type: 'error', text: 'Bluetooth not supported in this browser' })
            return
        }

        setIsScanning(true)
        setMessage(null)

        try {
            // Request Bluetooth device - this will show the browser's device picker
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['battery_service', 'device_information']
            })

            const newDevice: BluetoothDevice = {
                id: device.id,
                name: device.name || 'Unknown Device',
                connected: false
            }

            // Check if already in detected list
            if (!detectedDevices.find(d => d.id === device.id)) {
                setDetectedDevices(prev => [...prev, newDevice])
            }

            setMessage({ type: 'success', text: `Found device: ${newDevice.name}` })

        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                setMessage({ type: 'info', text: 'No device selected' })
            } else {
                setMessage({ type: 'error', text: error.message || 'Scan failed' })
            }
        } finally {
            setIsScanning(false)
        }
    }

    // Register device as MDP
    const registerAsMDP = async (device: BluetoothDevice) => {
        if (!profile?.id) {
            setMessage({ type: 'error', text: 'Please log in to register devices' })
            return
        }

        setIsRegistering(device.id)

        try {
            // Check if this device is already registered
            const { data: existing } = await supabase
                .from('mdps')
                .select('id, owner_id, is_owned')
                .eq('bluetooth_uuid', device.id)
                .single()

            if (existing) {
                if (existing.is_owned) {
                    setMessage({ type: 'error', text: 'This device is already registered and owned!' })
                } else {
                    // Claim ownership of unclaimed MDP
                    const { error } = await supabase
                        .from('mdps')
                        .update({
                            owner_id: profile.id,
                            is_owned: true,
                            claimed_at: new Date().toISOString(),
                            claimed_by: profile.id
                        })
                        .eq('id', existing.id)

                    if (error) throw error
                    setMessage({ type: 'success', text: '🎉 You claimed this MDP!' })
                }
            } else {
                // Register new MDP
                const { error } = await supabase
                    .from('mdps')
                    .insert({
                        bluetooth_uuid: device.id,
                        device_name: device.name,
                        device_type: 'phone',
                        owner_id: profile.id,
                        is_owned: true,
                        claimed_at: new Date().toISOString(),
                        claimed_by: profile.id,
                        latitude: userLocation?.lat,
                        longitude: userLocation?.lng,
                        is_active: true
                    })

                if (error) throw error
                setMessage({ type: 'success', text: '🎉 MDP registered! You now own this device.' })
            }

            // Refresh MDPs list
            await loadUserMDPs()

            // Remove from detected list
            setDetectedDevices(prev => prev.filter(d => d.id !== device.id))

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Registration failed' })
        } finally {
            setIsRegistering(null)
        }
    }

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0a' }}>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                        >
                            <Bluetooth className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Message Delivery Points</h1>
                            <p className="text-gray-400">Register Bluetooth devices as advertising triggers</p>
                        </div>
                    </div>
                </div>

                {/* Bluetooth Not Supported Warning */}
                {!bluetoothSupported && (
                    <Card className="p-4" style={{ backgroundColor: '#dc262620', border: '1px solid #dc2626' }}>
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <div>
                                <div className="font-medium text-red-400">Bluetooth Not Supported</div>
                                <div className="text-sm text-red-300">Use Chrome on Android or enable Web Bluetooth</div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Location Status */}
                <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300">
                                {userLocation
                                    ? `Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                                    : 'Location not available'
                                }
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                navigator.geolocation?.getCurrentPosition(
                                    (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                                )
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                            Refresh Location
                        </button>
                    </div>
                </Card>

                {/* Scan Button */}
                <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                    <div className="text-center">
                        <Button
                            onClick={scanForDevices}
                            disabled={isScanning || !bluetoothSupported}
                            className="px-8 py-4 text-lg"
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                opacity: isScanning || !bluetoothSupported ? 0.5 : 1
                            }}
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Radio className="w-5 h-5 mr-2" />
                                    Scan for Bluetooth Devices
                                </>
                            )}
                        </Button>
                        <p className="text-gray-500 text-sm mt-3">
                            Your browser will ask you to select a nearby Bluetooth device
                        </p>
                    </div>
                </Card>

                {/* Message */}
                {message && (
                    <Card
                        className="p-4"
                        style={{
                            backgroundColor: message.type === 'error' ? '#dc262620' :
                                message.type === 'success' ? '#22c55e20' : '#3b82f620',
                            border: `1px solid ${message.type === 'error' ? '#dc2626' :
                                message.type === 'success' ? '#22c55e' : '#3b82f6'}`
                        }}
                    >
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : message.type === 'error' ? (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-blue-400" />
                            )}
                            <span className={
                                message.type === 'error' ? 'text-red-300' :
                                    message.type === 'success' ? 'text-green-300' : 'text-blue-300'
                            }>
                                {message.text}
                            </span>
                        </div>
                    </Card>
                )}

                {/* Detected Devices */}
                {detectedDevices.length > 0 && (
                    <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #3b82f6' }}>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-blue-400" />
                            Detected Devices
                        </h3>
                        <div className="space-y-3">
                            {detectedDevices.map((device) => (
                                <div
                                    key={device.id}
                                    className="flex items-center justify-between p-4 rounded-lg"
                                    style={{ backgroundColor: '#0a0a0a' }}
                                >
                                    <div>
                                        <div className="font-medium text-white">{device.name || 'Unknown Device'}</div>
                                        <div className="text-xs text-gray-500 font-mono">{device.id}</div>
                                    </div>
                                    <Button
                                        onClick={() => registerAsMDP(device)}
                                        disabled={isRegistering === device.id}
                                        className="px-4 py-2"
                                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                                    >
                                        {isRegistering === device.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-1" />
                                                Claim MDP
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* My Registered MDPs */}
                <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #d4af37' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Crown className="w-5 h-5 text-amber-400" />
                            My Owned MDPs ({registeredMDPs.length})
                        </h3>
                        <button onClick={loadUserMDPs} className="text-gray-400 hover:text-white">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {registeredMDPs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Bluetooth className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No MDPs registered yet</p>
                            <p className="text-sm">Scan for devices to claim your first MDP!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {registeredMDPs.map((mdp) => (
                                <div
                                    key={mdp.id}
                                    className="flex items-center justify-between p-4 rounded-lg"
                                    style={{ backgroundColor: '#0a0a0a' }}
                                >
                                    <div>
                                        <div className="font-medium text-white flex items-center gap-2">
                                            <Bluetooth className="w-4 h-4 text-blue-400" />
                                            {mdp.device_name || 'Unknown Device'}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-1">
                                            {mdp.bluetooth_uuid.slice(0, 20)}...
                                        </div>
                                        {mdp.latitude && mdp.longitude && (
                                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {mdp.latitude.toFixed(4)}, {mdp.longitude.toFixed(4)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-400 font-medium">Active</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(mdp.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default BluetoothMDPRegister
