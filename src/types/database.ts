// Database type definitions for Supabase
// These will be auto-generated once connected to a real Supabase project
// For now, we define the core types manually

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Profile, 'id'>>
            }
            posts: {
                Row: Post
                Insert: Omit<Post, 'id' | 'created_at' | 'like_count' | 'comment_count' | 'share_count' | 'view_count'>
                Update: Partial<Omit<Post, 'id' | 'author_id' | 'created_at'>>
            }
            post_likes: {
                Row: PostLike
                Insert: Omit<PostLike, 'id' | 'created_at'>
                Update: Partial<Omit<PostLike, 'id'>>
            }
            comments: {
                Row: Comment
                Insert: Omit<Comment, 'id' | 'created_at' | 'like_count' | 'reply_count'>
                Update: Partial<Omit<Comment, 'id' | 'author_id' | 'created_at'>>
            }
            followers: {
                Row: Follower
                Insert: Omit<Follower, 'id' | 'created_at'>
                Update: Partial<Omit<Follower, 'id'>>
            }
            notifications: {
                Row: Notification
                Insert: Omit<Notification, 'id' | 'created_at'>
                Update: Partial<Omit<Notification, 'id'>>
            }
            megabucks_wallets: {
                Row: MegaBucksWallet
                Insert: Omit<MegaBucksWallet, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<MegaBucksWallet, 'id' | 'user_id'>>
            }
            megabucks_transactions: {
                Row: MegaBucksTransaction
                Insert: Omit<MegaBucksTransaction, 'id' | 'created_at'>
                Update: never
            }
            stories: {
                Row: Story
                Insert: Omit<Story, 'id' | 'created_at' | 'view_count' | 'reaction_count'>
                Update: Partial<Omit<Story, 'id' | 'user_id' | 'created_at'>>
            }
            conversations: {
                Row: Conversation
                Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Conversation, 'id'>>
            }
            messages: {
                Row: Message
                Insert: Omit<Message, 'id' | 'created_at' | 'reaction_count'>
                Update: Partial<Omit<Message, 'id' | 'sender_id' | 'created_at'>>
            }
        }
        Functions: {
            get_feed_posts: {
                Args: { user_id: string; limit_count: number; offset_count: number }
                Returns: Post[]
            }
        }
    }
}

// Core type definitions
export interface Profile {
    id: string
    username: string
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    cover_url: string | null
    website: string | null
    location: string | null
    date_of_birth: string | null
    gender: string | null
    relationship_status: string | null
    is_private: boolean
    show_email: boolean
    show_phone: boolean
    show_location: boolean
    is_verified: boolean
    verified_at: string | null
    verification_badge_type: 'blue' | 'gold' | 'business' | null
    is_active: boolean
    is_banned: boolean
    is_admin?: boolean  // Admin flag
    banned_until: string | null
    ban_reason: string | null
    last_seen: string
    created_at: string
    updated_at: string
    // Multi-layout system
    default_profile_layout?: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'cards'
    twitter_layout_enabled?: boolean
    twitter_layout_privacy?: string
    instagram_layout_enabled?: boolean
    instagram_layout_privacy?: string
    linkedin_layout_enabled?: boolean
    linkedin_layout_privacy?: string
    facebook_layout_enabled?: boolean
    facebook_layout_privacy?: string
    cards_layout_enabled?: boolean
    cards_layout_privacy?: string
    email?: string
    phone?: string
    // Computed fields (from queries)
    follower_count?: number
    following_count?: number
    post_count?: number
}

export interface Post {
    id: string
    author_id: string
    content: string | null
    content_type: 'text' | 'image' | 'video' | 'poll' | 'shared'
    has_media: boolean
    media_count: number
    shared_post_id: string | null
    is_shared: boolean
    visibility: 'public' | 'friends' | 'private' | 'custom'
    is_pinned: boolean
    colored_background: string | null
    feeling: string | null
    location: string | null
    like_count: number
    comment_count: number
    share_count: number
    view_count: number
    is_edited: boolean
    edited_at: string | null
    created_at: string
    is_deleted: boolean
    deleted_at: string | null
    // Joined data
    author?: Profile
    media?: PostMedia[]
    user_like?: PostLike | null
    comments?: Comment[]
    shared_post?: Post | null
}

