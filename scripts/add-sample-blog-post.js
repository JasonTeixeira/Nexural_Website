/**
 * Add Sample Blog Post Script
 * Creates a sample blog post to test the blog system
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase credentials not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const samplePost = {
  title: 'Getting Started with Algorithmic Trading',
  slug: 'getting-started-with-algorithmic-trading',
  excerpt: 'Learn the fundamentals of algorithmic trading and how to build your first automated trading strategy.',
  content: `
    <h2>Introduction to Algorithmic Trading</h2>
    <p>Algorithmic trading has revolutionized the financial markets, allowing traders to execute strategies with precision and speed that would be impossible manually. In this comprehensive guide, we'll explore the fundamentals of algorithmic trading and help you take your first steps into this exciting field.</p>

    <h2>What is Algorithmic Trading?</h2>
    <p>Algorithmic trading, also known as algo trading or automated trading, involves using computer programs to execute trades based on predefined rules and strategies. These algorithms can analyze market data, identify trading opportunities, and execute orders faster than any human trader.</p>

    <h3>Key Benefits</h3>
    <ul>
      <li><strong>Speed:</strong> Execute trades in milliseconds</li>
      <li><strong>Accuracy:</strong> Eliminate human error and emotional decisions</li>
      <li><strong>Consistency:</strong> Follow your strategy without deviation</li>
      <li><strong>Backtesting:</strong> Test strategies on historical data before risking real capital</li>
      <li><strong>24/7 Trading:</strong> Monitor markets and execute trades around the clock</li>
    </ul>

    <h2>Essential Components</h2>
    <p>To build a successful algorithmic trading system, you need several key components:</p>

    <h3>1. Trading Strategy</h3>
    <p>Your strategy defines when to enter and exit trades. This could be based on technical indicators, price patterns, fundamental data, or a combination of factors.</p>

    <h3>2. Data Feed</h3>
    <p>Real-time and historical market data is crucial. You need reliable data sources for the assets you want to trade.</p>

    <h3>3. Execution System</h3>
    <p>This connects to your broker's API to place orders automatically when your strategy signals a trade.</p>

    <h3>4. Risk Management</h3>
    <p>Proper risk management is essential. Your system should include position sizing, stop losses, and portfolio limits.</p>

    <h2>Getting Started</h2>
    <p>Here's a roadmap for beginners:</p>

    <ol>
      <li><strong>Learn the Basics:</strong> Understand trading fundamentals and market mechanics</li>
      <li><strong>Choose Your Tools:</strong> Select a programming language (Python is popular) and trading platform</li>
      <li><strong>Develop a Strategy:</strong> Start simple with a basic strategy you can understand and test</li>
      <li><strong>Backtest Thoroughly:</strong> Test your strategy on historical data to validate its performance</li>
      <li><strong>Paper Trade:</strong> Run your algorithm in a simulated environment before using real money</li>
      <li><strong>Start Small:</strong> Begin with small position sizes when you go live</li>
      <li><strong>Monitor and Optimize:</strong> Continuously track performance and refine your approach</li>
    </ol>

    <h2>Common Pitfalls to Avoid</h2>
    <ul>
      <li><strong>Overfitting:</strong> Creating a strategy that works perfectly on historical data but fails in live trading</li>
      <li><strong>Ignoring Transaction Costs:</strong> Fees and slippage can significantly impact profitability</li>
      <li><strong>Lack of Risk Management:</strong> Not having proper safeguards can lead to catastrophic losses</li>
      <li><strong>Over-optimization:</strong> Tweaking parameters too much based on past data</li>
      <li><strong>Insufficient Testing:</strong> Going live without thorough backtesting and paper trading</li>
    </ul>

    <h2>Next Steps</h2>
    <p>Ready to dive deeper? Here are some resources to continue your journey:</p>
    <ul>
      <li>Join our trading community for daily insights and support</li>
      <li>Access our library of proven trading strategies</li>
      <li>Get hands-on with our algorithmic trading course</li>
      <li>Connect with experienced algo traders in our Discord</li>
    </ul>

    <h2>Conclusion</h2>
    <p>Algorithmic trading offers tremendous opportunities for those willing to learn and apply themselves. Start with the basics, test thoroughly, and gradually build your skills and confidence. Remember, successful algo trading is a marathon, not a sprint.</p>

    <p><em>Ready to start your algorithmic trading journey? Join Nexural Trading today and get access to our complete suite of tools, strategies, and expert guidance.</em></p>
  `,
  featured_image: null,
  status: 'published',
  published_at: new Date().toISOString(),
  is_featured: true,
  allow_comments: true,
  reading_time: 8,
  views: 0,
  meta_title: 'Getting Started with Algorithmic Trading | Nexural Trading',
  meta_description: 'Learn the fundamentals of algorithmic trading and how to build your first automated trading strategy. Complete guide for beginners.',
  og_image: null
}

async function addSamplePost() {
  console.log('\n🚀 Adding Sample Blog Post...\n')
  console.log('=' .repeat(60))

  try {
    // Insert the post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert([samplePost])
      .select()
      .single()

    if (postError) {
      console.error('❌ Error creating post:', postError.message)
      process.exit(1)
    }

    console.log('✅ Sample post created successfully!')
    console.log(`\n📝 Post Details:`)
    console.log(`   Title: ${post.title}`)
    console.log(`   Slug: ${post.slug}`)
    console.log(`   Status: ${post.status}`)
    console.log(`   Featured: ${post.is_featured ? 'Yes' : 'No'}`)
    console.log(`   Reading Time: ${post.reading_time} minutes`)

    // Create a sample category
    console.log('\n📁 Creating sample category...')
    const { data: category, error: categoryError } = await supabase
      .from('blog_categories')
      .insert([{
        name: 'Trading Strategies',
        slug: 'trading-strategies',
        description: 'Learn proven trading strategies and techniques',
        post_count: 0
      }])
      .select()
      .single()

    if (categoryError && categoryError.code !== '23505') { // Ignore duplicate error
      console.error('⚠️  Category creation warning:', categoryError.message)
    } else if (category) {
      console.log('✅ Category created: Trading Strategies')

      // Link post to category
      const { error: linkError } = await supabase
        .from('blog_post_categories')
        .insert([{
          post_id: post.id,
          category_id: category.id
        }])

      if (linkError) {
        console.error('⚠️  Category link warning:', linkError.message)
      } else {
        console.log('✅ Post linked to category')
      }
    }

    // Create sample tags
    console.log('\n🏷️  Creating sample tags...')
    const tags = [
      { name: 'Algorithmic Trading', slug: 'algorithmic-trading' },
      { name: 'Beginners Guide', slug: 'beginners-guide' },
      { name: 'Trading Basics', slug: 'trading-basics' }
    ]

    for (const tagData of tags) {
      const { data: tag, error: tagError } = await supabase
        .from('blog_tags')
        .insert([{ ...tagData, usage_count: 0 }])
        .select()
        .single()

      if (tagError && tagError.code !== '23505') {
        console.error(`⚠️  Tag creation warning for "${tagData.name}":`, tagError.message)
      } else if (tag) {
        console.log(`✅ Tag created: ${tag.name}`)

        // Link post to tag
        const { error: linkError } = await supabase
          .from('blog_post_tags')
          .insert([{
            post_id: post.id,
            tag_id: tag.id
          }])

        if (linkError) {
          console.error(`⚠️  Tag link warning for "${tag.name}":`, linkError.message)
        }
      }
    }

    console.log('\n' + '=' .repeat(60))
    console.log('🎉 SUCCESS! Sample blog post added!\n')
    console.log('📍 View your blog at:')
    console.log('   Homepage: http://localhost:3000/blog')
    console.log(`   Post: http://localhost:3000/blog/${post.slug}`)
    console.log('\n💡 Tip: You can now see the blog in action!')
    console.log('=' .repeat(60) + '\n')

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  }
}

// Run the script
addSamplePost()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
