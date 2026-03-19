import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BauhausButton from "@/components/BauhausButton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle } from "lucide-react";

interface AddedPlayer {
  email: string;
  username: string;
}

interface QuestionDraft {
  content: string;
  correct_answer: string;
  answers: string[];
}

const emptyQuestion = (): QuestionDraft => ({
  content: "",
  correct_answer: "",
  answers: ["", "", "", ""],
});

const HostGame = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const [playerEmail, setPlayerEmail] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [addedPlayers, setAddedPlayers] = useState<AddedPlayer[]>([]);

  // Quiz state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizId, setQuizId] = useState<number | null>(null);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState(false);

  const handleAddPlayer = async () => {
    if (!playerEmail.trim()) {
      toast.error("enter a player email.");
      return;
    }
    setAddingPlayer(true);
    try {
      const data = await api.addPlayer(gamePin!, playerEmail.trim());
      const username = data.username || data.nickname || data.name || data.player?.name || "unknown";
      setAddedPlayers((prev) => [...prev, { email: playerEmail.trim(), username }]);
      toast.success(`player added: ${username}`);
      setPlayerEmail("");
    } catch (err: any) {
      toast.error(err.message || "failed to add player.");
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizTitle.trim()) {
      toast.error("enter a quiz title.");
      return;
    }
    setCreatingQuiz(true);
    try {
      const data = await api.addQuiz(gamePin!, quizTitle.trim());
      const id = data.quiz_id || data.q_id || data.id || data.quiz?.q_id;
      setQuizId(id);
      toast.success("quiz created. now add questions.");
    } catch (err: any) {
      toast.error(err.message || "failed to create quiz.");
    } finally {
      setCreatingQuiz(false);
    }
  };

  const updateQuestion = (idx: number, field: keyof QuestionDraft, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const updateAnswer = (qIdx: number, aIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, answers: q.answers.map((a, j) => (j === aIdx ? value : a)) } : q
      )
    );
  };

  const setCorrectAnswer = (qIdx: number, aIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, correct_answer: q.answers[aIdx] } : q
      )
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveQuestions = async () => {
    if (!quizId) {
      toast.error("create a quiz first.");
      return;
    }
    const valid = questions.every(
      (q) => q.content.trim() && q.correct_answer.trim() && q.answers.filter((a) => a.trim()).length >= 2
    );
    if (!valid) {
      toast.error("each question needs content, at least 2 answers, and a correct answer selected.");
      return;
    }
    setSavingQuestions(true);
    try {
      const cleaned = questions.map((q) => ({
        content: q.content.trim(),
        correct_answer: q.correct_answer.trim(),
      }));
      await api.addQuestions(quizId, cleaned);
      toast.success(`${cleaned.length} question(s) saved.`);
      setSavedQuestions(true);
    } catch (err: any) {
      toast.error(err.message || "failed to save questions.");
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleStart = async () => {
    try {
      await api.initializeGame(gamePin!);
      toast.success("game started.");
    } catch (err: any) {
      toast.error(err.message || "failed to start game.");
    }
  };

  const answerColors = [
    "bg-primary text-primary-foreground",
    "bg-accent text-accent-foreground",
    "bg-secondary text-secondary-foreground",
    "bg-foreground text-background",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b-2 border-foreground flex items-center justify-between px-8 py-4">
        <button onClick={() => navigate("/host/dashboard")} className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← dashboard
        </button>
        <h1 className="text-2xl font-display font-black tracking-tighter">qwizza.</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        {/* PIN display */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
          className="md:col-span-3 bg-accent flex flex-col items-center justify-center p-8 border-b-2 md:border-b-0 md:border-r-2 border-foreground"
        >
          <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-accent-foreground mb-4">game pin</p>
          <p className="text-7xl md:text-9xl font-display font-black tracking-tighter text-accent-foreground tabular md:[writing-mode:vertical-lr] md:rotate-180">
            {gamePin}
          </p>
        </motion.div>

        {/* Control */}
        <div className="md:col-span-9 p-8 md:p-16 flex flex-col items-start justify-start gap-8 overflow-y-auto">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-2">control room</p>
            <h2 className="text-4xl font-display font-black tracking-tighter">game {gamePin}</h2>
          </div>

          {/* Quiz Section */}
          <div className="border-2 border-foreground w-full">
            <div className="bg-primary p-6 border-b-2 border-foreground">
              <p className="text-xs uppercase tracking-[0.2em] font-body font-bold text-primary-foreground">quiz editor</p>
            </div>
            <div className="p-8">
              {!quizId ? (
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground">step 1 — create a quiz</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateQuiz()}
                      placeholder="quiz title"
                      className="flex-1 px-4 py-3 border-2 border-foreground bg-background font-body focus:outline-none"
                    />
                    <BauhausButton color="primary" onClick={handleCreateQuiz} disabled={creatingQuiz}>
                      {creatingQuiz ? "creating..." : "create quiz"}
                    </BauhausButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground">step 2 — add questions</p>
                      <p className="font-display font-black text-lg tracking-tighter mt-1">"{quizTitle}"</p>
                    </div>
                    {savedQuestions && (
                      <div className="bg-accent border-2 border-foreground px-3 py-1 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <p className="text-xs uppercase tracking-[0.2em] font-body font-bold text-accent-foreground">saved</p>
                      </div>
                    )}
                  </div>

                  {questions.map((q, qIdx) => (
                    <motion.div
                      key={qIdx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: qIdx * 0.05, ease: [0, 0, 0, 1] }}
                      className="border-2 border-foreground"
                    >
                      <div className="bg-secondary p-4 border-b-2 border-foreground flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] font-body font-bold">question {qIdx + 1}</p>
                        {questions.length > 1 && (
                          <button onClick={() => removeQuestion(qIdx)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="p-6 space-y-4">
                        <input
                          type="text"
                          value={q.content}
                          onChange={(e) => updateQuestion(qIdx, "content", e.target.value)}
                          placeholder="enter your question"
                          className="w-full px-4 py-3 border-2 border-foreground bg-background font-body text-lg focus:outline-none"
                        />
                        <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground">
                          answers — click to mark correct
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.answers.map((a, aIdx) => (
                            <div key={aIdx} className="flex gap-2">
                              <input
                                type="text"
                                value={a}
                                onChange={(e) => updateAnswer(qIdx, aIdx, e.target.value)}
                                placeholder={`option ${aIdx + 1}`}
                                className={`flex-1 px-4 py-3 border-2 border-foreground font-body focus:outline-none ${
                                  q.correct_answer && q.correct_answer === a && a.trim()
                                    ? answerColors[aIdx % answerColors.length]
                                    : "bg-background"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (a.trim()) setCorrectAnswer(qIdx, aIdx);
                                }}
                                className={`w-12 border-2 border-foreground flex items-center justify-center transition-colors ${
                                  q.correct_answer && q.correct_answer === a && a.trim()
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-background text-muted-foreground hover:bg-secondary"
                                }`}
                                title="mark as correct"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="flex gap-3 flex-wrap">
                    <BauhausButton color="secondary" onClick={addQuestion}>
                      <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> add question</span>
                    </BauhausButton>
                    <BauhausButton color="primary" onClick={handleSaveQuestions} disabled={savingQuestions}>
                      {savingQuestions ? "saving..." : `save ${questions.length} question(s)`}
                    </BauhausButton>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Player */}
          <div className="border-2 border-foreground p-8 w-full">
            <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-4">add player by email</p>
            <div className="flex gap-3">
              <input
                type="email"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                placeholder="player@email.com"
                className="flex-1 px-4 py-3 border-2 border-foreground bg-background font-body focus:outline-none"
              />
              <BauhausButton color="primary" onClick={handleAddPlayer} disabled={addingPlayer}>
                {addingPlayer ? "adding..." : "add"}
              </BauhausButton>
            </div>
          </div>

          {/* Players list */}
          <div className="border-2 border-foreground p-8 w-full">
            <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-4">players ({addedPlayers.length})</p>
            {addedPlayers.length === 0 ? (
              <div className="animate-pulse-block bg-secondary border-2 border-foreground p-6 text-center">
                <p className="font-display font-black text-xl tracking-tighter">no players yet.</p>
                <p className="text-xs uppercase tracking-[0.2em] font-body text-muted-foreground mt-2">
                  add players above or share pin: {gamePin}
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {addedPlayers.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.03, ease: [0, 0, 0, 1] }}
                    className="border-2 border-foreground border-b-0 last:border-b-2 p-4 flex items-center justify-between bg-background hover:bg-secondary transition-colors"
                  >
                    <div>
                      <p className="font-display font-black tracking-tighter">{p.username}</p>
                      <p className="text-xs font-body text-muted-foreground">{p.email}</p>
                    </div>
                    <div className="bg-accent border-2 border-foreground px-3 py-1">
                      <p className="text-xs uppercase tracking-[0.2em] font-body font-bold text-accent-foreground">joined</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <BauhausButton color="foreground" onClick={handleStart} className="w-full md:w-auto">
            start machine
          </BauhausButton>
        </div>
      </div>
    </div>
  );
};

export default HostGame;
