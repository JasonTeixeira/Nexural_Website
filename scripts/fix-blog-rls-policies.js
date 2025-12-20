/**
 * Fix Blog RLS Policies Script
 * Automatically updates RLS policies to allow blog operations
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Supabase credentials not found in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const RLS_FIX_SQL = `
-- ============================================================
-- FIX BLOG RLS POLICIES
-- ============================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "blog_posts_select_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete_policy" ON blog_posts;

DROP POLICY IF EXISTS "blog_categories_select_policy" ON blog_categories;
DROP POLICY IF EXISTS "blog_categories_insert_policy" ON blog_categories;
DROP POLICY IF EXISTS "blog_categories_update_policy" ON blog_categories;
DROP POLICY IF EXISTS "blog_categories_delete_policy" ON blog_categories;

DROP POLICY IF EXISTS "blog_tags_select_policy" ON blog_tags;
DROP POLICY IF EXISTS "blog_tags_insert_policy" ON blog_tags;
DROP POLICY IF EXISTS "blog_tags_update_policy" ON blog_tags;
DROP POLICY IF EXISTS "blog_tags_delete_policy" ON blog_tags;

-- ============================================================
-- BLOG POSTS POLICIES
-- ============================================================

CREATE POLICY "blog_posts_select_policy" ON blog_posts
  FOR SELECT USING (true);

CREATE POLICY "blog_posts_insert_policy" ON blog_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "blog_posts_update_policy" ON blog_posts
  FOR UPDATE USING (true);

CREATE POLICY "blog_posts_delete_policy" ON blog_posts
  FOR DELETE USING (true);

-- ============================================================
-- BLOG CATEGORIES POLICIES
-- ============================================================

CREATE POLICY "blog_categories_select_policy" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "blog_categories_insert_policy" ON blog_categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "blog_categories_update_policy" ON blog_categories
  FOR UPDATE USING (true);

CREATE POLICY "blog_categories_delete_policy" ON blog_categories
  FOR DELETE USING (true);

-- ============================================================
-- BLOG TAGS POLICIES
-- ============================================================

CREATE POLICY "blog_tags_select_policy" ON blog_tags
  FOR SELECT USING (true);

CREATE POLICY "blog_tags_insert_policy" ON blog_tags
  FOR INSERT WITH CHECK (true);

CREATE POLICY "blog_tags_update_policy" ON blog_tags
  FOR UPDATE USING (true);

CREATE POLICY "blog_tags_delete_policy" ON blog_tags
  FOR DELETE USING (true);

-- ============================================================
-- JUNCTION TABLES POLICIES
-- ============================================================

CREATE POLICY "blog_post_categories_select_policy" ON blog_post_categories
  FOR SELECT USING (true);

CREATE POLICY "blog_post_categories_insert_policy" ON blog_post_categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "blog_post_categories_update_policy" ON blog_post_categories
  FOR UPDATE USING (true);

CREATE POLICY "blog_post_categories_delete_policy" ON blog_post_categories
  FOR DELETE USING (true);

CREATE POLICY "blog_post_tags_select_policy" ON blog_post_tags
  FOR SELECT USING (true);

CREATE POLICY "blog_post_tags_insert_policy" ON blog_post_tags
  FOR INSERT WITH CHECK (true);

CREATE POLICY "blog_post_tags_update_policy" ON blog_post_tags
  FOR UPDATE USING (true);

CREATE POLICY "blog_post_tags_delete_policy" ON blog_post_tags
  FOR DELETE USING (true);
`

async function fixRLSPolicies() {
  console.log('\n🔧 Fixing Blog RLS Policies...\n')
  console.log('=' .repeat(60))

  try {
    console.log('📝 Executing SQL to update RLS policies...')
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: RLS_FIX_SQL 
    })

    if (error) {
      console.error('\n❌ Error updating RLS policies via RPC')
      console.error('   This method requires a custom function.')
      console.error('\n📋 MANUAL FIX REQUIRED:')
      console.error('   1. Go to Supabase Dashboard → SQL Editor')
      console.error('   2. Copy SQL from FIX_BLOG_RLS_POLICIES.md')
      console.error('   3. Paste and run the SQL')
      console.error('\n   OR')
      console.error('\n   1. Go to Supabase Dashboard → Table Editor')
      console.error('   2. For each blog table, toggle RLS OFF')
      console.error('\n' + '=' .repeat(60))
      process.exit(1)
    }

    console.log('✅ RLS policies updated successfully!')
    console.log('\n' + '=' .repeat(60))
    console.log('🎉 SUCCESS! Blog RLS policies are now fixed!\n')
    console.log('Next steps:')
    console.log('  1. Run: node scripts/add-sample-blog-post.js')
    console.log('  2. Refresh your blog page')
    console.log('  3. You should see posts!')
    console.log('=' .repeat(60) + '\n')

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error('\n📋 MANUAL FIX REQUIRED:')
    console.error('   Please follow instructions in FIX_BLOG_RLS_POLICIES.md')
    console.error('=' .repeat(60) + '\n')
    process.exit(1)
  }
}

// Run the script
fixRLSPolicies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
