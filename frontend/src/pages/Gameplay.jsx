import {
  Timer,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import {
  fetchQuiz,
  finishGameSession,
  generateQuiz,
  startGameSession,
  submitGameAnswer,
} from "../api/client";

export default function Gameplay() {
  const { quizId } = useParams();

  if (quizId) {
    return <CustomQuizGameplay quizId={quizId} />;
  }

  return <ApiQuizGameplay />;
}

/* ---------------- API GENERATED QUIZ MODE ---------------- */

function ApiQuizGameplay() {
  const location = useLocation();
  const navigate = useNavigate();

  const config = location.state || {
    categoryId: 9,
    difficulty: "easy",
    amount: 10,
    title: "General Knowledge Mix",
    categoryName: "General",
    bgmType: "general",
  };

  const audio = useGameAudio(config.bgmType || "general");
  const hasStartedBgmRef = useRef(false);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hasAnswered, setHasAnswered] = useState(false);

  const decodeBase64 = (str) => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch {
      return str;
    }
  };

  const setupQuestion = (q) => {
    const allOptions = [
      ...q.incorrectAnswers.map((text) => ({ text, isCorrect: false })),
      { text: q.correctAnswer, isCorrect: true },
    ];

    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    const labels = ["A", "B", "C", "D"];

    setOptions(
      allOptions.map((opt, i) => ({
        id: labels[i],
        text: opt.text,
        isCorrect: opt.isCorrect,
      }))
    );

    setSelectedOption(null);
    setHasAnswered(false);
    setTimeLeft(15);
  };

  useEffect(() => {
    let mounted = true;

    async function fetchQuestions() {
      setIsLoading(true);

      try {
        const data = await generateQuiz({
          amount: config.amount,
          categoryId: config.categoryId,
          difficulty: config.difficulty,
        });

        if (!mounted) return;

        if (
          data.response_code !== 0 ||
          !data.results ||
          data.results.length === 0
        ) {
          setError("Failed to fetch questions. Please try different settings.");
          setIsLoading(false);
          return;
        }

        const decodedQuestions = data.results.map((q) => ({
          question: decodeBase64(q.question),
          correctAnswer: decodeBase64(q.correct_answer),
          incorrectAnswers: q.incorrect_answers.map(decodeBase64),
          difficulty: decodeBase64(q.difficulty),
          category: decodeBase64(q.category),
        }));

        setQuestions(decodedQuestions);
        setupQuestion(decodedQuestions[0]);
        setIsLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError("Network error occurred.");
        setIsLoading(false);
      }
    }

    fetchQuestions();

    return () => {
      mounted = false;
    };
  }, [config.amount, config.categoryId, config.difficulty]);

  useEffect(() => {
    if (isLoading || error || hasAnswered || questions.length === 0 || result) {
      return;
    }

    if (timeLeft === 0) {
      setHasAnswered(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isLoading, error, hasAnswered, questions.length, result]);

  useEffect(() => {
    if (
      hasStartedBgmRef.current ||
      isLoading ||
      error ||
      questions.length === 0 ||
      result
    ) {
      return;
    }
  
    audio.startBgm(config.bgmType || "general");
    hasStartedBgmRef.current = true;
  
    return () => {
      audio.stopBgm();
    };
  }, [isLoading, error, questions.length, result, config.bgmType]);

  function handleOptionSelect(optionId) {
    if (hasAnswered) return;

    setSelectedOption(optionId);
    setHasAnswered(true);

    const isCorrect = options.find((o) => o.id === optionId)?.isCorrect;

    if (isCorrect) {
      audio.playCorrect();
      setScore((s) => s + 100 + timeLeft * 10);
    } else {
      audio.playWrong();
    }
  }

  function handleNextQuestion() {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setupQuestion(questions[nextIndex]);
    } else {
      audio.stopBgm();
      audio.playFinish();
    
      setResult({
        totalScore: score,
        totalQuestions: questions.length,
      });
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Gameplay">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Rocket className="h-12 w-12 animate-bounce text-primary" />
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-700">
              Preparing Quiz...
            </h2>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Gameplay">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-red-100 p-4 text-red-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">{error}</h2>
            <button
              onClick={() => navigate("/quizbrowse")}
              className="mt-6 rounded-full bg-primary px-8 py-3 font-bold text-white hero-glow-button"
            >
              Go Back
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (result) {
    return (
      <AppShell title={config.title} subtitle="Session complete">
        {audio.AudioElements}
        <div className="glass-panel mx-auto max-w-3xl rounded-3xl p-8 text-center shadow-soft-card">
          <div className="text-sm font-semibold text-blue-700">
            Quiz finished
          </div>
          <h1 className="mt-2 text-4xl font-black">
            Final score: {result.totalScore.toLocaleString()}
          </h1>
          <p className="mt-3 text-slate-600">
            You completed {result.totalQuestions} questions.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/dashboard"
              className="rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white"
            >
              Back to dashboard
            </Link>
            <Link
              to="/quizbrowse"
              className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white"
            >
              Play another
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const progressPct = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  return (
    <AppShell title={config.title} subtitle={config.categoryName}>
      {audio.AudioElements}
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="mt-2 h-3 w-64 overflow-hidden rounded-full bg-white/60">
              <motion.div
                animate={{ width: `${progressPct}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 px-5 py-3 text-right shadow-soft-card">
            <div className="text-sm font-semibold text-slate-500">
              Time left
            </div>
            <div className="text-2xl font-black">{timeLeft}s</div>
          </div>

          <div className="rounded-2xl bg-white/80 px-5 py-3 text-right shadow-soft-card">
            <div className="text-sm font-semibold text-slate-500">Score</div>
            <div className="text-2xl font-black">
              {score.toLocaleString()}
            </div>
          </div>
          <button 
            onClick={audio.toggleMute}
            className="rounded-2xl bg-white/80 p-3 text-slate-700 shadow-soft-card transition hover:bg-white active:scale-95"
            title={audio.isMuted ? "Unmute music" : "Mute music"}
          >
            {audio.isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8 text-center shadow-soft-card md:p-12"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-1.5">
            <Rocket className="h-4 w-4 text-slate-900" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Question {currentIndex + 1}
            </span>
          </div>

          <h2 className="mx-auto max-w-3xl text-2xl font-black leading-tight text-slate-900 md:text-4xl">
            {questions[currentIndex]?.question}
          </h2>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.isCorrect;
            const showCorrect = hasAnswered && isCorrect;
            const showWrong = hasAnswered && isSelected && !isCorrect;

            return (
              <motion.div
                key={`${currentIndex}-${option.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="relative"
              >
                <button
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={hasAnswered}
                  className={`glass-panel flex w-full items-center gap-6 rounded-2xl border-2 p-6 text-left transition-all ${
                    showCorrect
                      ? "border-emerald-400/50 bg-emerald-50"
                      : showWrong
                      ? "border-red-400/50 bg-red-50"
                      : isSelected
                      ? "border-primary/50 bg-white/90"
                      : "border-transparent hover:border-primary/50 hover:bg-white"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-black ${
                      showCorrect
                        ? "bg-emerald-100 text-emerald-600"
                        : showWrong
                        ? "bg-red-100 text-red-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {option.id}
                  </div>

                  <span className="text-lg font-bold text-slate-700">
                    {option.text}
                  </span>

                  {showCorrect && (
                    <CheckCircle2 className="ml-auto h-6 w-6 text-emerald-500" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <AnimatePresence>
            {hasAnswered && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 font-black text-white shadow-hero"
              >
                <span>
                  {currentIndex < questions.length - 1
                    ? "Next Question"
                    : "Finish Quiz"}
                </span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------------- USER CUSTOM QUIZ MODE ---------------- */

function CustomQuizGameplay({ quizId }) {
  const navigate = useNavigate();
  const audio = useGameAudio("general");
  const hasStartedBgmRef = useRef(false);

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

    async function loadQuiz() {
      try {
        const [quizResp, sessionResp] = await Promise.all([
          fetchQuiz(quizId),
          startGameSession({
            quiz_set_id: Number(quizId),
            mode: "solo",
          }),
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
    }

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const question = quiz?.questions?.[index] ?? null;
  const totalQuestions = quiz?.questions?.length ?? 0;

  const progressPct = useMemo(
    () =>
      totalQuestions
        ? Math.round(((index + 1) / totalQuestions) * 100)
        : 0,
    [index, totalQuestions]
  );

  useEffect(() => {
    if (!question || submitted || result) return;

    setTimeLeft(question.time_limit_seconds ?? 15);
    questionStartRef.current = Date.now();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(null, true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question?.id, submitted, result]);

  useEffect(() => {
    if (
      hasStartedBgmRef.current ||
      loading ||
      error ||
      !quiz ||
      result
    ) {
      return;
    }
  
    audio.startBgm("general");
    hasStartedBgmRef.current = true;
  
    return () => {
      audio.stopBgm();
    };
  }, [loading, error, quiz, result]);

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
      if (resp.is_correct) {
        audio.playCorrect();
      } else {
        audio.playWrong();
      }
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
      const finalResult = await finishGameSession(sessionId, {
        duration_ms: Date.now() - quizStartRef.current,
      });

      audio.stopBgm();
      audio.playFinish();
      setResult(finalResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish game");
    }
  }

  if (loading) {
    return (
      <AppShell title="Gameplay">
        <div className="text-sm font-semibold text-slate-500">
          Loading quiz...
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Gameplay">
        <div className="rounded-2xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </AppShell>
    );
  }

  if (!quiz || !question) {
    return (
      <AppShell title="Gameplay">
        <div>Quiz not found.</div>
      </AppShell>
    );
  }

  if (result) {
    return (
      <AppShell title={quiz.title} subtitle="Session complete">
        {audio.AudioElements}
        <div className="glass-panel mx-auto max-w-3xl rounded-3xl p-8 text-center shadow-soft-card">
          <div className="text-sm font-semibold text-blue-700">
            Quiz finished
          </div>

          <h1 className="mt-2 text-4xl font-black">
            Final score: {result.total_score.toLocaleString()}
          </h1>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <ResultStat label="Correct" value={result.correct_count} />
            <ResultStat label="Wrong" value={result.wrong_count} />
            <ResultStat label="Best streak" value={result.streak_max} />
            <ResultStat label="Mastery" value={`${result.mastery_percent}%`} />
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/dashboard"
              className="rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={quiz.title}
      subtitle={`${quiz.subject} • ${quiz.topic || "General"}`}
    >
      {audio.AudioElements}
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-500">
              Question {index + 1} of {totalQuestions}
            </div>

            <div className="mt-2 h-3 w-64 overflow-hidden rounded-full bg-white/60">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 px-5 py-3 text-right shadow-soft-card">
            <div className="text-sm font-semibold text-slate-500">
              Time left
            </div>
            <div className="text-2xl font-black">{timeLeft}s</div>
          </div>

          <div className="rounded-2xl bg-white/80 px-5 py-3 text-right shadow-soft-card">
            <div className="text-sm font-semibold text-slate-500">Score</div>
            <div className="text-2xl font-black">
              {runningScore.toLocaleString()}
            </div>
          </div>

          <button
            onClick={audio.toggleMute}
            className="rounded-2xl bg-white/80 p-3 text-slate-700 shadow-soft-card transition hover:bg-white active:scale-95"
            title={audio.isMuted ? "Unmute music" : "Mute music"}
          >
            {audio.isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-soft-card">
          <div className="text-sm font-semibold text-blue-700">
            Worth {question.points_base} base points
          </div>

          <h1 className="mt-3 text-3xl font-black">
            {question.question_text}
          </h1>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {question.choices.map((choice) => {
              const isChosen = selectedChoiceId === choice.choice_id;
              const isCorrect = feedback?.correct_choice_id === choice.choice_id;

              return (
                <button
                  key={choice.choice_id}
                  disabled={submitted}
                  onClick={() => setSelectedChoiceId(choice.choice_id)}
                  className={`rounded-2xl border px-5 py-4 text-left font-semibold transition ${
                    isCorrect
                      ? "border-green-500 bg-green-50"
                      : isChosen
                      ? "border-blue-500 bg-blue-50"
                      : "border-white/50 bg-white/70 hover:border-blue-300"
                  }`}
                >
                  {choice.choice_text}
                </button>
              );
            })}
          </div>

          {feedback ? (
            <div
              className={`mt-6 rounded-2xl px-4 py-3 font-semibold ${
                feedback.is_correct
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {feedback.is_correct
                ? `Correct! +${feedback.points_awarded} points.`
                : `Incorrect. ${
                    feedback.timedOut ? "Time ran out. " : ""
                  }Correct answer: ${feedback.correct_answer}.`}
            </div>
          ) : null}

          <div className="mt-8 flex justify-end gap-3">
            {!submitted ? (
              <button
                onClick={() => handleSubmit()}
                disabled={!selectedChoiceId}
                className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white disabled:opacity-50"
              >
                Lock answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white"
              >
                {index + 1 < totalQuestions ? "Next question" : "Finish quiz"}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ResultStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function useGameAudio(defaultBgm = "general") {
  const action = useRef(null);
  const entertainment = useRef(null);
  const epic = useRef(null);
  const focus = useRef(null);
  const general = useRef(null);
  const serious = useRef(null);

  const correctAns = useRef(null);
  const wrongAns = useRef(null);
  const finish = useRef(null);

  const currentBgmRef = useRef(null);
  const currentBgmTypeRef = useRef(defaultBgm);
  const [isMuted, setIsMuted] = useState(false);

  const bgmMap = {
    action,
    entertainment,
    epic,
    focus,
    general,
    serious,
  };

  const playSound = (ref) => {
    if (isMuted || !ref.current) return;

    ref.current.currentTime = 0;
    ref.current.play().catch(() => {});
  };

  const startBgm = (type = defaultBgm) => {
    if (isMuted) return;

    const selectedBgm = bgmMap[type] || general;
    if (!selectedBgm.current) return;

    currentBgmTypeRef.current = type;

    if (
      currentBgmRef.current === selectedBgm.current &&
      !selectedBgm.current.paused
    ) {
      return;
    }

    if (
      currentBgmRef.current &&
      currentBgmRef.current !== selectedBgm.current
    ) {
      currentBgmRef.current.pause();
      currentBgmRef.current.currentTime = 0;
    }

    currentBgmRef.current = selectedBgm.current;
    currentBgmRef.current.volume = 0.25;
    currentBgmRef.current.loop = true;
    currentBgmRef.current.play().catch(() => {});
  };

  const stopBgm = () => {
    if (!currentBgmRef.current) return;

    currentBgmRef.current.pause();
    currentBgmRef.current.currentTime = 0;
    currentBgmRef.current = null;
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;

      if (nextMuted) {
        if (currentBgmRef.current) {
          currentBgmRef.current.pause();
        }
      } else {
        const selectedBgm =
          bgmMap[currentBgmTypeRef.current]?.current || general.current;

        if (selectedBgm) {
          currentBgmRef.current = selectedBgm;
          currentBgmRef.current.volume = 0.25;
          currentBgmRef.current.loop = true;
          currentBgmRef.current.play().catch(() => {});
        }
      }

      return nextMuted;
    });
  };

  const AudioElements = (
    <>
      <audio ref={action} src="/sounds/bgMusics/action.mp3" preload="auto" />
      <audio ref={entertainment} src="/sounds/bgMusics/entertainment.mp3" preload="auto" />
      <audio ref={epic} src="/sounds/bgMusics/epic.mp3" preload="auto" />
      <audio ref={focus} src="/sounds/bgMusics/focus.mp3" preload="auto" />
      <audio ref={general} src="/sounds/bgMusics/general.mp3" preload="auto" />
      <audio ref={serious} src="/sounds/bgMusics/serious.mp3" preload="auto" />

      <audio ref={correctAns} src="/sounds/soundEffects/correct.mp3" preload="auto" />
      <audio ref={wrongAns} src="/sounds/soundEffects/wrong.mp3" preload="auto" />
      <audio ref={finish} src="/sounds/soundEffects/finish.mp3" preload="auto" />
    </>
  );

  return {
    AudioElements,
    isMuted,
    toggleMute,
    startBgm,
    stopBgm,
    playCorrect: () => playSound(correctAns),
    playWrong: () => playSound(wrongAns),
    playFinish: () => playSound(finish),
  };
}