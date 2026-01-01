// ============================================================================
// PROFILE EDITOR COMPONENT
// ============================================================================
// Comprehensive profile editing with real-time validation
// ============================================================================

import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
    User,
    MapPin,
    LinkIcon,
    Calendar,
    Heart,
    Save,
    X,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'

interface ProfileEditorProps {
    onClose?: () => void
    inline?: boolean
}

export function ProfileEditor({ onClose, inline = false }: ProfileEditorProps) {
    const { profile, updateProfile } = useAuthStore()
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        display_name: profile?.display_name || '',
        username: profile?.username || '',
        bio: profile?.bio || '',
        location: profile?.location || '',
        website: profile?.website || '',
        date_of_birth: profile?.date_of_birth || '',
        gender: profile?.gender || '',
        relationship_status: profile?.relationship_status || '',
        // Privacy settings
        is_private: profile?.is_private || false,
        show_email: profile?.show_email || false,
        show_phone: profile?.show_phone || false,
        show_location: profile?.show_location || true,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Real-time validation
    const validate = (field: string, value: string | boolean): string | null => {
        switch (field) {
            case 'display_name':
                if (typeof value === 'string') {
                    if (!value.trim()) return 'Display name is required'
                    if (value.length < 2) return 'Display name must be at least 2 characters'
                    if (value.length > 50) return 'Display name must be less than 50 characters'
                }
                break
            case 'username':
                if (typeof value === 'string') {
                    if (!value.trim()) return 'Username is required'
                    if (!/^[a-z0-9_]+$/.test(value)) return 'Username can only contain lowercase letters, numbers, and underscores'
                    if (value.length < 3) return 'Username must be at least 3 characters'
                    if (value.length > 30) return 'Username must be less than 30 characters'
                }
                break
            case 'bio':
                if (typeof value === 'string' && value.length > 500) {
                    return 'Bio must be less than 500 characters'
                }
                break
            case 'website':
                if (typeof value === 'string' && value && !value.match(/^https?:\/\/.+/)) {
                    return 'Website must start with http:// or https://'
                }
                break
        }
        return null
    }

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }

        // Validate
        const error = validate(field, value)
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate all fields
        const newErrors: Record<string, string> = {}
        Object.keys(formData).forEach(key => {
            const error = validate(key, formData[key as keyof typeof formData])
            if (error) newErrors[key] = error
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            toast.error('Please fix the errors before saving')
            return
        }

        setIsSaving(true)
        try {
            await updateProfile(formData)
            toast.success('Profile updated successfully!')
            onClose?.()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const Container = inline ? 'div' : Card

    return (
        <Container className={inline ? '' : 'max-w-2xl mx-auto'} padding={inline ? undefined : 'lg'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>

                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => handleChange('display_name', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.display_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Your name"
                            />
                        </div>
                        {errors.display_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
                                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.username ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="username"
                                disabled={!!profile?.username} // Can't change username after it's set
                            />
                        </div>
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                        )}
                        {profile?.username && (
                            <p className="mt-1 text-sm text-gray-500">Username cannot be changed once set</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.bio ? 'border-red-500' : 'border-gray-300'
                                }`}
                            rows={4}
                            placeholder="Tell us about yourself"
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-gray-500">{formData.bio.length}/500 characters</p>
                            {errors.bio && (
                                <p className="text-sm text-red-600">{errors.bio}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.website ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                        {errors.website && (
                            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                        </label>
                        <select
                            value={formData.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non-binary">Non-binary</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Relationship Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship Status
                        </label>
                        <div className="relative">
                            <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                value={formData.relationship_status}
                                onChange={(e) => handleChange('relationship_status', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select status</option>
                                <option value="single">Single</option>
                                <option value="in_relationship">In a Relationship</option>
                                <option value="engaged">Engaged</option>
                                <option value="married">Married</option>
                                <option value="complicated">It's Complicated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Privacy Settings</h3>

                    <div className="space-y-3">
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Private Profile</span>
                            <input
                                type="checkbox"
                                checked={formData.is_private}
                                onChange={(e) => handleChange('is_private', e.target.checked)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </label>

                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Show Email</span>
                            <input
                                type="checkbox"
                                checked={formData.show_email}
                                onChange={(e) => handleChange('show_email', e.target.checked)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </label>

                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Show Location</span>
                            <input
                                type="checkbox"
                                checked={formData.show_location}
                                onChange={(e) => handleChange('show_location', e.target.checked)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    {onClose && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isSaving || Object.keys(errors).length > 0}
                        leftIcon={isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Container>
    )
}

export default ProfileEditor
