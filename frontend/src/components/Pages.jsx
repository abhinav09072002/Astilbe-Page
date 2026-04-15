import React from 'react'
import { Link } from 'react-router-dom'
import { PageHero, Card, SectionLabel, Button } from './ui.jsx'
import APLogo from './APLogo.jsx'

// ─── Shared page wrapper (Navbar-aware) ───────────────────────────────────────
function PageLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Simple top bar for inner pages */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(14px,2.5vw,20px) clamp(20px,5vw,48px)',
        background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid rgba(255,255,255,.07)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <APLogo size={40} inverted />
        </Link>
        <Link to="/" style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', textDecoration: 'none', borderBottom: '0.5px solid rgba(255,255,255,.15)', paddingBottom: 1, transition: 'color .2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.7)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.3)'}
        >← Back to home</Link>
      </div>
      <div style={{ paddingTop: 72 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Shared grid section ──────────────────────────────────────────────────────
function FeatureGrid({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', border: '0.5px solid rgba(255,255,255,.07)' }}>
      {items.map((item, i) => (
        <div key={i} style={{ padding: 'clamp(24px,4vw,40px) clamp(20px,3.5vw,36px)', borderRight: (i + 1) % 3 !== 0 ? '0.5px solid rgba(255,255,255,.07)' : 'none', borderBottom: i < items.length - Math.ceil(items.length / 3) ? '0.5px solid rgba(255,255,255,.07)' : 'none' }}>
          <div style={{ fontSize: 24, marginBottom: 14 }}>{item.icon}</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(18px,2.5vw,22px)', fontWeight: 400, color: '#fff', marginBottom: 10 }}>{item.title}</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', lineHeight: 1.7, letterSpacing: '.025em' }}>{item.desc}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Stats row ────────────────────────────────────────────────────────────────
function StatsRow({ stats }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', border: '0.5px solid rgba(255,255,255,.07)' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ flex: '1 1 200px', padding: 'clamp(24px,4vw,40px)', borderRight: i < stats.length - 1 ? '0.5px solid rgba(255,255,255,.07)' : 'none', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,5vw,54px)', fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: 8 }}>{s.value}</p>
          <p style={{ fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)' }}>{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── PAGE: Platform ───────────────────────────────────────────────────────────
export function PlatformPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Platform"
        title="The infrastructure for ambitious newsletters."
        subtitle="AP Newsletter gives you every tool to write, grow, and monetize your newsletter — in one seamlessly integrated platform."
      />
      <section style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,6vw,80px)' }}>
        <SectionLabel>Core Features</SectionLabel>
        <FeatureGrid items={PLATFORM_FEATURES} />
      </section>
      <section style={{ padding: '0 clamp(24px,6vw,80px) clamp(48px,8vw,80px)' }}>
        <StatsRow stats={[{ value:'99.9%', label:'Deliverability Rate' }, { value:'< 2s', label:'Send Latency' }, { value:'∞', label:'Subscriber Limit' }, { value:'24/7', label:'Support' }]} />
      </section>
      <section style={{ padding: '0 clamp(24px,6vw,80px) clamp(60px,10vw,100px)' }}>
        <Card style={{ padding: 'clamp(32px,5vw,60px)', textAlign: 'center' }}>
          <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 20 }}>Ready to start?</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: 300, color: '#fff', marginBottom: 24 }}>Launch your newsletter today.</h2>
          <Link to="/signup"><Button>Get Started Free</Button></Link>
        </Card>
      </section>
    </PageLayout>
  )
}

// ─── PAGE: Solutions ──────────────────────────────────────────────────────────
export function SolutionsPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Solutions"
        title="Built for every kind of publisher."
        subtitle="Whether you're an independent creator, a startup building an audience, or an enterprise media brand — AP Newsletter scales with you."
      />
      <section style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,6vw,80px)' }}>
        <SectionLabel>By Use Case</SectionLabel>
        <FeatureGrid items={SOLUTIONS_ITEMS} />
      </section>
      <section style={{ padding: '0 clamp(24px,6vw,80px) clamp(60px,10vw,100px)' }}>
        <SectionLabel>Success Stories</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0, border: '0.5px solid rgba(255,255,255,.07)' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ padding: 'clamp(24px,4vw,40px)', borderRight: i < TESTIMONIALS.length - 1 ? '0.5px solid rgba(255,255,255,.07)' : 'none' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 20 }}>"{t.quote}"</p>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.6)', letterSpacing: '.04em' }}>{t.name}</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>{t.role}</p>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}

