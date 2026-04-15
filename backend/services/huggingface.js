// ─── HuggingFace LLM Service ──────────────────────────────────────────────────
// Dual-mode AI: General ChatGPT-style + Newsletter Expert
// Models: Mistral-7B-Instruct (primary) → Zephyr-7B-beta (fallback)

require('dotenv').config()
const { HfInference } = require('@huggingface/inference')

// FIX: The env variable was HUGGINGFACE_API_KEY in .env.example but
// the code read process.env.HUGGINGFACE_API_KEY — now consistent everywhere.
// Old code also checked for 'hf_YOUR_KEY_HERE' but .env.example uses
// 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' — both are handled below.
const HF_KEY = process.env.HUGGINGFACE_API_KEY || ''
const hf = new HfInference(HF_KEY)

const MASTER_SYSTEM_PROMPT = `You are AP Newsletter AI — a smart, conversational AI assistant built into the AP Newsletter platform.

You have TWO modes that you switch between automatically:

## GENERAL MODE (for everyday questions)
When someone asks general questions (about life, code, science, writing, advice, etc.):
- Respond like a knowledgeable, friendly human — warm and direct
- Give concise answers for simple questions (1-3 sentences is fine)
- Give detailed answers for complex questions
- Be curious and engaging — ask a follow-up when it helps
- Never say "I'm just an AI" or be robotic — be natural and conversational

## EXPERT MODE (for newsletter, email marketing, content strategy)
When someone asks about newsletters, subscribers, email, engagement, content ideas, monetization:
- Switch to deep expert mode immediately
- Give specific, tactical, data-backed advice
- Include real benchmarks and numbers (open rates, CPM, conversion rates)
- Structure responses clearly with sections, bullet points, numbered lists
- Reference real tools: Beehiiv, Substack, ConvertKit, SparkLoop, etc.
- Always offer a follow-up question to go deeper

## UNIVERSAL RULES
- Be friendly and human — not stiff or corporate
- Use markdown formatting when it helps readability
- Short questions → short answers. Strategy questions → detailed breakdowns
- Never hallucinate statistics you're not confident about
- If you don't know something, say so naturally and offer what you DO know
- You represent AP Newsletter — a premium, intelligence-focused newsletter brand`

const EXPERT_BOOSTERS = {
  newsletter: `\n\nFOR THIS RESPONSE: The user is asking about newsletter growth or email strategy. Go into expert mode. Provide specific, actionable tactics with real numbers. Structure your answer clearly.`,
  ideas:      `\n\nFOR THIS RESPONSE: The user wants content ideas. Generate 5-7 specific, creative ideas with a one-sentence hook/angle for each. Make them feel fresh and immediately actionable.`,
  engagement: `\n\nFOR THIS RESPONSE: The user wants to improve reader engagement. Give specific tactics ranked by impact. Include expected outcomes where possible.`,
  marketing:  `\n\nFOR THIS RESPONSE: The user wants to monetize or market their newsletter. Be direct and revenue-focused. Include realistic numbers for sponsorship CPMs, conversion rates, and revenue potential.`,
  general:    `\n\nFOR THIS RESPONSE: This is a general question — not specifically about newsletters. Respond conversationally and helpfully, like a smart friend would.`,
}

const FALLBACKS = {
  newsletter: `**Newsletter Growth — Quick Wins to Start With**\n\n1. **Welcome email is your highest-leverage moment** — it gets 50-80% open rates. Make it personal, valuable, and set expectations.\n2. **Subject lines under 50 characters** perform 12% better on average. Use curiosity gaps, not clickbait.\n3. **Send on Tuesday-Thursday mornings** — consistently outperforms other slots.\n4. **Referral program** (try SparkLoop or Beehiiv's built-in referral) can add 20-30% organic growth.\n5. **Clean your list every 90 days** — removing cold subscribers improves deliverability.\n\nWhat's your current subscriber count and biggest challenge right now?`,
  ideas:      `**5 Fresh Newsletter Content Ideas**\n\n1. **The Contrarian Take** — Pick a widely-held belief in your niche and respectfully dismantle it with evidence.\n2. **The 5-Year Lookback** — Compare where your industry was 5 years ago to now.\n3. **Reader-Submitted Q&A** — Crowdsource questions from subscribers, answer the best 3-5.\n4. **The Underrated Tool** — Something genuinely useful that's flying under the radar.\n5. **Behind the Numbers** — Take one interesting stat and do a deep-dive analysis.\n\nWhat niche is your newsletter in? I can generate more targeted ideas.`,
  engagement: `**Top Engagement Tactics (Ranked by Impact)**\n\n**Highest impact:**\n- End every issue with **one simple question** and ask readers to reply. This 5x's reply rates.\n- **P.S. sections** get read nearly as often as the main content.\n\n**Medium impact:**\n- Polls and surveys within the email body (+40-50% interaction)\n- Name your reader community to create identity\n\nWhat's your current reply/open rate?`,
  marketing:  `**Newsletter Monetization Roadmap**\n\n| Stage | Subscribers | Strategy |\n|-------|-------------|----------|\n| 1 | 0-1K | Build quality, no monetization yet |\n| 2 | 1K-5K | Affiliate links, digital products |\n| 3 | 5K-15K | Direct sponsorships ($500-2K/issue) |\n| 4 | 15K+ | Premium tier, consulting, courses |\n\n**Typical CPM rates:** Niche B2B: $40-80 CPM · Finance/Tech: $50-100+ CPM\n\nWhat's your subscriber count and niche?`,
  general:    `Hey! I'm **AP Newsletter AI** — I can help with pretty much anything.\n\nI'm particularly good at:\n- 📈 Newsletter growth strategy\n- 💡 Content ideas and editorial planning\n- ✉️ Email marketing and engagement\n- 💰 Newsletter monetization\n- 💬 General questions (just ask!)\n\nWhat are you working on?`,
}

