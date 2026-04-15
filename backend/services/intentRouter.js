// ─── Intent Detection Engine ──────────────────────────────────────────────────
// Multi-signal classifier that decides whether a message needs
// expert newsletter mode or general ChatGPT-style mode.

const NEWSLETTER_KEYWORDS = [
  'newsletter', 'subscriber', 'subscribers', 'email list', 'mailing list',
  'open rate', 'click rate', 'click-through', 'ctr', 'unsubscribe', 'churn',
  'retention', 'email acquisition', 'subject line', 'drip campaign',
  'email sequence', 'automation', 'list building', 'opt-in', 'opt in',
  'lead magnet', 'segmentation', 'deliverability', 'spam filter',
  'inbox placement', 'beehiiv', 'substack', 'convertkit', 'mailchimp',
  'klaviyo', 'sendgrid', 'mailerlite', 'email marketing', 'welcome email',
  'broadcast email', 'double opt-in', 'email campaign',
]

const IDEAS_KEYWORDS = [
  'content idea', 'content ideas', 'topic ideas', 'topics to write',
  'brainstorm', 'what to write about', 'next issue', 'next edition',
  'article idea', 'content plan', 'content calendar', 'editorial calendar',
  'newsletter ideas', 'give me ideas', 'suggest topics', 'what should i write',
  'creative ideas for newsletter', 'inspiration for my',
]

const ENGAGEMENT_KEYWORDS = [
  'engagement', 'engage readers', 'reply rate', 'response rate',
  'interactive content', 'community building', 'reader feedback',
  'poll subscribers', 'call to action', 'loyal readers', 'get more replies',
  're-engage', 'reactivate subscribers', 'inactive subscribers', 'win back',
  'referral program', 'forward rate', 'reader retention',
]

const MARKETING_KEYWORDS = [
  'monetize newsletter', 'monetization', 'make money from newsletter',
  'newsletter revenue', 'sponsor', 'sponsorship', 'affiliate marketing',
  'paid newsletter', 'premium tier', 'charge subscribers',
  'media kit', 'brand deal', 'newsletter ads', 'cpm rates', 'ad spots',
]

/**
 * Detect intent from user message.
 * @param {string} message
 * @returns {{ intent: string, isExpertMode: boolean }}
 */
function detectIntent(message) {
  const lower = message.toLowerCase()

  const match = (keywords) => keywords.some(kw => lower.includes(kw))

  if (match(IDEAS_KEYWORDS))      return { intent: 'ideas',       isExpertMode: true }
  if (match(ENGAGEMENT_KEYWORDS)) return { intent: 'engagement',  isExpertMode: true }
  if (match(MARKETING_KEYWORDS))  return { intent: 'marketing',   isExpertMode: true }
  if (match(NEWSLETTER_KEYWORDS)) return { intent: 'newsletter',  isExpertMode: true }

  return { intent: 'general', isExpertMode: false }
}

module.exports = { detectIntent }