// ─── PAGE: Resources ──────────────────────────────────────────────────────────
export function ResourcesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Resources"
        title="Everything you need to grow."
        subtitle="Guides, playbooks, and data-driven insights to help you build the newsletter your audience deserves."
      />
      <section style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,6vw,80px)' }}>
        <SectionLabel>Learning Hub</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 0, border: '0.5px solid rgba(255,255,255,.07)' }}>
          {RESOURCES.map((r, i) => (
            <div key={i} style={{ padding: 'clamp(24px,4vw,36px)', borderRight: i < RESOURCES.length - 1 ? '0.5px solid rgba(255,255,255,.07)' : 'none', cursor: 'pointer', transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.025)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <span style={{ display: 'inline-block', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', border: '0.5px solid rgba(255,255,255,.12)', padding: '3px 10px', marginBottom: 16 }}>{r.type}</span>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(18px,2.5vw,22px)', fontWeight: 400, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>{r.title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', lineHeight: 1.65, marginBottom: 20 }}>{r.desc}</p>
              <span style={{ fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', borderBottom: '0.5px solid rgba(255,255,255,.2)', paddingBottom: 1 }}>Read more →</span>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '0 clamp(24px,6vw,80px) clamp(60px,10vw,100px)' }}>
        <Card style={{ padding: 'clamp(32px,5vw,60px)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 300, color: '#fff', marginBottom: 12 }}>Get weekly growth insights.</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 28 }}>Delivered every Tuesday to 12,000+ newsletter creators.</p>
          <Link to="/signup"><Button>Join the List</Button></Link>
        </Card>
      </section>
    </PageLayout>
  )
}

// ─── PAGE: Enterprises ────────────────────────────────────────────────────────
export function EnterprisesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Enterprise"
        title="Scale without limits."
        subtitle="Custom infrastructure, dedicated support, and advanced analytics for media companies and enterprise teams."
      />
      <section style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,6vw,80px)' }}>
        <SectionLabel>Enterprise Features</SectionLabel>
        <FeatureGrid items={ENTERPRISE_FEATURES} />
      </section>
      <section style={{ padding: '0 clamp(24px,6vw,80px) clamp(60px,10vw,100px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '0.5px solid rgba(255,255,255,.07)' }}>
          <div style={{ padding: 'clamp(32px,5vw,60px)', borderRight: '0.5px solid rgba(255,255,255,.07)' }}>
            <SectionLabel>Custom SLA</SectionLabel>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 300, color: '#fff', marginBottom: 16 }}>Built for your requirements.</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', lineHeight: 1.7, marginBottom: 28 }}>We work with your legal and technical teams to define custom SLAs, data residency requirements, and compliance standards.</p>
            <Button variant="ghost">Talk to Sales</Button>
          </div>
          <div style={{ padding: 'clamp(32px,5vw,60px)' }}>
            <SectionLabel>Dedicated Support</SectionLabel>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 300, color: '#fff', marginBottom: 16 }}>A team, not a ticket.</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', lineHeight: 1.7, marginBottom: 28 }}>Your enterprise account includes a dedicated customer success manager, priority Slack access, and quarterly business reviews.</p>
            <Button variant="ghost">Contact Us</Button>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

// ─── PAGE: Ad Networking ──────────────────────────────────────────────────────
export function AdNetworkingPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Ad Networking"
        title="Monetize your audience. Authentically."
        subtitle="Connect with premium brands that align with your readers. Set your rates, approve every placement, and get paid on time."
      />
      <section style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,6vw,80px)' }}>
        <StatsRow stats={[{ value:'$2.4M', label:'Paid to Publishers' }, { value:'340+', label:'Brand Partners' }, { value:'$45', label:'Avg CPM' }, { value:'Net 15', label:'Payment Terms' }]} />
      </section>
      <section style={{ padding: '0 clamp(24px,6vw,80px) clamp(48px,8vw,80px)' }}>
        <SectionLabel>How It Works</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', border: '0.5px solid rgba(255,255,255,.07)' }}>
          {AD_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 'clamp(20px,4vw,48px)', alignItems: 'flex-start', padding: 'clamp(24px,4vw,40px)', borderBottom: i < AD_STEPS.length - 1 ? '0.5px solid rgba(255,255,255,.07)' : 'none' }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: 300, color: 'rgba(255,255,255,.12)', flexShrink: 0, lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 400, color: '#fff', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '0 clamp(24px,6vw,80px) clamp(60px,10vw,100px)' }}>
        <Card style={{ padding: 'clamp(32px,5vw,60px)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 300, color: '#fff', marginBottom: 12 }}>Start earning from your newsletter.</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 28 }}>Minimum 1,000 subscribers required to apply.</p>
          <Link to="/signup"><Button>Apply to Network</Button></Link>
        </Card>
      </section>
    </PageLayout>
  )
}

// ─── PAGE: Pricing ────────────────────────────────────────────────────────────
export function PricingPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Pricing"
        title="Simple. Transparent. Scales with you."
        subtitle="No hidden fees. No per-email charges. Pick the plan that fits where you are today."
      />
      <section style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,6vw,80px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 0, border: '0.5px solid rgba(255,255,255,.07)' }}>
          {PLANS.map((plan, i) => (
            <div key={i} style={{ padding: 'clamp(28px,4vw,48px)', borderRight: i < PLANS.length - 1 ? '0.5px solid rgba(255,255,255,.07)' : 'none', position: 'relative', background: plan.highlight ? 'rgba(255,255,255,.03)' : 'transparent' }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#fff' }} />
              )}
              <p style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 12 }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(40px,6vw,56px)', fontWeight: 300, color: '#fff', lineHeight: 1 }}>{plan.price}</span>
                {plan.period && <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>{plan.period}</span>}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', lineHeight: 1.6, marginBottom: 28 }}>{plan.desc}</p>
              <div style={{ height: .5, background: 'rgba(255,255,255,.08)', marginBottom: 24 }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: 'rgba(255,255,255,.55)', letterSpacing: '.02em' }}>
                    <span style={{ color: '#fff', flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup"><Button variant={plan.highlight ? 'primary' : 'ghost'} fullWidth>{plan.cta}</Button></Link>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '0 clamp(24px,6vw,80px) clamp(60px,10vw,100px)' }}>
        <SectionLabel>FAQ</SectionLabel>
        <div style={{ border: '0.5px solid rgba(255,255,255,.07)' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ padding: 'clamp(20px,3.5vw,32px)', borderBottom: i < FAQS.length - 1 ? '0.5px solid rgba(255,255,255,.07)' : 'none' }}>
              <p style={{ fontSize: 14, color: '#fff', marginBottom: 8, fontWeight: 500, letterSpacing: '.02em' }}>{faq.q}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}

// ─── Static data ──────────────────────────────────────────────────────────────
const PLATFORM_FEATURES = [
  { icon:'✉️', title:'Intelligent Send Engine', desc:'Adaptive send-time optimization that learns when each of your subscribers is most likely to open.' },
  { icon:'📊', title:'Deep Analytics', desc:'Open rates, click maps, scroll depth, and revenue attribution — all in one dashboard.' },
  { icon:'🤖', title:'AI Writing Assistant', desc:'Draft, refine, and optimize your content with an AI trained specifically on high-performing newsletters.' },
  { icon:'🔗', title:'Automation Sequences', desc:'Build welcome flows, re-engagement campaigns, and drip sequences with a visual drag-and-drop editor.' },
  { icon:'🎯', title:'Audience Segmentation', desc:'Segment by behavior, location, engagement tier, or custom tags. Send the right message to the right reader.' },
  { icon:'🔒', title:'Enterprise Security', desc:'SOC 2 Type II, GDPR compliant, SPF/DKIM/DMARC pre-configured. Your data, protected.' },
]

const SOLUTIONS_ITEMS = [
  { icon:'✍️', title:'Independent Creators', desc:'Everything you need to go from 0 to 10,000 subscribers and beyond — without a team.' },
  { icon:'🚀', title:'Startups', desc:'Build a captive audience while you build your product. Turn early readers into early customers.' },
  { icon:'📰', title:'Media Companies', desc:'Multi-brand support, advanced permissions, and editorial workflows for professional publishing teams.' },
  { icon:'🏢', title:'Enterprises', desc:'Custom infrastructure, dedicated support, and compliance controls for large-scale operations.' },
  { icon:'🎓', title:'Education', desc:'Keep students, alumni, and faculty informed with beautifully designed, accessible communications.' },
  { icon:'🌐', title:'Agencies', desc:'Manage multiple client accounts from a single dashboard. White-label options available.' },
]

const TESTIMONIALS = [
  { quote: 'AP Newsletter helped us go from 800 to 18,000 subscribers in six months. The AI recommendations were shockingly accurate.', name: 'Jordan K.', role: 'Founder, The Signal Brief' },
  { quote: 'We switched from Mailchimp and immediately saw a 12-point improvement in our open rates. The deliverability is incredible.', name: 'Priya M.', role: 'Editor, Fintech Weekly' },
  { quote: 'The ad network paid for our tool costs within the first month. We earned $3,200 in sponsorships with just 4,000 subscribers.', name: 'Alex T.', role: 'Creator, Morning Stack' },
]

const RESOURCES = [
  { type: 'Playbook', title: 'The 0 to 10K Subscriber Roadmap', desc: 'A step-by-step growth strategy that has helped 2,000+ newsletter creators hit five figures.' },
  { type: 'Data Report', title: '2025 Newsletter Industry Benchmarks', desc: 'Open rates, click rates, and revenue data across 12 major niches. Updated quarterly.' },
  { type: 'Guide', title: 'Newsletter Monetization: The Complete Guide', desc: 'Sponsorships, paid tiers, affiliate programs, and digital products — when and how to use each.' },
  { type: 'Template', title: 'The Perfect Welcome Email', desc: 'Copy and customize the welcome email template with an average 58% open rate across all niches.' },
  { type: 'Webinar', title: 'Subject Line Masterclass', desc: 'How to write subject lines that get opened. Includes 50 proven formulas with real performance data.' },
  { type: 'Tool', title: 'Newsletter Revenue Calculator', desc: 'Enter your subscribers and niche, and see your realistic revenue potential across every monetization model.' },
]

const ENTERPRISE_FEATURES = [
  { icon:'🏗️', title:'Custom Infrastructure', desc:'Dedicated IP pools, custom sending domains, and private cloud options for maximum deliverability and control.' },
  { icon:'👥', title:'Team Management', desc:'Granular role-based permissions, SSO integration, and audit logs for teams of any size.' },
  { icon:'📋', title:'Compliance & Legal', desc:'GDPR, CCPA, HIPAA-compliant options. Data processing agreements and custom DPAs available.' },
  { icon:'🔌', title:'API & Integrations', desc:'Full REST API access, webhooks, Salesforce, HubSpot, and custom CRM integrations.' },
  { icon:'📈', title:'Advanced Analytics', desc:'Custom dashboards, data exports, and direct database access for your BI tools.' },
  { icon:'🛡️', title:'Priority Support', desc:'24/7 dedicated support with guaranteed response times and a named customer success manager.' },
]

const AD_STEPS = [
  { title: 'Connect your newsletter', desc: 'Link your existing newsletter account or start a new one. We verify your list quality and audience demographics.' },
  { title: 'Set your terms', desc: 'Define your CPM rate, content restrictions, and approval requirements. You stay in complete control.' },
  { title: 'Get matched with brands', desc: 'Our matching algorithm connects you with brands whose audience overlaps with yours — no cold emails required.' },
  { title: 'Approve and publish', desc: 'Review every placement before it goes live. We generate the ad copy, you approve it.' },
  { title: 'Get paid', desc: 'Payments processed on Net-15 terms via bank transfer or PayPal. No minimum payout threshold.' },
]

const PLANS = [
  {
    name: 'Free', price: '$0', period: null, highlight: false,
    desc: 'Everything you need to start and grow your first newsletter.',
    features: ['Up to 1,000 subscribers', 'Unlimited sends', 'Basic analytics', 'AI writing assistant (5/mo)', 'AP Newsletter branding'],
    cta: 'Get Started Free',
  },
  {
    name: 'Creator', price: '$19', period: '/mo', highlight: true,
    desc: 'For serious newsletter creators ready to grow and monetize.',
    features: ['Up to 25,000 subscribers', 'Unlimited sends', 'Advanced analytics', 'AI writing assistant (unlimited)', 'Custom domain', 'Ad network access', 'Remove branding', 'Email support'],
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro', price: '$79', period: '/mo', highlight: false,
    desc: 'For professional publishers with demanding requirements.',
    features: ['Unlimited subscribers', 'Unlimited sends', 'Custom dashboards', 'Team seats (5 included)', 'API access', 'Priority deliverability', 'Dedicated IP', 'Priority support'],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise', price: 'Custom', period: null, highlight: false,
    desc: 'Custom pricing for media companies and large teams.',
    features: ['Everything in Pro', 'Custom contract & SLA', 'SSO / SAML', 'HIPAA/GDPR compliance', 'Dedicated CSM', 'Quarterly reviews', 'Custom integrations'],
    cta: 'Talk to Sales',
  },
]

const FAQS = [
  { q: 'Can I switch plans anytime?', a: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades at the end of your billing cycle.' },
  { q: 'Is there a free trial?', a: 'Creator and Pro plans include a 14-day free trial — no credit card required. You keep your subscribers and data if you choose not to continue.' },
  { q: 'What happens if I exceed my subscriber limit?', a: 'We never block your sends. If you exceed your plan limit, we\'ll notify you and give you 7 days to upgrade before any restrictions apply.' },
  { q: 'Do you charge per email sent?', a: 'No. All plans include unlimited sends. You pay a flat monthly fee based on your subscriber count, never per email.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, bank transfer (for annual plans), and PayPal. Annual plans receive a 20% discount.' },
]
