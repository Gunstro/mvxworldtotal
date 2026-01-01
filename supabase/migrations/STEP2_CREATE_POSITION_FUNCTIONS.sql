-- ============================================================================
-- STEP 2: CREATE POSITION CALCULATION FUNCTIONS
-- ============================================================================
-- Helper functions for calculating sponsor and children positions
-- ============================================================================

-- Function: Get max children allowed at each depth level
CREATE OR REPLACE FUNCTION get_max_children_by_depth(p_depth INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE p_depth
        WHEN 0 THEN 20000  -- Poverty Relief can sponsor 20K founders
        WHEN 1 THEN 20     -- Founders can sponsor 20 people each
        WHEN 2 THEN 10     -- Premiere can sponsor 10 people each
        ELSE 5             -- Standard (Level 3+) can sponsor 5 each
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate sponsor position from child position
CREATE OR REPLACE FUNCTION get_sponsor_position(
    p_child_level INTEGER,
    p_child_position BIGINT
)
RETURNS TABLE(sponsor_level INTEGER, sponsor_position BIGINT) AS $$
DECLARE
    v_parent_max_children INTEGER;
BEGIN
    -- Special case: Level 0 (Poverty Relief) has no sponsor
    IF p_child_level <= 0 THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::BIGINT;
        RETURN;
    END IF;
    
    -- Special case: Level 1 always has sponsor at 0,1 (Poverty Relief)
    IF p_child_level = 1 THEN
        RETURN QUERY SELECT 0::INTEGER, 1::BIGINT;
        RETURN;
    END IF;
    
    -- Calculate parent level and max children
    v_parent_max_children := get_max_children_by_depth(p_child_level - 1);
    
    -- Calculate which parent position this child belongs to
    RETURN QUERY SELECT 
        p_child_level - 1,
        CEILING(p_child_position::NUMERIC / v_parent_max_children)::BIGINT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get children position range for a parent
CREATE OR REPLACE FUNCTION get_children_range(
    p_parent_level INTEGER,
    p_parent_position BIGINT
)
RETURNS TABLE(child_level INTEGER, start_pos BIGINT, end_pos BIGINT, max_children INTEGER) AS $$
DECLARE
    v_max_children INTEGER;
BEGIN
    v_max_children := get_max_children_by_depth(p_parent_level);
    
    RETURN QUERY SELECT 
        p_parent_level + 1,
        (p_parent_position - 1) * v_max_children + 1,
        p_parent_position * v_max_children,
        v_max_children;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TESTS
-- ============================================================================

-- Test 1: Get max children at each level
SELECT 
    depth,
    get_max_children_by_depth(depth) as max_children
FROM generate_series(0, 5) as depth;

-- Test 2: Calculate sponsor for sample positions
SELECT 
    child_pos as "Child Position",
    CONCAT('2,', child_pos) as "Child Readable",
    sponsor_level as "Sponsor Level",
    sponsor_position as "Sponsor Position",
    CONCAT(sponsor_level, ',', sponsor_position) as "Sponsor Readable"
FROM generate_series(1, 10) as child_pos,
LATERAL get_sponsor_position(2, child_pos);

-- Test 3: Get children range for Level 1 positions
SELECT 
    parent_pos as "Parent Position",
    CONCAT('1,', parent_pos) as "Parent Readable",
    start_pos as "Children Start",
    end_pos as "Children End",
    CONCAT('2,', start_pos, ' to 2,', end_pos) as "Children Range"
FROM generate_series(1, 5) as parent_pos,
LATERAL get_children_range(1, parent_pos);

-- Success message
SELECT '✅ Step 2 Complete: Position calculation functions created' as status;
