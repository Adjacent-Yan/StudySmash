import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { fetchQuiz, finishGameSession, startGameSession, submitGameAnswer } from "../api/client";

export default function Gameplay() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [runningScore, setRunningScore] = useState(0);
  const [result, setResult] = useState(null);
  const questionStartRef = useRef(Date.now());
  const quizStartRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [quizResp, sessionResp] = await Promise.all([
          fetchQuiz(quizId),
          startGameSession({ quiz_set_id: Number(quizId), mode: "solo" }),
        ]);
        if (cancelled) return;
        setQuiz(quizResp.quiz);
        setSessionId(sessionResp.session_id);
        setTimeLeft(quizResp.quiz.questions?.[0]?.time_limit_seconds ?? 15);
        questionStartRef.current = Date.now();
        quizStartRef.current = Date.now();
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load quiz");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const question = quiz?.questions?.[index] ?? null;
  const totalQuestions = quiz?.questions?.length ?? 0;

  useEffect(() => {
    if (!question || submitted || result) return;
    setTimeLeft(question.time_limit_seconds ?? 15);
    questionStartRef.current = Date.now();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleSubmit(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [question?.id, submitted, result]);

  async function handleSubmit(choiceId = selectedChoiceId, timedOut = false) {
    if (!question || submitted || !sessionId) return;
    setSubmitted(true);
    try {
      const responseTimeMs = Date.now() - questionStartRef.current;
      const resp = await submitGameAnswer(sessionId, {
        question_id: question.id,
        selected_choice_id: choiceId,
        response_time_ms: responseTimeMs,
      });
      setFeedback({ ...resp, timedOut });
      setRunningScore((prev) => prev + (resp.points_awarded || 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit answer");
    }
  }

  async function handleNext() {
    if (!quiz || !sessionId) return;
    if (index + 1 < totalQuestions) {
      setIndex((prev) => prev + 1);
      setSelectedChoiceId(null);
      setFeedback(null);
      setSubmitted(false);
      return;
    }
    try {
      const finalResult = await finishGameSession(sessionId, { duration_ms: Date.now() - quizStartRef.current });
      setResult(finalResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish game");
    }
  }

  const progressPct = useMemo(() => (totalQuestions ? Math.round(((index + 1) / totalQuestions) * 100) : 0), [index, totalQuestions]);

  if (loading) return <AppShell title="Gameplay"><div>Loading quiz...</div></AppShell>;
  if (error) return <AppShell title="Gameplay"><div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div></AppShell>;
  if (!quiz || !question) return <AppShell title="Gameplay"><div>Quiz not found.</div></AppShell>;

  if (result) {
    return (
      <AppShell title={quiz.title} subtitle="Session complete">
        <div className="mx-auto max-w-3xl glass-panel rounded-3xl p-8 text-center shadow-soft-card">
          <div className="text-sm font-semibold text-blue-700">Quiz finished</div>
          <h1 className="mt-2 text-4xl font-black">Final score: {result.total_score.toLocaleString()}</h1>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/70 p-4"><div className="text-sm text-slate-500">Correct</div><div className="text-2xl font-black">{result.correct_count}</div></div>
            <div className="rounded-2xl bg-white/70 p-4"><div className="text-sm text-slate-500">Wrong</div><div className="text-2xl font-black">{result.wrong_count}</div></div>
            <div className="rounded-2xl bg-white/70 p-4"><div className="text-sm text-slate-500">Best streak</div><div className="text-2xl font-black">{result.streak_max}</div></div>
            <div className="rounded-2xl bg-white/70 p-4"><div className="text-sm text-slate-500">Mastery</div><div className="text-2xl font-black">{result.mastery_percent}%</div></div>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/dashboard" className="rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white">Back to dashboard</Link>
            <button onClick={() => navigate(`/gameplay/${quizId}`, { replace: true })} className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white">Play again</button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={quiz.title} subtitle={`${quiz.subject} • ${quiz.topic || 'General'}`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-500">Question {index + 1} of {totalQuestions}</div>
            <div className="mt-2 h-3 w-64 overflow-hidden rounded-full bg-white/60">
              <div className="h-full bg-blue-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 px-5 py-3 text-right shadow-soft-card">
            <div className="text-sm font-semibold text-slate-500">Time left</div>
            <div className="text-2xl font-black">{timeLeft}s</div>
          </div>
          <div className="rounded-2xl bg-white/80 px-5 py-3 text-right shadow-soft-card">
            <div className="text-sm font-semibold text-slate-500">Score</div>
            <div className="text-2xl font-black">{runningScore.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-soft-card">
          <div className="text-sm font-semibold text-blue-700">Worth {question.points_base} base points</div>
          <h1 className="mt-3 text-3xl font-black">{question.question_text}</h1>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {question.choices.map((choice) => {
              const isChosen = selectedChoiceId === choice.choice_id;
              const isCorrect = feedback?.correct_choice_id === choice.choice_id;
              return (
                <button
                  key={choice.choice_id}
                  disabled={submitted}
                  onClick={() => setSelectedChoiceId(choice.choice_id)}
                  className={`rounded-2xl border px-5 py-4 text-left font-semibold transition ${isCorrect ? 'border-green-500 bg-green-50' : isChosen ? 'border-blue-500 bg-blue-50' : 'border-white/50 bg-white/70 hover:border-blue-300'}`}
                >
                  {choice.choice_text}
                </button>
              );
            })}
          </div>

          {feedback ? (
            <div className={`mt-6 rounded-2xl px-4 py-3 font-semibold ${feedback.is_correct ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {feedback.is_correct ? `Correct! +${feedback.points_awarded} points.` : `Incorrect. ${feedback.timedOut ? 'Time ran out.' : ''} Correct answer: ${feedback.correct_answer}.`}
            </div>
          ) : null}

          <div className="mt-8 flex justify-end gap-3">
            {!submitted ? (
              <button onClick={() => handleSubmit()} disabled={!selectedChoiceId} className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white disabled:opacity-50">
                Lock answer
              </button>
            ) : (
              <button onClick={handleNext} className="rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white">
                {index + 1 < totalQuestions ? 'Next question' : 'Finish quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
