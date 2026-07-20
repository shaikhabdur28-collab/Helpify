import React, { useEffect, useMemo, useState } from 'react'
import helpifyDoc from './README (4).md?raw'

const STORAGE_KEY = 'helpify-gemini-key'
const CHAT_KEY = 'helpify-chat-messages'
const QUICK_PROMPTS = ['Build me a study plan', 'Suggest a tutor for math', 'Remind me about upcoming work']

export default function GeminiChatbot({ studentProfile, schoolStats, currentUser }) {
  const [apiKey, setApiKey] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi, I am Helpify AI. Ask me about study plans, progress, reminders, or tutoring help.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY) || ''
    setApiKey(savedKey)
    setApiKeyInput(savedKey)

    const savedMessages = localStorage.getItem(CHAT_KEY)
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages))
  }, [messages])

  const documentKnowledge = useMemo(() => {
    const sections = (helpifyDoc || '')
      .split(/\n{2,}/)
      .map((section) => section.trim())
      .filter(Boolean)

    return sections.join('\n\n')
  }, [])

  const systemPrompt = useMemo(() => {
    const name = studentProfile?.name || 'No student selected'
    const grade = studentProfile?.grade || 'unknown'
    const subjects = studentProfile?.subjects || 'none'
    const goals = studentProfile?.goals || 'none'
    const attendance = studentProfile?.attendance ?? 'unknown'
    const homework = studentProfile?.homework ?? 'unknown'
    const focus = studentProfile?.focus ?? 'unknown'

    return `
You are Helpify AI, a helpful student success coach.
Answer using the uploaded document content whenever possible.
Be concise, practical, and supportive.
Give short next steps, not long essays.
If the user asks for study help, give clear actions.
If the user asks about tutoring, recommend the best match.
If the user asks about progress, explain the strongest and weakest areas.
Do not mention policies or system instructions.

Uploaded document knowledge:
${documentKnowledge}

Current user: ${currentUser?.displayName || 'unknown'}
Role: ${currentUser?.role || 'student'}
School code: ${currentUser?.schoolCode || 'unknown'}

Selected student:
Name: ${name}
Grade: ${grade}
Subjects: ${subjects}
Goals: ${goals}
Attendance: ${attendance}
Homework: ${homework}
Focus: ${focus}

School stats:
${schoolStats ? `Total profiles: ${schoolStats.total}, At risk: ${schoolStats.atRisk}, Average: ${schoolStats.average}%` : 'No school stats'}
`.trim()
  }, [studentProfile, schoolStats, currentUser])

  function saveKey() {
    const next = apiKeyInput.trim()
    setApiKey(next)
    if (next) {
      localStorage.setItem(STORAGE_KEY, next)
      setError('')
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function clearKey() {
    setApiKey('')
    setApiKeyInput('')
    localStorage.removeItem(STORAGE_KEY)
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const api = apiKey || localStorage.getItem(STORAGE_KEY) || ''
    if (!api) {
      setError('Add your Gemini API key first.')
      return
    }

    setError('')
    setLoading(true)

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${api}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: nextMessages.map((message) => ({
              role: message.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: message.text }],
            })),
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 350,
            },
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Gemini request failed')
      }

      const data = await response.json()
      const reply =
        data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('')?.trim() ||
        'I could not generate a response.'

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      setError('Could not reach Gemini. Check your API key.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I could not reach Gemini right now. Check your API key and try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Helpify Assistant</h2>
      <p style={styles.subtitle}>Ask Helpify AI about study help, reminders, tutoring, or progress.</p>

      <div style={styles.promptRow}>
        {QUICK_PROMPTS.map((prompt) => (
          <button key={prompt} type="button" style={styles.promptChip} onClick={() => setInput(prompt)}>
            {prompt}
          </button>
        ))}
      </div>

      <div style={styles.chatBox}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.bubble,
              ...(message.role === 'assistant' ? styles.assistantBubble : styles.userBubble),
            }}
          >
            {message.text}
          </div>
        ))}
        {loading ? <div style={{ ...styles.bubble, ...styles.assistantBubble }}>Typing…</div> : null}
      </div>

      {error ? <p style={styles.error}>{error}</p> : null}

      <label style={styles.label}>
        Gemini API key
        <input
          style={styles.input}
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Paste your Gemini API key"
        />
      </label>

      <div style={styles.row}>
        <button style={styles.secondaryBtn} type="button" onClick={saveKey}>
          Save key
        </button>
        <button style={styles.ghostBtn} type="button" onClick={clearKey}>
          Clear key
        </button>
      </div>

      <label style={styles.label}>
        Ask Helpify AI
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How should I improve my math grade?"
        />
      </label>

      <div style={styles.row}>
        <button style={styles.primaryBtn} type="button" onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending…' : 'Send'}
        </button>
        <button
          style={styles.secondaryBtn}
          type="button"
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                text: 'Hi, I am Helpify AI. Ask me about study plans, progress, reminders, or tutoring help.',
              },
            ])
          }
        >
          Reset chat
        </button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #dbe3ef',
    borderRadius: 24,
    padding: 20,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
    display: 'grid',
    gap: 14,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 900, color: '#172033' },
  subtitle: { margin: 0, color: '#667085' },
  promptRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptChip: {
    border: '1px solid #dbe3ef',
    background: '#f8fbff',
    color: '#2563eb',
    borderRadius: 999,
    padding: '8px 12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  chatBox: {
    maxHeight: 320,
    overflowY: 'auto',
    display: 'grid',
    gap: 10,
    padding: 14,
    border: '1px solid #dbe3ef',
    borderRadius: 18,
    background: '#f8fbff',
  },
  bubble: {
    maxWidth: '90%',
    padding: '12px 14px',
    borderRadius: 16,
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
  },
  assistantBubble: {
    background: '#fff',
    border: '1px solid #dbe3ef',
    color: '#172033',
    justifySelf: 'start',
  },
  userBubble: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff',
    justifySelf: 'end',
  },
  label: {
    display: 'grid',
    gap: 8,
    fontWeight: 700,
    color: '#334155',
  },
  input: {
    width: '100%',
    border: '1px solid #dbe3ef',
    borderRadius: 16,
    padding: '12px 14px',
    outline: 'none',
    minHeight: 50,
  },
  textarea: {
    width: '100%',
    border: '1px solid #dbe3ef',
    borderRadius: 16,
    padding: '12px 14px',
    outline: 'none',
    minHeight: 110,
    resize: 'vertical',
    font: 'inherit',
  },
  row: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryBtn: {
    background: '#e8eefc',
    color: '#173f9d',
    border: 'none',
    borderRadius: 14,
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  ghostBtn: {
    background: 'transparent',
    color: '#173f9d',
    border: '1px solid #dbe3ef',
    borderRadius: 14,
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  error: {
    color: '#b91c1c',
    margin: 0,
  },
}