export interface PostMedia {
    id: string
    post_id: string
    media_type: 'image' | 'video' | 'audio'
    file_url: string
    thumbnail_url: string | null
    file_size: number | null
    width: number | null
    height: number | null
    duration: number | null
    is_processed: boolean
    processing_error: string | null
    display_order: number
    created_at: string
}

export interface PostLike {
    id: string
    post_id: string
    user_id: string
    reaction_type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
    created_at: string
}

export interface Comment {
    id: string
    post_id: string
    author_id: string
    parent_comment_id: string | null
    content: string
    image_url: string | null
    gif_url: string | null
    like_count: number
    reply_count: number
    is_edited: boolean
    edited_at: string | null
    is_deleted: boolean
    deleted_at: string | null
    created_at: string
    // Joined data
    author?: Profile
    replies?: Comment[]
    user_like?: boolean
}

export interface Follower {
    id: string
    follower_id: string
    following_id: string
    status: 'following' | 'pending' | 'blocked'
    created_at: string
    // Joined data
    follower?: Profile
    following?: Profile
}

export interface Notification {
    id: string
    user_id: string
    type: string
    title: string | null
    message: string | null
    related_user_id: string | null
    related_post_id: string | null
    related_comment_id: string | null
    related_entity_type: string | null
    related_entity_id: string | null
    action_url: string | null
    is_read: boolean
    read_at: string | null
    created_at: string
    // Joined data
    related_user?: Profile
    related_post?: Post
}

export interface Story {
    id: string
    user_id: string
    media_type: 'image' | 'video'
    media_url: string
    thumbnail_url: string | null
    duration: number | null
    caption: string | null
    background_color: string | null
    view_count: number
    reaction_count: number
    expires_at: string
    is_expired: boolean
    created_at: string
    // Joined data
    user?: Profile
    viewed?: boolean
}

export interface Conversation {
    id: string
    type: 'direct' | 'group'
    name: string | null
    description: string | null
    avatar_url: string | null
    is_archived: boolean
    is_muted: boolean
    created_by: string | null
    created_at: string
    updated_at: string
    // Joined data
    participants?: ConversationParticipant[]
    last_message?: Message
    unread_count?: number
}

export interface ConversationParticipant {
    id: string
    conversation_id: string
    user_id: string
    role: 'admin' | 'member'
    is_muted: boolean
    custom_color: string | null
    joined_at: string
    left_at: string | null
    last_read_at: string
    // Joined data
    user?: Profile
}

export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string | null
    message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice'
    media_url: string | null
    thumbnail_url: string | null
    file_size: number | null
    file_name: string | null
    reply_to_id: string | null
    forwarded_from_id: string | null
    reaction_count: number
    is_edited: boolean
    edited_at: string | null
    is_deleted: boolean
    deleted_at: string | null
    is_pinned: boolean
    is_favorite: boolean
    created_at: string
    // Joined data
    sender?: Profile
    reply_to?: Message
}

// MegaVX Economic Types
export interface MegaBucksWallet {
    id: string
    user_id: string
    balance: number
    total_earned: number
    total_spent: number
    total_withdrawn: number
    is_frozen: boolean
    frozen_reason: string | null
    created_at: string
    updated_at: string
}

export interface MegaBucksTransaction {
    id: string
    wallet_id: string
    user_id: string
    type: 'earn' | 'spend' | 'transfer_in' | 'transfer_out' | 'withdraw' | 'commission'
    amount: number
    balance_after: number
    description: string | null
    source: string | null
    related_entity_type: string | null
    related_entity_id: string | null
    related_user_id: string | null
    status: 'pending' | 'completed' | 'failed' | 'reversed'
    created_at: string
}

export interface MegaScore {
    id: string
    user_id: string
    total_score: number
    level: number
    content_score: number
    engagement_score: number
    community_score: number
    economic_score: number
    trust_score: number
    global_rank: number | null
    percentile: number | null
    last_calculated: string
    created_at: string
    updated_at: string
}

// Helper types for UI
export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'

export interface FeedPost extends Post {
    author: Profile
    media: PostMedia[]
    user_like: PostLike | null
}

export interface UserWithStats extends Profile {
    follower_count: number
    following_count: number
    post_count: number
    is_following?: boolean
}