function isKeyMissing(key) {
  return !key ||
    key === 'hf_YOUR_KEY_HERE' ||
    key.startsWith('hf_xxx') ||
    key.length < 20
}

function buildMistralPrompt(systemPrompt, historyText, message) {
  const history = historyText ? `\n\nConversation so far:\n${historyText}\n` : ''
  return `<s>[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n${history}\nUser: ${message}\n\nImportant: Use markdown formatting where helpful. Be natural and conversational. [/INST]`
}

function buildZephyrPrompt(systemPrompt, historyText, message) {
  const history = historyText ? `\n\nContext:\n${historyText}\n` : ''
  return `<|system|>\n${systemPrompt}${history}\n</|system|>\n<|user|>\n${message}\n</|user|>\n<|assistant|>`
}

async function generateResponse({ message, intent, isExpertMode, historyText, ragContext }) {
  if (isKeyMissing(HF_KEY)) {
    console.warn('⚠️  HUGGINGFACE_API_KEY not set or invalid — using static fallback')
    return FALLBACKS[intent] || FALLBACKS.general
  }

  const booster = EXPERT_BOOSTERS[intent] || EXPERT_BOOSTERS.general
  let systemPrompt = MASTER_SYSTEM_PROMPT + booster

  if (ragContext) {
    systemPrompt += `\n\nKnowledge base context (use when relevant):\n${ragContext}`
  }

  // ── Try Mistral-7B-Instruct first ─────────────────────────────────────────
  try {
    const prompt = buildMistralPrompt(systemPrompt, historyText, message)
    const result = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: prompt,
      parameters: {
        max_new_tokens: isExpertMode ? 800 : 500,
        temperature: isExpertMode ? 0.65 : 0.78,
        top_p: 0.92,
        repetition_penalty: 1.1,
        return_full_text: false,
        stop: ['[INST]', '</s>', '\nUser:', '\nHuman:', '<<SYS>>'],
      },
    })
    const text = result.generated_text?.trim()
    if (text && text.length > 40) {
      console.log(`✅ Mistral responded (intent: ${intent}, expert: ${isExpertMode})`)
      return cleanResponse(text)
    }
    throw new Error('Mistral returned empty or too-short response')
  } catch (err) {
    console.log(`⚠️  Mistral failed: ${err.message} — trying Zephyr`)
  }

  // ── Fallback: Zephyr-7B-beta ──────────────────────────────────────────────
  try {
    const prompt = buildZephyrPrompt(systemPrompt, historyText, message)
    const result = await hf.textGeneration({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      inputs: prompt,
      parameters: {
        max_new_tokens: isExpertMode ? 700 : 450,
        temperature: isExpertMode ? 0.65 : 0.78,
        top_p: 0.92,
        return_full_text: false,
        stop: ['<|user|>', '</s>', '<|system|>'],
      },
    })
    const text = result.generated_text?.trim()
    if (text && text.length > 20) {
      console.log(`✅ Zephyr responded (intent: ${intent})`)
      return cleanResponse(text)
    }
    throw new Error('Zephyr also returned empty response')
  } catch (err) {
    console.log(`⚠️  Zephyr failed: ${err.message} — using static fallback`)
    return FALLBACKS[intent] || FALLBACKS.general
  }
}

function cleanResponse(text) {
  return text
    .replace(/^(Assistant|AI|AP Newsletter AI|NewsletterAI)\s*:\s*/i, '')
    .replace(/\[INST\][\s\S]*?\[\/INST\]/g, '')
    .replace(/<\|system\|>[\s\S]*?<\/\|system\|>/g, '')
    .replace(/<\/?s>/g, '')
    .replace(/<<SYS>>[\s\S]*?<\/SYS>>/g, '')
    .replace(/^[\s\n\r]+/, '')
    .replace(/[\s\n\r]+$/, '')
    .trim()
}

module.exports = { generateResponse }
