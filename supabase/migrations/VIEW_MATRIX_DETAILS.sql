-- ============================================================================
-- VIEW COMPLETE MATRIX POSITION DETAILS
-- ============================================================================
-- Shows all fields for each user's matrix position
-- ============================================================================

SELECT 
    -- User Info
    p.username,
    p.email,
    
    -- Matrix Position Details
    mp.id as matrix_position_id,              -- ✅ Unique ID for this position
    mp.user_id,                                -- User who owns this position
    mp.sponsor_id,                             -- Their sponsor's position ID
    sponsor_user.username as sponsor_username, -- Sponsor's username
    
    -- Position in Tree
    mp.matrix_level,                           -- 0=Poverty Relief, 1=Founder, 2=Premiere, 3+=Standard
    mp.depth,                                  -- How deep in pyramid (0=root, 1=level1, etc)
    mp.position_number,                        -- Their position # under sponsor (1, 2, 3...)
    mp.global_position,                        -- Sequential position in entire tree
    
    -- Team Info
    mp.children_count,                         -- How many direct team members
    mp.max_children,                           -- Max allowed at this level
    mp.is_full,                                -- Can they take more team members?
    
    -- Referral Tracking
    mp.referrer_user_id,                       -- Who referred them (may differ from sponsor)
    referrer.username as referrer_username,    -- Referrer's username
    mp.is_orphan,                              -- TRUE if no referrer
    mp.is_spillover,                           -- TRUE if placed via spillover
    
    -- VISA
    v.visa_type,
    
    -- Timestamps
    mp.created_at,
    mp.updated_at

FROM matrix_positions mp
JOIN profiles p ON mp.user_id = p.id
LEFT JOIN matrix_positions sponsor_pos ON mp.sponsor_id = sponsor_pos.id
LEFT JOIN profiles sponsor_user ON sponsor_pos.user_id = sponsor_user.id
LEFT JOIN profiles referrer ON mp.referrer_user_id = referrer.id
LEFT JOIN visas v ON mp.visa_id = v.id

WHERE mp.matrix_level > 0  -- Exclude Poverty Relief (Level 0)

ORDER BY mp.global_position;

-- Summary
SELECT 
    '✅ Matrix Position Data' as status,
    'Every user has a unique matrix_position_id (UUID)' as note1,
    'Position tracks sponsor, depth, team size, and more' as note2;
