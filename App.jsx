import React, { useEffect, useMemo, useState } from 'react'
import helpifyReadme from './README.md?raw'
import githubSetup from './GITHUB_SETUP.md?raw'

const STORAGE_KEYS = {
  users: 'helpify-users',
  session: 'helpify-session',
  students: 'helpify-students',
  reminders: 'helpify-reminders',
}

const ROLE_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
}

const DEFAULT_STUDENT = {
  name: '',
  grade: '',
  subjects: '',
  goals: '',
  attendance: 88,
  homework: 76,
  focus: 72,
  mathScore: 68,
  englishScore: 74,
  scienceScore: 70,
  notes: '',
}

const DEFAULT_REMINDER = {
  title: '',
  dueDate: '',
  note: '',
}

const SAMPLE_USERS = [
  { id: 'u1', email: 'student@helpify.app', password: 'student123', displayName: 'Jordan Lee', role: 'student', schoolCode: 'north-campus' },
  { id: 'u2', email: 'teacher@helpify.app', password: 'teacher123', displayName: 'Ms. Carter', role: 'teacher', schoolCode: 'north-campus' },
  { id: 'u3', email: 'admin@helpify.app', password: 'admin123', displayName: 'Admin', role: 'admin', schoolCode: 'north-campus' },
]

const SAMPLE_STUDENTS = [
  {
    id: 's1',
    ownerId: 'u1',
    schoolCode: 'north-campus',
    name: 'Jordan Lee',
    grade: '10',
    subjects: 'Math, English, Biology',
    goals: 'Raise math grade, improve homework completion, and prepare for biology tests.',
    attendance: 92,
    homework: 78,
    focus: 71,
    mathScore: 64,
    englishScore: 83,
    scienceScore: 69,
    notes: 'Needs help staying consistent on homework.',
  },
  {
    id: 's2',
    ownerId: 'u1',
    schoolCode: 'north-campus',
    name: 'Taylor Smith',
    grade: '9',
    subjects: 'Math, History',
    goals: 'Improve math test scores and make a stronger study habit.',
    attendance: 84,
    homework: 68,
    focus: 66,
    mathScore: 59,
    englishScore: 77,
    scienceScore: 73,
    notes: 'Should book tutoring once a week.',
  },
]

const SAMPLE_REMINDERS = [
  {
    id: 'r1',
    ownerId: 'u1',
    schoolCode: 'north-campus',
    audience: 'student',
    title: 'Math quiz review',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    note: 'Review algebra notes and practice 10 questions.',
    completed: false,
  },
  {
    id: 'r2',
    ownerId: 'u2',
    schoolCode: 'north-campus',
    audience: 'teacher',
    title: 'Check student progress',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    note: 'Meet with at-risk students and send updates.',
    completed: false,
  },
]

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function parseList(text) {
  return text.split(',').map((item) => item.trim()).filter(Boolean)
}

function average(nums) {
  const filtered = nums.filter((n) => Number.isFinite(Number(n)))
  if (!filtered.length) return 0
  return Math.round(filtered.reduce((sum, n) => sum + Number(n), 0) / filtered.length)
}

