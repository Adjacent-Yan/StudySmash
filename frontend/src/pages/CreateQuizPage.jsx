import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { createQuiz } from "../api/client";

function makeQuestion() {
  return {
    question_text: "",
    question_type: "multiple_choice",
    time_limit_seconds: 15,
    points_base: 100,
    choices: ["", "", "", ""],
    correct_choice_index: 0,
  };
}

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [questions, setQuestions] = useState([makeQuestion()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateQuestion(index, changes) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...changes } : q)));
  }

  return (
    <AppShell title="Create quiz" subtitle="Build a playable quiz set that immediately works with the gameplay flow.">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Quiz title</span>
            <input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-4" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Subject</span>
            <input id="quiz-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-4" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Topic</span>
            <input id="quiz-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-4" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Visibility</span>
            <select id="quiz-visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-4">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
        </div>
        <label className="space-y-2">
          <span className="block text-sm font-semibold text-slate-700">Quiz description</span>
          <textarea id="quiz-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Quiz description" rows={4} className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-4" />
        </label>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="glass-panel rounded-3xl p-6 shadow-soft-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Question {qIndex + 1}</h2>
              {questions.length > 1 ? <button onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIndex))} className="font-bold text-red-600">Remove</button> : null}
            </div>
            <label className="mb-4 block space-y-2">
              <span className="block text-sm font-semibold text-slate-700">Question text</span>
              <input value={question.question_text} onChange={(e) => updateQuestion(qIndex, { question_text: e.target.value })} placeholder="Question text" className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-4" />
            </label>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-semibold text-slate-700">Time limit (seconds)</span>
                <input type="number" min="5" max="120" value={question.time_limit_seconds} onChange={(e) => updateQuestion(qIndex, { time_limit_seconds: Number(e.target.value) })} placeholder="Time limit" className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-4" />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-semibold text-slate-700">Base points</span>
                <input type="number" min="50" step="50" value={question.points_base} onChange={(e) => updateQuestion(qIndex, { points_base: Number(e.target.value) })} placeholder="Base points" className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-4" />
              </label>
            </div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Choices (select the correct answer)</p>
            <div className="grid gap-3 md:grid-cols-2">
              {question.choices.map((choice, choiceIndex) => (
                <label key={choiceIndex} className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/70 px-4 py-3">
                  <input type="radio" name={`correct-${qIndex}`} checked={question.correct_choice_index === choiceIndex} onChange={() => updateQuestion(qIndex, { correct_choice_index: choiceIndex })} />
                  <input
                    value={choice}
                    onChange={(e) => {
                      const next = [...question.choices];
                      next[choiceIndex] = e.target.value;
                      updateQuestion(qIndex, { choices: next });
                    }}
                    placeholder={`Choice ${choiceIndex + 1}`}
                    className="w-full bg-transparent outline-none"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
        {error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}
        <div className="flex flex-wrap gap-4">
          <button onClick={() => setQuestions((prev) => [...prev, makeQuestion()])} className="rounded-2xl bg-white/80 px-5 py-4 font-bold text-slate-900">Add question</button>
          <button
            disabled={saving}
            onClick={async () => {
              setError("");
              setSaving(true);
              try {
                const payload = {
                  title,
                  description,
                  subject,
                  topic,
                  visibility,
                  questions: questions.map((q) => ({
                    ...q,
                    choices: q.choices.map((choice) => choice.trim()).filter(Boolean),
                  })),
                };
                const resp = await createQuiz(payload);
                navigate(`/gameplay/${resp.quiz_id}`);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not create quiz");
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-2xl bg-blue-500 px-5 py-4 font-bold text-white shadow-hero-glow disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save quiz"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
