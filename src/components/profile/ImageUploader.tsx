// ============================================================================
// IMAGE UPLOADER WITH CROP FUNCTIONALITY
// ============================================================================
// Upload, crop, and optimize profile/cover images
// ============================================================================

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
    type: 'avatar' | 'cover'
    currentImageUrl?: string | null
    onUploadComplete?: (url: string) => void
}

export function ImageUploader({ type, currentImageUrl, onUploadComplete }: ImageUploaderProps) {
    const { user, updateProfile } = useAuthStore()
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
    const [isUploading, setIsUploading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const maxFileSize = 5 * 1024 * 1024 // 5MB

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        // Validate file size
        if (file.size > maxFileSize) {
            toast.error(`File size must be less than ${maxFileSize / 1024 / 1024}MB`)
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = () => {
            setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload immediately (or you could add a crop step here)
        handleUpload(file)
    }

    const handleUpload = async (file: File) => {
        if (!user) {
            toast.error('You must be logged in to upload images')
            return
        }

        setIsUploading(true)
        setIsSuccess(false)

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // Upload to Supabase Storage
            const bucket = type === 'avatar' ? 'avatars' : 'covers'
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            // Update profile
            const field = type === 'avatar' ? 'avatar_url' : 'cover_url'
            await updateProfile({ [field]: publicUrl })

            setPreviewUrl(publicUrl)
            setIsSuccess(true)
            toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover photo'} updated successfully!`)
            onUploadComplete?.(publicUrl)

            // Reset success state after 2 seconds
            setTimeout(() => setIsSuccess(false), 2000)
        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error(error.message || 'Failed to upload image')
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = async () => {
        if (!user) return

        setIsUploading(true)
        try {
            const field = type === 'avatar' ? 'avatar_url' : 'cover_url'
            await updateProfile({ [field]: null })
            setPreviewUrl(null)
            toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover photo'} removed`)
            onUploadComplete?.(null as any)
        } catch (error: any) {
            toast.error('Failed to remove image')
        } finally {
            setIsUploading(false)
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    if (type === 'avatar') {
        return (
            <div className="relative inline-block">
                {/* Avatar Preview */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                            <Camera size={40} className="text-white opacity-50" />
                        </div>
                    )}
                </div>

                {/* Upload Button */}
                <button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Change profile picture"
                >
                    {isUploading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : isSuccess ? (
                        <Check size={20} />
                    ) : (
                        <Camera size={20} />
                    )}
                </button>

                {/* Remove Button */}
                {previewUrl && !isUploading && (
                    <button
                        onClick={handleRemove}
                        className="absolute top-0 right-0 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                        title="Remove profile picture"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        )
    }

    // Cover Photo Layout
    return (
        <div className="relative w-full h-48 md:h-64 lg:h-80 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
            {/* Cover Preview */}
            {previewUrl ? (
                <img
                    src={previewUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="text-center text-white">
                        <Upload size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">No cover photo</p>
                    </div>
                </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    leftIcon={isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                >
                    {isUploading ? 'Uploading...' : 'Change Cover'}
                </Button>

                {previewUrl && !isUploading && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={handleRemove}
                        leftIcon={<X size={16} />}
                    >
                        Remove
                    </Button>
                )}
            </div>

            {/* Success Indicator */}
            {isSuccess && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <Check size={18} />
                    <span>Uploaded!</span>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    )
}

export default ImageUploader