function formatDate(value) {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

function getSubjectScores(profile) {
  const subjects = parseList(profile.subjects)
  const fallback = average([profile.mathScore, profile.englishScore, profile.scienceScore, profile.focus]) || 70

  if (!subjects.length) {
    return [
      { name: 'Math', score: profile.mathScore },
      { name: 'English', score: profile.englishScore },
      { name: 'Science', score: profile.scienceScore },
    ]
  }

  return subjects.map((subject) => {
    const lower = subject.toLowerCase()
    let score = fallback
    if (lower.includes('math')) score = profile.mathScore
    else if (lower.includes('english') || lower.includes('reading') || lower.includes('writing')) score = profile.englishScore
    else if (lower.includes('science') || lower.includes('biology') || lower.includes('chemistry') || lower.includes('physics')) score = profile.scienceScore
    else score = average([profile.mathScore, profile.englishScore, profile.scienceScore])
    return { name: subject, score }
  })
}

function getWeakestSubject(profile) {
  const scores = getSubjectScores(profile)
  return [...scores].sort((a, b) => a.score - b.score)[0] || { name: 'Math', score: profile.mathScore }
}

function buildStudyPlan(profile) {
  const weakest = getWeakestSubject(profile)
  return [
    { day: 'Mon', title: `Practice ${weakest.name}`, detail: `Spend 25 minutes on the lowest-scoring skill in ${weakest.name}.` },
    { day: 'Tue', title: 'Homework sprint', detail: 'Finish one assignment early and review mistakes.' },
    { day: 'Wed', title: 'Goal check-in', detail: `Connect today’s work to ${profile.goals || 'your goals'}.` },
    { day: 'Thu', title: 'Focused review', detail: `Do 10 practice questions or flashcards in ${weakest.name}.` },
    { day: 'Fri', title: 'Support touchpoint', detail: 'Meet with a teacher, parent, or tutor and share progress.' },
  ]
}

function buildTasks(profile) {
  const weakest = getWeakestSubject(profile)
  const lowAreas = [
    ['Attendance', profile.attendance],
    ['Homework', profile.homework],
    ['Focus', profile.focus],
    [weakest.name, weakest.score],
  ].sort((a, b) => a[1] - b[1])

  const tasks = [
    { title: `Start with ${lowAreas[0][0]}`, detail: 'Fix the lowest area first for the fastest improvement.', priority: 'high' },
    { title: `Use a 25-minute timer for ${weakest.name}`, detail: 'Short work blocks reduce overwhelm and boost output.', priority: 'medium' },
    { title: 'Send a progress update', detail: 'Share one win and one problem with a parent or teacher.', priority: 'medium' },
  ]

  if (profile.attendance < 85) {
    tasks.unshift({ title: 'Set an attendance reminder', detail: 'Plan the next school day the night before.', priority: 'high' })
  }

  if (profile.homework < 75) {
    tasks.push({ title: 'Create a homework checklist', detail: 'Break assignments into smaller steps and check them off.', priority: 'low' })
  }

  return tasks
}

function buildTutorMatches(profile) {
  const weakest = getWeakestSubject(profile)
  const goals = profile.goals.toLowerCase()
  const matches = []

  if (weakest.name.toLowerCase().includes('math')) {
    matches.push({ title: 'Math tutor', reason: 'Best for algebra, problem solving, and test prep.' })
  }
  if (weakest.name.toLowerCase().includes('english') || goals.includes('reading') || goals.includes('writing')) {
    matches.push({ title: 'Reading & writing tutor', reason: 'Helps with comprehension, essays, and vocabulary.' })
  }
  if (weakest.name.toLowerCase().includes('science') || goals.includes('biology') || goals.includes('chemistry') || goals.includes('physics')) {
    matches.push({ title: 'Science tutor', reason: 'Good for labs, vocabulary, and concept review.' })
  }

  matches.push(
    { title: 'Study skills coach', reason: 'Builds habits, focus, and assignment planning.' },
    { title: 'Homework accountability helper', reason: 'Keeps the student on pace and reduces missed work.' },
  )

  return matches.slice(0, 3)
}

function buildProgressCards(profile) {
  const subjectScores = getSubjectScores(profile)
  const overall = average([
    profile.attendance,
    profile.homework,
    profile.focus,
    profile.mathScore,
    profile.englishScore,
    profile.scienceScore,
  ])

  return [
    { label: 'Overall progress', value: overall, detail: overall >= 80 ? 'Strong momentum' : 'Needs support' },
    { label: 'Attendance', value: clamp(profile.attendance), detail: 'Class presence' },
    { label: 'Homework', value: clamp(profile.homework), detail: 'Assignment completion' },
    { label: 'Focus', value: clamp(profile.focus), detail: 'Attention and routine' },
    ...subjectScores.map((s) => ({ label: s.name, value: clamp(s.score), detail: 'Subject score' })),
  ]
}

function aggregateSchoolStats(students) {
  const scores = students.map((p) => average([p.attendance, p.homework, p.focus, p.mathScore, p.englishScore, p.scienceScore]))
  return {
    total: students.length,
    atRisk: students.filter((p) => average([p.attendance, p.homework, p.focus, p.mathScore, p.englishScore, p.scienceScore]) < 75).length,
    average: scores.length ? average(scores) : 0,
    avgAttendance: students.length ? average(students.map((p) => clamp(p.attendance))) : 0,
  }
}

const DOCUMENT_KNOWLEDGE = [
  { title: 'README', content: helpifyReadme },
  { title: 'GitHub setup', content: githubSetup },
]

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildDocumentChunks() {
  return DOCUMENT_KNOWLEDGE.flatMap((doc) => {
    const sections = doc.content
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)

    return sections.map((chunk) => ({
      title: doc.title,
      text: chunk,
      normalized: normalizeText(chunk),
    }))
  })
}

const DOCUMENT_CHUNKS = buildDocumentChunks()

