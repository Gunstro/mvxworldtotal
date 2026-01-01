// ============================================================================
// LINKEDIN PROFESSIONAL LAYOUT COMPONENT
// ============================================================================
// Professional profile layout with experience, education, skills
// ============================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    MapPin,
    LinkIcon,
    Calendar,
    Briefcase,
    GraduationCap,
    Award,
    Star,
    MoreHorizontal,
    Settings
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/database'

interface LinkedInLayoutProps {
    profile: Profile & {
        follower_count?: number
        following_count?: number
        post_count?: number
    }
    isOwnProfile?: boolean
}

export function LinkedInLayout({ profile, isOwnProfile }: LinkedInLayoutProps) {
    const [isFollowing, setIsFollowing] = useState(false)

    // Mock data - will be replaced with real data from database
    const currentPosition = "CEO & Founder at MegaVX"
    const headline = "Entrepreneur | Tech Innovator | Building the Future of Social"
    const about = profile.bio || "Professional focused on innovation and growth."

    const experience = [
        {
            title: "CEO & Founder",
            company: "MegaVX World",
            location: "South Africa",
            startDate: "2024",
            endDate: "Present",
            isCurrent: true,
            description: "Building the ultimate social networking platform with multi-layout profiles and blockchain integration."
        }
    ]

    const education = [
        {
            school: "University",
            degree: "Bachelor of Science",
            field: "Computer Science",
            startDate: "2020",
            endDate: "2024"
        }
    ]

    const skills = [
        { name: "Leadership", endorsements: 45 },
        { name: "Strategic Planning", endorsements: 38 },
        { name: "Product Development", endorsements: 32 },
        { name: "Business Strategy", endorsements: 28 },
        { name: "Team Building", endorsements: 25 },
    ]

    return (
        <div className="max-w-4xl mx-auto bg-white">
            {/* Cover Banner - LinkedIn Blue */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-700">
                {profile.cover_url && (
                    <img
                        src={profile.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-lg shadow-md -mt-20 mx-4 mb-4">
                <div className="p-6">
                    {/* Avatar & Header */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="relative">
                            <Avatar
                                src={profile.avatar_url}
                                size="2xl"
                                className="ring-4 ring-white"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {profile.display_name}
                                    </h1>
                                    <p className="text-lg text-gray-700 mt-1">{headline}</p>
                                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                                        {currentPosition && (
                                            <span>{currentPosition}</span>
                                        )}
                                        {profile.location && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {profile.location}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-blue-600 font-medium mt-2">
                                        {profile.follower_count || 0} connections
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {isOwnProfile ? (
                                        <Link to="/settings">
                                            <Button variant="secondary" size="sm">
                                                <Settings size={16} className="mr-1" />
                                                Edit Profile
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <Button
                                                variant={isFollowing ? 'secondary' : 'primary'}
                                                size="sm"
                                                onClick={() => setIsFollowing(!isFollowing)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {isFollowing ? 'Connected' : 'Connect'}
                                            </Button>
                                            <Button variant="secondary" size="sm">
                                                Message
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal size={18} />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md mx-4 mb-4 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {about}
                </p>
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-lg shadow-md mx-4 mb-4 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase size={24} />
                    Experience
                </h2>
                <div className="space-y-6">
                    {experience.map((exp, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                                <Briefcase size={24} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                                <p className="text-gray-700">{exp.company}</p>
                                <p className="text-sm text-gray-500">
                                    {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                                </p>
                                {exp.location && (
                                    <p className="text-sm text-gray-500">{exp.location}</p>
                                )}
                                {exp.description && (
                                    <p className="text-gray-700 mt-2">{exp.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-lg shadow-md mx-4 mb-4 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap size={24} />
                    Education
                </h2>
                <div className="space-y-6">
                    {education.map((edu, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <GraduationCap size={24} className="text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{edu.school}</h3>
                                <p className="text-gray-700">
                                    {edu.degree}{edu.field ? ` - ${edu.field}` : ''}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {edu.startDate} - {edu.endDate}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg shadow-md mx-4 mb-4 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award size={24} />
                    Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <Star size={20} className="text-blue-600" />
                                <span className="font-medium text-gray-900">{skill.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                                {skill.endorsements} endorsements
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LinkedInLayout
