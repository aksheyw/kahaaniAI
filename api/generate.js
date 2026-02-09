// Vercel Serverless Function — Kahaani AI Script Generator
// Replicates n8n workflow: RSS fetch → Research Agent → Writer Agent → Format

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { mode = 'both', language = 'en' } = req.body || {}
  const OPENAI_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })

  try {
    // ── Step 1: Fetch RSS feeds in parallel ──
    const [newsResp, trendsResp] = await Promise.all([
      fetch('https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en').then(r => r.text()).catch(() => ''),
      fetch('https://trends.google.com/trending/rss?geo=IN').then(r => r.text()).catch(() => ''),
    ])

    function getTitles(xml) {
      const titles = []
      if (!xml) return titles
      const parts = xml.split('<item>')
      for (let i = 1; i < parts.length && titles.length < 15; i++) {
        const a = parts[i].indexOf('<title>')
        const b = parts[i].indexOf('</title>')
        if (a > -1 && b > a) {
          let t = parts[i].substring(a + 7, b)
            .replace('<![CDATA[', '').replace(']]>', '')
            .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
            .trim()
          if (t.length > 3) titles.push(t)
        }
      }
      return titles
    }

    const news = getTitles(newsResp)
    const trends = getTitles(trendsResp)

    const modeText = mode === 'inform' ? 'Educational/Knowledge content only'
      : mode === 'imagine' ? 'Fiction/Drama stories only'
      : 'Mix of both educational and fiction'
    const langText = language === 'hi' ? 'Hindi (Devanagari)'
      : language === 'hinglish' ? 'Hinglish (Hindi-English mix in Roman script)'
      : 'English'

    const newsStr = news.map((t, i) => `${i + 1}. ${t}`).join('\n')
    const trendsStr = trends.map((t, i) => `${i + 1}. ${t}`).join('\n')

    // ── Step 2: Research Agent — select 3 topics ──
    const researchPrompt = `You are a senior content strategist for a premium Indian audio platform. Analyze these trending topics and select 3 for audio scripts.

MODE: ${modeText}
LANGUAGE: ${langText}

NEWS TOPICS (Google News India):
${newsStr}

TRENDING SEARCHES (Google Trends India):
${trendsStr}

Select exactly 3 topics with highest audio content potential for Indian audiences. Consider cultural relevance, emotional resonance, and timeliness.

Respond with valid JSON only, no markdown code fences:
{"selected_topics":[{"topic":"Topic title","content_type":"inform or imagine","category":"news|culture|mythology|drama|technology|sports|politics|entertainment|finance|health","angle":"Suggested creative angle","rationale":"Why high potential"}],"research_summary":"2-line summary of trending landscape","topics_analyzed":${news.length + trends.length}}`

    const researchResp = await callOpenAI(OPENAI_KEY, researchPrompt, 0.7, 2000)

    let research
    try {
      research = JSON.parse(researchResp)
    } catch {
      const m = researchResp.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (m) research = JSON.parse(m[1])
      else {
        const om = researchResp.match(/\{[\s\S]*\}/)
        if (om) research = JSON.parse(om[0])
        else throw new Error('Cannot parse research response')
      }
    }

    // ── Step 3: Writer Agent — write 3 scripts ──
    const langTextWriter = language === 'hi' ? 'Hindi (use Devanagari script)'
      : language === 'hinglish' ? 'Hinglish (Hindi words in Roman script mixed naturally with English, like how young Indians text)'
      : 'English'

    const topics = JSON.stringify(research.selected_topics, null, 2)

    const writerPrompt = `You are a world-class audio scriptwriter creating content for Indian audiences. Your scripts are known for magnetic openings, vivid storytelling, and perfect pacing for audio.

LANGUAGE: ${langTextWriter}
Write ALL scripts in this language.

TOPICS TO WRITE:
${topics}

For each of the 3 topics, write an audio script following these rules:
- 800-1200 words per script
- First 30 words MUST hook the listener instantly (question, bold claim, vivid scene)
- Conversational, warm tone — like a brilliant friend explaining over chai
- Short sentences. Varied rhythm. Pauses built in.
- For "inform" scripts: Make complex topics fascinating and accessible. Use analogies. End with a surprising insight.
- For "imagine" scripts: Rich characters, emotional arcs, sensory details. Draw from Indian cultural context. End with a twist or emotional payoff.
- End each script with a memorable closing line
- Rate your confidence in each script honestly

Respond with valid JSON only, no markdown code fences:
{"scripts":[{"topic":"Topic title","content_type":"inform or imagine","category":"category","title":"Creative compelling title","script":"Full script text...","word_count":950,"estimated_audio_minutes":7.5,"hook":"First 30 words","confidence_score":{"overall":82,"hook_strength":85,"narrative_flow":80,"emotional_engagement":78,"audio_readiness":84},"confidence_rationale":"Brief honest explanation of strengths and weaknesses"}]}`

    const writerResp = await callOpenAI(OPENAI_KEY, writerPrompt, 0.8, 8000)

    let scriptData
    try {
      scriptData = JSON.parse(writerResp)
    } catch {
      const m = writerResp.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (m) scriptData = JSON.parse(m[1])
      else {
        const om = writerResp.match(/\{[\s\S]*\}/)
        if (om) scriptData = JSON.parse(om[0])
        else scriptData = { scripts: [{ error: 'Parse failed', raw: writerResp.substring(0, 500) }] }
      }
    }

    // ── Step 4: Format response with cost analysis ──
    const scripts = scriptData.scripts || []
    const researchChars = researchResp.length || 1500
    const writerChars = writerResp.length
    const inTokens = Math.ceil(5500 / 4)
    const outTokens = Math.ceil((researchChars + writerChars) / 4)
    const inCost = (inTokens / 1000000) * 2
    const outCost = (outTokens / 1000000) * 8
    const totalUSD = inCost + outCost
    const totalINR = totalUSD * 85
    const humanPerScript = 650
    const humanTotal = humanPerScript * 3

    let totalWords = 0, totalMins = 0
    scripts.forEach(s => {
      totalWords += s.word_count || 0
      totalMins += s.estimated_audio_minutes || 0
    })

    return res.status(200).json({
      status: 'success',
      product: 'Kahaani AI',
      generated_at: new Date().toISOString(),
      params: { mode, language },
      research: {
        summary: research.research_summary,
        topics_analyzed: research.topics_analyzed,
        sources: ['Google News India', 'Google Trends India'],
        selected_topics: research.selected_topics,
      },
      scripts,
      totals: {
        scripts_generated: scripts.length,
        total_words: totalWords,
        total_audio_minutes: Math.round(totalMins * 10) / 10,
      },
      cost_analysis: {
        ai: {
          total_usd: Math.round(totalUSD * 10000) / 10000,
          total_inr: Math.round(totalINR * 100) / 100,
          per_script_inr: Math.round((totalINR / 3) * 100) / 100,
          tokens: { input: inTokens, output: outTokens, total: inTokens + outTokens },
          model: 'gpt-4.1',
        },
        human: {
          total_inr: humanTotal,
          per_script_inr: humanPerScript,
          basis: 'Indian freelance content marketplace average',
        },
        savings: {
          multiplier: Math.round(humanTotal / totalINR) + 'x',
          saved_inr: Math.round(humanTotal - totalINR),
        },
      },
    })
  } catch (err) {
    console.error('Kahaani API error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}

async function callOpenAI(apiKey, prompt, temperature, maxTokens) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  })
  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`OpenAI API error (${resp.status}): ${err}`)
  }
  const data = await resp.json()
  return data.choices[0].message.content
}