function getDocumentReply(message, profile) {
  const query = normalizeText(message)
  if (!query) {
    return 'I can answer based on the uploaded Helpify documents. Try asking about setup, privacy, deployment, or how the app works.'
  }

  const queryTerms = query.split(' ').filter(Boolean)
  const scored = DOCUMENT_CHUNKS.map((chunk) => {
    const matches = queryTerms.reduce((count, term) => count + (chunk.normalized.includes(term) ? 1 : 0), 0)
    return { ...chunk, score: matches }
  }).filter((chunk) => chunk.score > 0)

  if (scored.length) {
    scored.sort((a, b) => b.score - a.score)
    const best = scored[0]
    const lines = best.text.split('\n').filter(Boolean)
    const answerLine = lines.find((line) => line.trim().length > 0 && !line.startsWith('#')) || best.text
    return `From the uploaded docs: ${answerLine.replace(/\s+/g, ' ').slice(0, 220)}${answerLine.length > 220 ? '…' : ''}`
  }

  const fallback = DOCUMENT_CHUNKS.find((chunk) => chunk.normalized.includes('privacy') || chunk.normalized.includes('deploy'))
  if (fallback) {
    return `From the uploaded docs: ${fallback.text.split('\n').find(Boolean).replace(/\s+/g, ' ').slice(0, 220)}…`
  }

  return 'I can answer from the uploaded Helpify documents. Ask about setup, privacy, deployment, or the app’s features.'
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function App() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [signupRole, setSignupRole] = useState('student')
  const [authError, setAuthError] = useState('')

  const [currentUser, setCurrentUser] = useState(null)
  const [setupName, setSetupName] = useState('')
  const [setupSchoolCode, setSetupSchoolCode] = useState('')
  const [setupRole, setSetupRole] = useState('student')
  const [setupError, setSetupError] = useState('')

  const [students, setStudents] = useState([])
  const [reminders, setReminders] = useState([])
  const [activeStudentId, setActiveStudentId] = useState(null)
  const [studentForm, setStudentForm] = useState(DEFAULT_STUDENT)
  const [savedStudentId, setSavedStudentId] = useState(null)
  const [reminderForm, setReminderForm] = useState(DEFAULT_REMINDER)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { id: 'welcome', role: 'assistant', text: 'I can answer from the uploaded Helpify documents. Ask me about setup, privacy, deployment, or how the app works.' },
  ])

  useEffect(() => {
    const users = loadJson(STORAGE_KEYS.users, null)
    if (!users) {
      saveJson(STORAGE_KEYS.users, SAMPLE_USERS)
      saveJson(STORAGE_KEYS.students, SAMPLE_STUDENTS)
      saveJson(STORAGE_KEYS.reminders, SAMPLE_REMINDERS)
      return
    }

    const session = loadJson(STORAGE_KEYS.session, null)
    if (session?.email) {
      const match = users.find((u) => u.email === session.email)
      if (match) {
        setCurrentUser(match)
        setSetupName(match.displayName || '')
        setSetupSchoolCode(match.schoolCode || '')
        setSetupRole(match.role || 'student')
      }
    }
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setStudents([])
      setReminders([])
      return
    }

    const allStudents = loadJson(STORAGE_KEYS.students, [])
    const allReminders = loadJson(STORAGE_KEYS.reminders, [])

    const visibleStudents = currentUser.role === 'student'
      ? allStudents.filter((s) => s.ownerId === currentUser.id)
      : allStudents.filter((s) => s.schoolCode === currentUser.schoolCode)

    const visibleReminders = currentUser.role === 'student'
      ? allReminders.filter((r) => r.ownerId === currentUser.id)
      : allReminders.filter((r) => r.schoolCode === currentUser.schoolCode)

    visibleStudents.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    visibleReminders.sort((a, b) => (new Date(a.dueDate || 0)).getTime() - (new Date(b.dueDate || 0)).getTime())

    setStudents(visibleStudents)
    setReminders(visibleReminders)

    if (!activeStudentId && visibleStudents[0]) {
      setActiveStudentId(visibleStudents[0].id)
    }
  }, [currentUser, activeStudentId])

  const activeStudent = useMemo(() => {
    if (!students.length) return null
    return students.find((s) => s.id === activeStudentId) || students[0]
  }, [students, activeStudentId])

  const dashboardProfile = useMemo(() => {
    if (!activeStudent) return DEFAULT_STUDENT
    return {
      name: activeStudent.name || '',
      grade: activeStudent.grade || '',
      subjects: activeStudent.subjects || '',
      goals: activeStudent.goals || '',
      attendance: clamp(Number(activeStudent.attendance ?? 0)),
      homework: clamp(Number(activeStudent.homework ?? 0)),
      focus: clamp(Number(activeStudent.focus ?? 0)),
      mathScore: clamp(Number(activeStudent.mathScore ?? 0)),
      englishScore: clamp(Number(activeStudent.englishScore ?? 0)),
      scienceScore: clamp(Number(activeStudent.scienceScore ?? 0)),
      notes: activeStudent.notes || '',
    }
  }, [activeStudent])

  useEffect(() => {
    if (activeStudent) {
      setStudentForm(dashboardProfile)
      setSavedStudentId(activeStudent.id)
    } else if (currentUser?.role === 'student') {
      setStudentForm(DEFAULT_STUDENT)
      setSavedStudentId(null)
    }
  }, [activeStudent, dashboardProfile, currentUser])

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin'
  const stats = useMemo(() => aggregateSchoolStats(students), [students])
  const progressCards = useMemo(() => buildProgressCards(studentForm), [studentForm])
  const studyPlan = useMemo(() => buildStudyPlan(studentForm), [studentForm])
  const tasks = useMemo(() => buildTasks(studentForm), [studentForm])
  const tutorMatches = useMemo(() => buildTutorMatches(studentForm), [studentForm])
  const nextReminder = reminders[0] || null
  const upcomingCount = reminders.filter((r) => {
    const days = daysUntil(r.dueDate)
    return days === null || days >= 0
  }).length

  function persistUsers(nextUsers) {
    saveJson(STORAGE_KEYS.users, nextUsers)
  }

  function persistStudents(nextStudents) {
    saveJson(STORAGE_KEYS.students, nextStudents)
  }

  function persistReminders(nextReminders) {
    saveJson(STORAGE_KEYS.reminders, nextReminders)
  }

  function handleAuth(e) {
    e.preventDefault()
    setAuthError('')

    const users = loadJson(STORAGE_KEYS.users, SAMPLE_USERS)

    if (mode === 'login') {
      const found = users.find((u) => u.email === email.trim() && u.password === password)
      if (!found) {
        setAuthError('Invalid email or password.')
        return
      }
      setCurrentUser(found)
      saveJson(STORAGE_KEYS.session, { email: found.email })
      return
    }

    if (!schoolCode.trim()) {
      setAuthError('School code is required.')
      return
    }

    if (users.some((u) => u.email === email.trim())) {
      setAuthError('That email already exists.')
      return
    }

    const newUser = {
      id: `u-${Date.now()}`,
      email: email.trim(),
      password,
      displayName: displayName.trim() || email.trim(),
      role: signupRole,
      schoolCode: schoolCode.trim(),
    }

    const nextUsers = [...users, newUser]
    persistUsers(nextUsers)
    setCurrentUser(newUser)
    saveJson(STORAGE_KEYS.session, { email: newUser.email })
  }

  function saveSetup() {
    setSetupError('')
    if (!currentUser) return
    if (!setupSchoolCode.trim()) {
      setSetupError('School code is required.')
      return
    }

    const users = loadJson(STORAGE_KEYS.users, SAMPLE_USERS)
    const nextUsers = users.map((u) => u.id === currentUser.id
      ? { ...u, displayName: setupName.trim() || u.displayName, role: setupRole, schoolCode: setupSchoolCode.trim() }
      : u)

    persistUsers(nextUsers)
    const updated = nextUsers.find((u) => u.id === currentUser.id)
    if (updated) {
      setCurrentUser(updated)
      saveJson(STORAGE_KEYS.session, { email: updated.email })
    }
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEYS.session)
    setCurrentUser(null)
    setEmail('')
    setPassword('')
  }

  function saveStudent() {
    if (!currentUser) return
    const allStudents = loadJson(STORAGE_KEYS.students, [])

    const payload = {
      ...studentForm,
      ownerId: currentUser.role === 'student' ? currentUser.id : (activeStudent?.ownerId || currentUser.id),
      schoolCode: currentUser.schoolCode,
      updatedAt: new Date().toISOString(),
    }

    if (savedStudentId) {
      const nextStudents = allStudents.map((student) => student.id === savedStudentId ? { ...student, ...payload } : student)
      persistStudents(nextStudents)
    } else {
      const newStudent = {
        id: `s-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      }
      persistStudents([...allStudents, newStudent])
      setSavedStudentId(newStudent.id)
      setActiveStudentId(newStudent.id)
    }
  }

  function deleteStudent(id) {
    const allStudents = loadJson(STORAGE_KEYS.students, [])
    persistStudents(allStudents.filter((student) => student.id !== id))
    if (savedStudentId === id) {
      setSavedStudentId(null)
      setStudentForm(DEFAULT_STUDENT)
    }
  }

  function saveReminder() {
    if (!currentUser) return
    const allReminders = loadJson(STORAGE_KEYS.reminders, [])
    const newReminder = {
      id: `r-${Date.now()}`,
      title: reminderForm.title.trim(),
      dueDate: reminderForm.dueDate,
      note: reminderForm.note.trim(),
      ownerId: currentUser.id,
      schoolCode: currentUser.schoolCode,
      audience: currentUser.role,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    persistReminders([...allReminders, newReminder])
    setReminderForm(DEFAULT_REMINDER)
  }

  function sendChatMessage(e) {
    e.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed) return

    const reply = getDocumentReply(trimmed, dashboardProfile)
    setChatMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: trimmed },
      { id: `assistant-${Date.now() + 1}`, role: 'assistant', text: reply },
    ])
    setChatInput('')
  }

  function toggleReminderDone(reminder) {
    const allReminders = loadJson(STORAGE_KEYS.reminders, [])
    persistReminders(allReminders.map((item) => item.id === reminder.id ? { ...item, completed: !item.completed } : item))
  }

  function removeReminder(id) {
    const allReminders = loadJson(STORAGE_KEYS.reminders, [])
    persistReminders(allReminders.filter((item) => item.id !== id))
  }

  function handleStudentSelect(student) {
    setActiveStudentId(student.id)
    setSavedStudentId(student.id)
    setStudentForm({
      name: student.name || '',
      grade: student.grade || '',
      subjects: student.subjects || '',
      goals: student.goals || '',
      attendance: clamp(Number(student.attendance ?? 0)),
      homework: clamp(Number(student.homework ?? 0)),
      focus: clamp(Number(student.focus ?? 0)),
      mathScore: clamp(Number(student.mathScore ?? 0)),
      englishScore: clamp(Number(student.englishScore ?? 0)),
      scienceScore: clamp(Number(student.scienceScore ?? 0)),
      notes: student.notes || '',
    })
  }

  function resetDemoData() {
    saveJson(STORAGE_KEYS.users, SAMPLE_USERS)
    saveJson(STORAGE_KEYS.students, SAMPLE_STUDENTS)
    saveJson(STORAGE_KEYS.reminders, SAMPLE_REMINDERS)
    setCurrentUser(null)
    setEmail('')
    setPassword('')
    setDisplayName('')
    setSchoolCode('')
    setAuthError('')
    localStorage.removeItem(STORAGE_KEYS.session)
  }

  useEffect(() => {
    if (currentUser && !currentUser.schoolCode) {
      setSetupName(currentUser.displayName || '')
      setSetupSchoolCode(currentUser.schoolCode || '')
      setSetupRole(currentUser.role || 'student')
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="page auth-page">
        <div className="auth-card auth-surface">
          <div className="brand">
            <div className="logo">H</div>
            <div>
              <h1>Helpify</h1>
              <p>Private student support app</p>
            </div>
          </div>

          <div className="hero-stack">
            <div className="hero-card">
              <p className="eyebrow">Private by design</p>
              <h2>Support students with clarity, confidence, and a calmer plan.</h2>
              <p>
                Helpify now feels more like a modern student support hub: guided check-ins, clear progress snapshots, and a simple path from concern to action.
              </p>
              <div className="button-row">
                <button className="primary" type="button" onClick={() => setMode('signup')}>Create an account</button>
                <button className="secondary" type="button" onClick={() => setMode('login')}>Log in</button>
              </div>
            </div>

            <div className="split-grid">
              <div className="mini-card"><strong>Student</strong><p>Own profile, reminders, plans, and tutoring support.</p></div>
              <div className="mini-card"><strong>Teacher</strong><p>School roster, progress overview, and intervention tracking.</p></div>
              <div className="mini-card"><strong>Admin</strong><p>Whole-school visibility with private role-based access.</p></div>
              <div className="mini-card"><strong>Charts</strong><p>Quick view of attendance, homework, focus, and subject scores.</p></div>
            </div>
          </div>

          <div className="auth-toggle">
            <button className={mode === 'login' ? 'primary' : 'secondary'} type="button" onClick={() => setMode('login')}>Log in</button>
            <button className={mode === 'signup' ? 'primary' : 'secondary'} type="button" onClick={() => setMode('signup')}>Sign up</button>
          </div>

          <form onSubmit={handleAuth} className="form">
            {mode === 'signup' ? (
              <>
                <label>
                  Display name
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jordan Lee" />
                </label>
                <label>
                  School code
                  <input value={schoolCode} onChange={(e) => setSchoolCode(e.target.value)} placeholder="north-campus" required />
                </label>
                <label>
                  Account type
                  <select value={signupRole} onChange={(e) => setSignupRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </>
            ) : null}
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label>
              Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            {authError ? <p className="error">{authError}</p> : null}
            <button className="primary" type="submit">{mode === 'login' ? 'Log in' : 'Create account'}</button>
          </form>

          <button className="ghost" type="button" onClick={resetDemoData}>Reset demo data</button>
          <p className="muted small">Demo accounts: student@helpify.app / student123, teacher@helpify.app / teacher123, admin@helpify.app / admin123.</p>
        </div>
      </div>
    )
  }

  if (!currentUser.schoolCode) {
    return (
      <div className="page auth-page">
        <div className="auth-card">
          <div className="brand">
            <div className="logo">H</div>
            <div>
              <h1>Helpify</h1>
              <p>Complete your private account setup</p>
            </div>
          </div>
          <p className="muted">We need your role and school code before showing any student data.</p>
          <div className="form" style={{ marginTop: 16 }}>
            <label>
              Display name
              <input value={setupName} onChange={(e) => setSetupName(e.target.value)} placeholder="Your name" />
            </label>
            <label>
              School code
              <input value={setupSchoolCode} onChange={(e) => setSetupSchoolCode(e.target.value)} placeholder="north-campus" />
            </label>
            <label>
              Account type
              <select value={setupRole} onChange={(e) => setSetupRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {setupError ? <p className="error">{setupError}</p> : null}
            <button className="primary" type="button" onClick={saveSetup}>Save setup</button>
            <button className="ghost" type="button" onClick={signOut}>Log out</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="logo">H</div>
          <div>
            <h1>Helpify</h1>
            <p>{currentUser.role === 'student' ? 'Student home' : 'Teacher/admin dashboard'}</p>
          </div>
        </div>
        <div className="top-actions">
          <div className={currentUser.role === 'teacher' ? 'badge purple' : currentUser.role === 'admin' ? 'badge dark' : 'badge green'}>{ROLE_LABELS[currentUser.role] || 'Student'}</div>
          <div className="privacy-pill">School code: {currentUser.schoolCode}</div>
          <button className="ghost" onClick={signOut}>Log out</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="card hero-panel full-span">
          <div className="hero-copy">
            <p className="eyebrow">Private student support</p>
            <h2>{currentUser.role === 'student' ? `Welcome back, ${currentUser.displayName || 'student'}.` : `Welcome back, ${currentUser.displayName || 'educator'}.`}</h2>
            <p>
              Helpify turns student data into the next best action: study plans, reminders, progress charts, and tutor matches.
            </p>
            <div className="hero-badges">
              <span className="badge green">Live insights</span>
              <span className="badge purple">Support plans</span>
              <span className="badge dark">Private data</span>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span>Profiles</span><strong>{stats.total}</strong></div>
            <div className="hero-stat"><span>At risk</span><strong>{stats.atRisk}</strong></div>
            <div className="hero-stat"><span>Upcoming reminders</span><strong>{upcomingCount}</strong></div>
            <div className="hero-stat"><span>Average</span><strong>{stats.average || '—'}%</strong></div>
          </div>
          {nextReminder ? <p className="hero-footnote">Next reminder: {nextReminder.title || 'Untitled'} • {formatDate(nextReminder.dueDate)}</p> : null}
        </section>

        <section className="card full-span assistant-spotlight">
          <div className="section-header">
            <div>
              <p className="eyebrow">Featured helper</p>
              <h2>Ask Helpify</h2>
              <p className="muted">A quick support assistant is now right here on the dashboard.</p>
            </div>
            <div className="summary-pill">Try: reminder, goal, tutor</div>
          </div>
          <div className="chat-card assistant-chat">
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`chat-bubble ${message.role}`}>
                  {message.text}
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={sendChatMessage}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="What should I focus on today?" />
              <button className="primary" type="submit">Send</button>
            </form>
          </div>
        </section>

        {isTeacherOrAdmin ? (
          <section className="card full-span">
            <div className="section-header">
              <div>
                <h2>School roster</h2>
                <p className="muted">Private records for students in the same school code.</p>
              </div>
              <div className="summary-pill">Average attendance {stats.avgAttendance || '—'}%</div>
            </div>
            <div className="roster-grid">
              {students.length ? students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className={`roster-card ${activeStudent?.id === student.id ? 'active' : ''}`}
                  onClick={() => handleStudentSelect(student)}
                >
                  <strong>{student.name || 'Unnamed student'}</strong>
                  <p>{student.grade ? `Grade ${student.grade}` : 'No grade'} • {parseList(student.subjects).join(', ') || 'No subjects'}</p>
                  <div className="roster-meta">
                    <span>{average([student.attendance, student.homework, student.focus, student.mathScore, student.englishScore, student.scienceScore])}% overall</span>
                    <span>{average([student.attendance, student.homework, student.focus, student.mathScore, student.englishScore, student.scienceScore]) < 75 ? 'Needs support' : 'On track'}</span>
                  </div>
                </button>
              )) : <p className="muted">No student records yet.</p>}
            </div>
          </section>
        ) : null}

        <section className="card full-span student-home">
          <div className="section-header">
            <div>
              <h2>{currentUser.role === 'student' ? 'My support plan' : 'Selected student support plan'}</h2>
              <p className="muted">Progress charts, tasks, reminders, and tutor matches.</p>
            </div>
            <div className="summary-pill">{activeStudent ? activeStudent.name : 'No student selected'}</div>
          </div>

          <div className="home-layout">
            <div className="left-col">
              {currentUser.role === 'student' ? (
                <section className="subcard">
                  <div className="subcard-header">
                    <h3>My profile</h3>
                    <p className="muted">Update private student data and save it locally in your browser.</p>
                  </div>
                  <div className="form two-col">
                    <label><span>Name</span><input value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} /></label>
                    <label><span>Grade</span><input value={studentForm.grade} onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })} /></label>
                    <label className="full"><span>Subjects</span><input value={studentForm.subjects} onChange={(e) => setStudentForm({ ...studentForm, subjects: e.target.value })} placeholder="Math, English, Biology" /></label>
                    <label className="full"><span>Goals</span><textarea value={studentForm.goals} onChange={(e) => setStudentForm({ ...studentForm, goals: e.target.value })} /></label>
                    <label><span>Attendance</span><input type="range" min="0" max="100" value={studentForm.attendance} onChange={(e) => setStudentForm({ ...studentForm, attendance: Number(e.target.value) })} /><span className="range-value">{studentForm.attendance}%</span></label>
                    <label><span>Homework</span><input type="range" min="0" max="100" value={studentForm.homework} onChange={(e) => setStudentForm({ ...studentForm, homework: Number(e.target.value) })} /><span className="range-value">{studentForm.homework}%</span></label>
                    <label><span>Focus</span><input type="range" min="0" max="100" value={studentForm.focus} onChange={(e) => setStudentForm({ ...studentForm, focus: Number(e.target.value) })} /><span className="range-value">{studentForm.focus}%</span></label>
                    <label><span>Math</span><input type="range" min="0" max="100" value={studentForm.mathScore} onChange={(e) => setStudentForm({ ...studentForm, mathScore: Number(e.target.value) })} /><span className="range-value">{studentForm.mathScore}%</span></label>
                    <label><span>English</span><input type="range" min="0" max="100" value={studentForm.englishScore} onChange={(e) => setStudentForm({ ...studentForm, englishScore: Number(e.target.value) })} /><span className="range-value">{studentForm.englishScore}%</span></label>
                    <label><span>Science</span><input type="range" min="0" max="100" value={studentForm.scienceScore} onChange={(e) => setStudentForm({ ...studentForm, scienceScore: Number(e.target.value) })} /><span className="range-value">{studentForm.scienceScore}%</span></label>
                    <label className="full"><span>Notes</span><textarea value={studentForm.notes} onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })} placeholder="Teacher or parent notes" /></label>
                    <div className="full button-row">
                      <button className="primary" type="button" onClick={saveStudent}>Save privately</button>
                      <button className="secondary" type="button" onClick={() => setStudentForm(DEFAULT_STUDENT)}>Reset</button>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="subcard">
                  <div className="subcard-header">
                    <h3>Selected student</h3>
                    <p className="muted">Pick a student from the roster to review their private support plan.</p>
                  </div>
                  {activeStudent ? (
                    <div className="selected-student">
                      <div>
                        <strong>{activeStudent.name || 'Unnamed student'}</strong>
                        <p>{activeStudent.grade ? `Grade ${activeStudent.grade}` : 'No grade'} • {activeStudent.subjects || 'No subjects'}</p>
                      </div>
                      <div className="selected-meta">
                        <span>Attendance {activeStudent.attendance ?? '—'}%</span>
                        <span>Homework {activeStudent.homework ?? '—'}%</span>
                        <span>Focus {activeStudent.focus ?? '—'}%</span>
                      </div>
                    </div>
                  ) : <p className="muted">No student selected yet.</p>}
                </section>
              )}

              <section className="subcard">
                <div className="subcard-header">
                  <h3>Recommended tasks</h3>
                  <p className="muted">A quick list of the next best steps.</p>
                </div>
                <div className="task-list">
                  {tasks.map((task) => (
                    <article key={task.title} className="info-item">
                      <div><strong>{task.title}</strong><p>{task.detail}</p></div>
                      <span className={`task-pill ${task.priority}`}>{task.priority}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="right-col">
              <section className="subcard">
                <div className="subcard-header">
                  <h3>Progress charts</h3>
                  <p className="muted">Attendance, homework, focus, and subject performance.</p>
                </div>
                <div className="chart-stack">
                  {progressCards.map((item) => (
                    <div key={item.label} className="chart-row">
                      <div className="chart-labels"><strong>{item.label}</strong><span>{item.detail}</span></div>
                      <div className="chart-track"><div className="chart-fill" style={{ width: `${clamp(item.value)}%` }} /></div>
                      <strong>{clamp(item.value)}%</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="subcard">
                <div className="subcard-header">
                  <h3>Tutor matching</h3>
                  <p className="muted">Suggested support based on weak areas and goals.</p>
                </div>
                <div className="tutor-list">
                  {tutorMatches.map((match) => (
                    <article key={match.title} className="info-item">
                      <div><strong>{match.title}</strong><p>{match.reason}</p></div>
                      <span className="task-pill low">match</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Study plan</h2>
              <p className="muted">A simple weekly schedule that helps students improve.</p>
            </div>
          </div>
          <div className="plan-grid">
            {studyPlan.map((item) => (
              <article key={item.day} className="plan-card">
                <span>{item.day}</span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Reminders</h2>
              <p className="muted">Private reminders stored only in this browser.</p>
            </div>
          </div>
          <div className="reminder-layout">
            <div className="reminder-form form">
              <label><span>Title</span><input value={reminderForm.title} onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })} placeholder="Math quiz review" /></label>
              <label><span>Due date</span><input type="date" value={reminderForm.dueDate} onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })} /></label>
              <label><span>Note</span><textarea value={reminderForm.note} onChange={(e) => setReminderForm({ ...reminderForm, note: e.target.value })} placeholder="What should happen before this date?" /></label>
              <button className="primary" type="button" onClick={saveReminder}>Add reminder</button>
            </div>
            <div className="reminder-list">
              {reminders.length ? reminders.map((reminder) => {
                const days = daysUntil(reminder.dueDate)
                return (
                  <article key={reminder.id} className={`info-item reminder-item ${reminder.completed ? 'done' : ''}`}>
                    <div>
                      <strong>{reminder.title || 'Untitled reminder'}</strong>
                      <p>{formatDate(reminder.dueDate)} {days !== null ? `• ${days >= 0 ? `${days} days left` : `${Math.abs(days)} days overdue`}` : ''}</p>
                      {reminder.note ? <p>{reminder.note}</p> : null}
                    </div>
                    <div className="button-row">
                      <button className="secondary" type="button" onClick={() => toggleReminderDone(reminder)}>{reminder.completed ? 'Undo' : 'Done'}</button>
                      <button className="ghost" type="button" onClick={() => removeReminder(reminder.id)}>Delete</button>
                    </div>
                  </article>
                )
              }) : <p className="muted">No reminders yet.</p>}
            </div>
          </div>
        </section>

        <section className="card full-span info-strip">
          <div className="info-strip-grid">
            <div>
              <p className="eyebrow">Always improving</p>
              <h3>Built to support students, teachers, and families in one calm workspace.</h3>
            </div>
            <div className="info-strip-cards">
              <div className="mini-card"><strong>Focus</strong><p>Turn progress into actionable next steps.</p></div>
              <div className="mini-card"><strong>Momentum</strong><p>Keep reminders and support plans in one place.</p></div>
            </div>
          </div>
        </section>
      </main>
      <footer className="page-footer">
        <p>Helpify • Student support made simple</p>
      </footer>
    </div>
  )
}

export default App
