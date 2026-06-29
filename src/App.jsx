import { useEffect, useMemo, useState } from 'react'
import { questions } from './challenge'

const STORAGE_KEY = 'deluxeWordChallengeState'
const EMAIL_DOMAIN = 'bydeluxe.com'
const QUESTION_COUNT = 25
const TIMER_SECONDS = 15

const shuffle = (items) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const shuffleQuestionOptions = (question) => ({
  ...question,
  options: shuffle(question.options)
})

const loadState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return stored && stored.leaderboard && stored.usedEmails
      ? stored
      : { leaderboard: [], usedEmails: {} }
  } catch {
    return { leaderboard: [], usedEmails: {} }
  }
}

const formatEmail = (value) => value.trim().toLowerCase()

function App() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loggedInEmail, setLoggedInEmail] = useState('')
  const [quizReady, setQuizReady] = useState(false)
  const [questionSet, setQuestionSet] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [storage, setStorage] = useState(() => ({ leaderboard: [], usedEmails: {} }))
  const [lockedEntry, setLockedEntry] = useState(null)

  useEffect(() => {
    setStorage(loadState())
  }, [])

  useEffect(() => {
    if (!quizReady || completed || submitted) return
    if (timeLeft <= 0) {
      handleAdvance(false)
      return
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [quizReady, completed, submitted, timeLeft])

  const topLeaderboard = useMemo(
    () =>
      [...storage.leaderboard]
        .sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
        .slice(0, 10),
    [storage.leaderboard]
  )

  const totalQuestions = questionSet.length || QUESTION_COUNT
  const currentQuestion = questionSet[currentIndex] || {}
  const currentCategory =
    currentQuestion.category || (currentQuestion.id <= 10 ? 'English' : 'Localization')
  const progressLabel = `Question ${currentIndex + 1} of ${totalQuestions}`

  const saveProgress = (entry) => {
    const nextState = {
      leaderboard: [...storage.leaderboard, entry],
      usedEmails: {
        ...storage.usedEmails,
        [entry.email]: entry
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
    setStorage(nextState)
  }

  const handleAdvance = (isCorrect) => {
    const nextScore = score + (isCorrect ? 1 : 0)
    const nextIndex = currentIndex + 1

    if (nextIndex >= totalQuestions) {
      const completedEntry = {
        email: loggedInEmail,
        score: nextScore,
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }
      saveProgress(completedEntry)
      setScore(nextScore)
      setCompleted(true)
      setSelected('')
      setSubmitted(false)
      setQuizReady(false)
      return
    }

    setScore(nextScore)
    setCurrentIndex(nextIndex)
    setSelected('')
    setSubmitted(false)
    setLastCorrect(false)
    setTimeLeft(TIMER_SECONDS)
  }

  const handleLogin = (event) => {
    event.preventDefault()
    const cleaned = formatEmail(email)
    const validEmail = new RegExp(`^[^@\\s]+@${EMAIL_DOMAIN}$`, 'i')

    if (!validEmail.test(cleaned)) {
      setEmailError(`Please use your ${EMAIL_DOMAIN} email address.`)
      return
    }

    if (storage.usedEmails[cleaned]) {
      setLockedEntry(storage.usedEmails[cleaned])
      setEmailError('This email has already completed the challenge.')
      return
    }

    setLoggedInEmail(cleaned)
    setQuestionSet(
      shuffle(questions)
        .slice(0, QUESTION_COUNT)
        .map(shuffleQuestionOptions)
    )
    setQuizReady(true)
    setCurrentIndex(0)
    setScore(0)
    setSelected('')
    setSubmitted(false)
    setLastCorrect(false)
    setCompleted(false)
    setTimeLeft(TIMER_SECONDS)
    setLockedEntry(null)
    setEmailError('')
  }

  const renderLeaderboard = () => (
    <div className="leaderboard-card animate-slideUp">
      <div className="card-header">
        <span className="eyebrow">Top 10</span>
        <h3>Leaderboard</h3>
      </div>
      <ol className="leaderboard-list">
        {topLeaderboard.length === 0 ? (
          <li className="leaderboard-empty">No completed entries yet.</li>
        ) : (
          topLeaderboard.map((entry, index) => (
            <li key={`${entry.email}-${entry.timestamp}`} className={index < 3 ? 'top-rank' : ''}>
              <span className="leaderboard-rank">{index + 1}</span>
              <div className="leaderboard-meta">
                <strong>{entry.email}</strong>
                <span>{entry.date}</span>
              </div>
              <span className="leaderboard-score">{entry.score}/25</span>
            </li>
          ))
        )}
      </ol>
    </div>
  )

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Deluxe Media Group</p>
          <h1>SC Department Word Challenge</h1>
          <p className="hero-copy">
            Localize with confidence — sharpen your language, workflow, and cultural context in one focused challenge.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>Questions</span>
            <strong>25</strong>
          </div>
          <div className="stat-card">
            <span>Duration for each</span>
            <strong>15 seconds</strong>
          </div>
          <div className="stat-card">
            <span>Single attempt</span>
            <strong>You only get one shot</strong>
          </div>
        </div>
      </header>

      <main className="main-grid">
        {!quizReady && !completed && (
          <>
            <section className="login-card animate-fadeIn">
              <div className="card-header login-header">
                <p className="login-title">Login</p>
              </div>
              <p className="login-subtitle">
                Sign in with your Deluxe email to enter the localization vocabulary and workflow quiz.
              </p>

              <form className="login-form" onSubmit={handleLogin}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@bydeluxe.com"
                  autoComplete="email"
                />
                {emailError && <p className="input-error">{emailError}</p>}
                {lockedEntry && (
                  <div className="locked-card">
                    <p>
                      This account already completed the challenge with a score of{' '}
                      <strong>{lockedEntry.score}/25</strong>.
                    </p>
                  </div>
                )}
                <div className="login-actions">
                  <button type="submit" className="submit-button login-button">
                    Start your one shot
                  </button>
                </div>
              </form>
            </section>
            {renderLeaderboard()}
          </>
        )}

        {quizReady && !completed && (
          <section className="quiz-card animate-fadeIn">
            <div className="quiz-header">
              <div>
                <p className="eyebrow">Live challenge</p>
                <h2>{currentQuestion.prompt}</h2>
                {currentCategory && (
                  <span className={`category-pill ${currentCategory.toLowerCase()}`}>
                    {currentCategory}
                  </span>
                )}
              </div>
              <div className="quiz-status">
                <span className="status-pill">{progressLabel}</span>
                <span className="timer-pill">{timeLeft}s</span>
              </div>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${((QUESTION_COUNT - currentIndex - 1) / QUESTION_COUNT) * 100}%` }}
              />
            </div>

            <div className="options-grid">
              {currentQuestion.options.map((option) => {
                const isSelected = selected === option
                const isCorrectOption = submitted && option === currentQuestion.answer
                const isWrongSelection = submitted && isSelected && !lastCorrect

                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-button ${isSelected ? 'selected' : ''} ${isCorrectOption ? 'correct' : ''} ${isWrongSelection ? 'incorrect' : ''}`}
                    onClick={() => !submitted && setSelected(option)}
                    disabled={submitted}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <div className="actions actions-quiz">
              <button
                type="button"
                className="submit-button"
                onClick={() => {
                  if (!selected || submitted) return
                  const isCorrect = selected === currentQuestion.answer
                  setSubmitted(true)
                  setLastCorrect(isCorrect)
                  if (isCorrect) {
                    setScore((prev) => prev + 1)
                  }
                  window.setTimeout(() => handleAdvance(isCorrect), 900)
                }}
                disabled={!selected || submitted}
              >
                {submitted ? 'Checking...' : 'Submit answer'}
              </button>
              <div className="score-chip">
                <span>Current score</span>
                <strong>{score}</strong>
              </div>
            </div>
          </section>
        )}

        {completed && (
          <section className="completion-card animate-fadeIn">
            <div className="completion-panel">
              <p className="eyebrow">Challenge complete</p>
              <h2>Well done, {loggedInEmail}</h2>
              <p className="completion-copy">
                Your score has been recorded. Great work applying localization, workflow, and English
                knowledge to the Deluxe challenge.
              </p>
              <div className="completion-stats">
                <div className="completion-stat">
                  <span>Total score</span>
                  <strong>{score}/25</strong>
                </div>
                <div className="completion-stat">
                  <span>Attempt</span>
                  <strong>One time only</strong>
                </div>
              </div>
            </div>
            {renderLeaderboard()}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
