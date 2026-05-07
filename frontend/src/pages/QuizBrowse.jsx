import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import FilterPanel from "../components/FilterPanel";
import QuizCard from "../components/QuizCard";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, X } from "lucide-react";
import AppShell from "../components/AppShell";
import {
  clearSession,
  fetchDashboard,
  getToken,
  formatPoints,
  fetchCategories,
} from "../api/client";

const colorStyles = {
  primary: {
    border: "border-primary",
    rankBg: "bg-primary",
    rankText: "text-surface",
  },
  tertiary: {
    border: "border-tertiary",
    rankBg: "bg-tertiary",
    rankText: "text-surface",
  },
  muted: {
    border: "border-on-surface-variant",
    rankBg: "bg-on-surface-variant",
    rankText: "text-on-surface",
  },
};

function LeaderboardItem({ rank, name, lvl, pts, image, isUser = false }) {
  let styles = colorStyles.muted;

  if (rank === 1) styles = colorStyles.tertiary;
  if (isUser) styles = colorStyles.primary;

  return (
    <div
      className={`flex items-center justify-between rounded-lg p-3 transition-all ${
        isUser
          ? "border-2 border-primary bg-surface-high shadow-[0_0_15px_rgba(173,226,251,0.2)]"
          : "border border-white/5 bg-surface-low"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`h-10 w-10 overflow-hidden rounded-full border-2 ${styles.border}`}>
            <img
              src={image || `https://api.dicebear.com/7.x/thumbs/svg?seed=${name}`}
              alt={name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div
            className={`absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${styles.rankBg} ${styles.rankText}`}
          >
            {rank}
          </div>
        </div>

        <div>
          <div className={`text-sm font-bold ${isUser ? "text-primary" : "text-on-surface"}`}>
            {name}
          </div>
          <div
            className={`text-[10px] font-black uppercase tracking-widest ${
              isUser ? "text-primary/70" : "text-on-surface-variant"
            }`}
          >
            LVL {lvl}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div
          className={`font-black ${
            rank === 1 ? "text-tertiary" : isUser ? "text-primary" : "text-on-surface"
          }`}
        >
          {pts}
        </div>
        <div className="text-[9px] font-bold uppercase text-on-surface-variant">
          PTS
        </div>
      </div>
    </div>
  );
}

function getBgmTypeForCategory(categoryName = "") {
  const name = categoryName.toLowerCase();

  if (
    name.includes("general knowledge") ||
    name.includes("geography") ||
    name.includes("celebrities") ||
    name.includes("animals")
  ) {
    return "general";
  }

  if (name.includes("science")) {
    return "focus";
  }

  if (name.includes("mythology")) {
    return "epic";
  }

  if (name.includes("sports") || name.includes("vehicles")) {
    return "action";
  }

  if (name.includes("history") || name.includes("politics")) {
    return "serious";
  }

  if (name.includes("entertainment") || name.includes("art")) {
    return "entertainment";
  }

  return "general";
}

export default function QuizBrowse() {
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configData, setConfigData] = useState({
    amount: 10,
    difficulty: "easy",
  });
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchDashboard();

        if (!cancelled) {
          setDash(data);
        }
      } catch (e) {
        if (cancelled) return;

        const status =
          e && typeof e === "object" && "status" in e ? e.status : null;

        if (status === 401) {
          clearSession();
          navigate("/login", { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    fetchCategories()
      .then((data) => {
        if (mounted && data && data.trivia_categories) {
          setCategories(data.trivia_categories);
        }
      })
      .catch((err) => {
        console.error("Could not fetch categories", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const leaderboard = dash?.leaderboard ?? [];

  const handleStartQuiz = (quiz) => {
    setSelectedCategory(quiz);
    setIsModalOpen(true);
  };

  const handleConfirmStart = () => {
    setIsModalOpen(false);
  
    navigate("/gameplay", {
      state: {
        categoryId: selectedCategory.categoryId,
        difficulty: configData.difficulty,
        amount: configData.amount,
        title: selectedCategory.title,
        categoryName: selectedCategory.category,
        bgmType: getBgmTypeForCategory(selectedCategory.title),
      },
    });
  };

  const colorClasses = [
    "bg-primary/10 text-primary border-primary/20",
    "bg-secondary/10 text-secondary border-secondary/20",
    "bg-tertiary/10 text-tertiary border-tertiary/20",
    "bg-sky-500/10 text-sky-600 border-sky-500/20",
    "bg-purple-500/10 text-purple-600 border-purple-500/20",
  ];

  const mappedQuizzes = categories.map((cat, i) => ({
    id: cat.id,
    title: cat.name,
    category: cat.name.split(":")[0].trim(),
    categoryId: cat.id,
    difficulty: "Mixed",
    questionCount: "Varies",
    durationMinutes: 15,
    avatars: [
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${cat.id}L`,
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${cat.id}R`,
    ],
    participantCount: 120 + i * 7,
    colorClass: colorClasses[i % colorClasses.length],
  }));

  const uniqueCategories = Array.from(
    new Set(mappedQuizzes.map((q) => q.category))
  );

  const mainCategories = ["All", ...uniqueCategories];

  const filteredQuizzes =
    activeCategoryFilter === "All"
      ? mappedQuizzes
      : mappedQuizzes.filter((q) => q.category === activeCategoryFilter);

  return (
    <AppShell
      title="Browse Quiz"
      subtitle="Choose your next challenge and start a trivia match."
    >
      <main className="mx-auto w-full max-w-5xl pb-28 md:pb-12">
        <div className="space-y-8">
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
              id="hero-header"
            >
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-sky-700">
                  StudySmash Explorer
                </span>
                <span className="rounded-full bg-secondary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-purple-700">
                  Powered by Trivia API
                </span>
              </div>

              <h1 className="mb-4 text-5xl font-black tracking-[-0.025em] text-on-surface md:text-6xl">
                Choose Your Next{" "}
                <span className="bg-gradient-to-r from-primary-dim to-secondary-dim bg-clip-text text-transparent">
                  Challenge
                </span>
              </h1>

              <p className="max-w-2xl text-lg font-medium text-on-surface-variant">
                Explore thousands of community-crafted quizzes or test your
                knowledge with daily featured topics. Level up your profile with
                every correct answer.
              </p>
            </motion.header>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <FilterPanel />
            </motion.div>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-4"
              id="categories"
            >
              {mainCategories.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setActiveCategoryFilter(catName)}
                  className={`whitespace-nowrap rounded-full border px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                    activeCategoryFilter === catName
                      ? "border-primary bg-primary text-surface"
                      : "border-white/10 bg-surface-high text-on-surface-variant hover:border-primary/50"
                  }`}
                >
                  {catName}
                </button>
              ))}
            </motion.section>

            <motion.section
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              className="flex flex-col gap-4"
              id="quiz-grid"
            >
              {filteredQuizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <QuizCard
                    quiz={quiz}
                    onStart={handleStartQuiz}
                    layout="horizontal"
                  />
                </motion.div>
              ))}
            </motion.section>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-surface text-on-surface shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-surface-high p-6">
                <div>
                  <h3 className="text-xl font-black tracking-tighter">
                    Configure Match
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {selectedCategory.title}
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-widest text-on-surface-variant">
                    Question Amount
                  </label>

                  <div className="flex gap-3">
                    {[10, 15, 20].map((amt) => (
                      <button
                        key={amt}
                        onClick={() =>
                          setConfigData({ ...configData, amount: amt })
                        }
                        className={`flex-1 rounded-xl border-2 py-3 text-sm font-black transition-all ${
                          configData.amount === amt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 text-on-surface-variant hover:border-primary/50"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-black uppercase tracking-widest text-on-surface-variant">
                    Difficulty
                  </label>

                  <div className="flex gap-3">
                    {["easy", "medium", "hard"].map((diff) => (
                      <button
                        key={diff}
                        onClick={() =>
                          setConfigData({ ...configData, difficulty: diff })
                        }
                        className={`flex-1 rounded-xl border-2 py-3 text-sm font-black capitalize transition-all ${
                          configData.difficulty === diff
                            ? "border-secondary bg-secondary/10 text-secondary"
                            : "border-white/10 text-on-surface-variant hover:border-secondary/50"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleConfirmStart}
                  className="hero-glow-button mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-black tracking-widest text-on-primary transition-transform hover:bg-primary-dim active:scale-95"
                >
                  START QUIZ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}