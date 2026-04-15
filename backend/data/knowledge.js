// ─── AP Newsletter Knowledge Base ────────────────────────────────────────────
// Pre-loaded knowledge that gets seeded into the vector store on startup.
// Add more entries here to expand the AI's specialized knowledge.

const KNOWLEDGE_BASE = [
  {
    content: `Newsletter Growth Fundamentals and Benchmarks:
- Industry average email open rates: 20-25%. Top newsletters achieve 35-55%.
- Average click-through rates: 2-3%. Good newsletters hit 5-10%.
- Welcome email open rates: 50-86% — the highest of any email type.
- Optimal send frequency: 1-2x/week for most audiences; daily only if very high value.
- Best send times (US): Tuesday-Thursday, 9-11 AM or 2-4 PM local time.
- Subject line sweet spot: 30-50 characters, or 6-10 words.
- Personalized subject lines boost open rates by 26% on average.
- Referral programs (SparkLoop, ReferralHero) typically add 20-30% organic growth.
- Re-engagement sequences after 90 days of inactivity recover 10-20% of dormant subscribers.`,
    metadata: { category: 'growth', topic: 'benchmarks' },
  },
  {
    content: `Newsletter Monetization Strategies and Revenue Models:
- Sponsorships: CPM rates range from $20-50 for niche audiences, $5-15 for broad audiences.
- Paid newsletters: $5-20/month for consumer, $50-500/month for B2B/professional.
- Affiliate marketing: works best with products you personally use and trust.
- Digital products (courses, templates, ebooks): 70-90% margin, one-time effort.
- Consulting/coaching: use newsletter as proof of expertise and lead generation.
- Ad networks for newsletters: Paved, Swapstack, SparkLoop for sponsor matching.
- A newsletter with 10,000+ engaged subscribers can earn $5,000-50,000/month.
- Media kit should include: open rate, click rate, subscriber demographics, niche focus.`,
    metadata: { category: 'monetization', topic: 'revenue' },
  },
  {
    content: `Reader Engagement Tactics for Newsletters:
- Ending each email with a single question and asking readers to reply is the #1 engagement tactic.
- Reply rates of 1-5% indicate strong engagement; above 5% is exceptional.
- P.S. sections have very high read rates — ideal for secondary CTAs.
- Plain text emails often outperform HTML for personal, story-driven newsletters.
- Polls and interactive elements boost engagement by 40-50%.
- Naming your reader community creates identity and belonging.
- Story-driven content gets 22x more engagement than pure information.
- "Most-clicked" sections add social proof and drive discovery.
- Quarterly surveys deepen understanding of reader needs and boost loyalty.`,
    metadata: { category: 'engagement', topic: 'tactics' },
  },
  {
    content: `Newsletter Content Strategy and Formats:
- The 80/20 rule: 80% value, 20% promotion. Readers tolerate ads when value is high.
- Consistency in schedule matters more than frequency — pick a cadence and stick to it.
- Unique POV beats comprehensiveness every time — readers want YOUR take.
- Curation newsletters can be produced in 30-60 minutes per issue.
- Long-form deep dives: best for authority building, SEO, and shares.
- Short, scannable formats: better for busy professional audiences.
- Repurposing newsletter content to LinkedIn/Twitter/X drives subscriber discovery.
- Every issue needs: a hook in the subject line, value in the first paragraph, one clear CTA.`,
    metadata: { category: 'content', topic: 'strategy' },
  },
  {
    content: `Best Newsletter Platforms and Tools Comparison:
- Beehiiv: best for growth-focused creators; built-in referral program, ad network, analytics.
- Substack: best for writers wanting built-in discovery and paid subscriptions.
- ConvertKit: best for creators selling products; powerful automation and tagging.
- Mailchimp: best for beginners; easy but expensive at scale.
- Ghost: best for self-hosted, full ownership with membership built in.
- List cleaning tools: ZeroBounce, NeverBounce — essential for deliverability.
- Analytics: UTM parameters + Google Analytics for traffic; native platform analytics for email.
- Writing tools: Hemingway Editor for clarity, Grammarly for polish.
- Landing page builders: Carrd (fastest), Typedream (most beautiful), custom (highest converting).`,
    metadata: { category: 'tools', topic: 'platforms' },
  },
  {
    content: `Email Deliverability Best Practices for Newsletters:
- Authentication: Set up SPF, DKIM, and DMARC records — essential for inbox placement.
- List hygiene: Remove hard bounces immediately; remove soft bounces after 3 attempts.
- Engagement-based sending: segment by engagement level; send less to inactive users.
- Spam trigger words to avoid: "free," "winner," "guaranteed," "click here," "act now."
- Warm up new IP addresses gradually — start with 100/day and double weekly.
- Maintain a complaint rate below 0.1% (Gmail threshold is 0.3%).
- Never buy email lists — damages sender reputation permanently.
- Plain text versions alongside HTML reduce spam scoring.`,
    metadata: { category: 'deliverability', topic: 'technical' },
  },
  {
    content: `AP Newsletter Brand Philosophy and Mission:
- AP Newsletter is a premium black-and-white minimalist newsletter brand.
- Core values: Signal over noise, curated intelligence, zero-compromise quality.
- Target audience: forward-thinking professionals who value depth over breadth.
- Brand aesthetic: luxury minimalism — clean, uncluttered, typographically refined.
- Content pillars: Curated Intelligence, Weekly Deep Insights, Zero Noise Policy, Exclusive Access.
- AP Newsletter delivers one substantial, editor-curated read per week.
- No sponsored content, no clickbait, no algorithm-driven filler.
- Members receive exclusive archive access and early editions.`,
    metadata: { category: 'brand', topic: 'ap_newsletter' },
  },
]

/**
 * Seeds all knowledge base items into the vector store.
 * @param {Function} addToVectorStore - The addToVectorStore function from vectorStore.js
 */
async function seedKnowledge(addToVectorStore) {
  console.log('  📚 Seeding knowledge base...')
  let seeded = 0
  for (const item of KNOWLEDGE_BASE) {
    try {
      await addToVectorStore(item.content, item.metadata)
      seeded++
    } catch (e) {
      console.error(`  ⚠️  Seed error for item ${seeded}:`, e.message)
    }
  }
  console.log(`  ✅ Knowledge base ready (${seeded}/${KNOWLEDGE_BASE.length} items)`)
}

module.exports = { KNOWLEDGE_BASE, seedKnowledge }
