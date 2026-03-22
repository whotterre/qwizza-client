import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnswerBlock from "@/components/AnswerBlock";
import { useSocket } from "@/hooks/useSocket";
import useSounds from "@/hooks/useSounds";
import { toast } from "sonner";

const colors: ("red" | "yellow" | "blue" | "black")[] = ["red", "blue", "yellow", "black"];

interface Answer {
  a_id: number;
  qu_id: number;
  content: string;
}

interface QuestionPayload {
  question: {
    qu_id: number;
    content: string;
    answers?: Answer[];
  };
  windowStart: number;
  windowEnd: number;
  remaining: number;
}

const PlayerGame = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();

  const nickname = useRef(localStorage.getItem("qwizza_player_nickname")).current;

  const [selected, setSelected] = useState<number | null>(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [question, setQuestion] = useState<QuestionPayload["question"]>({
    qu_id: 0,
    content: "Waiting for the next question...",
    answers: [
      { a_id: 0, qu_id: 0, content: "Option A" },
      { a_id: 1, qu_id: 0, content: "Option B" },
      { a_id: 2, qu_id: 0, content: "Option C" },
      { a_id: 3, qu_id: 0, content: "Option D" },
    ],
  });

  const [timeRemaining, setTimeRemaining] = useState(100);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const windowTimesRef = useRef<{ start: number; end: number } | null>(null);
  const questionIdRef = useRef<number>(0);
  const totalQuestionsRef = useRef<number>(0);

  const { emit, on } = useSocket({
    onConnect: () => {
      emit("PLAYER_JOIN", { gamePin, nickname });
    },
  });

  const { play: playAnswerSound } = useSounds("answerSelect");
  const { play: playGameEndSound } = useSounds("gameEnd");

  useEffect(() => {
    const unsubscribeQuestion = on("QUESTION", (payload: any) => {
      setGameStarted(true);
      setQuestion(payload.question);
      questionIdRef.current = payload.question.qu_id;
      windowTimesRef.current = { start: payload.windowStart, end: payload.windowEnd };

      const total = totalQuestionsRef.current || payload.remaining + 1;
      totalQuestionsRef.current = total;
      setTotalQuestions(total);
      setCurrentQuestion(total - payload.remaining);

      setSelected(null);
      setAnswerLocked(false);

      if (timerRef.current) clearInterval(timerRef.current);

      const updateTimer = () => {
        if (windowTimesRef.current) {
          const now = Date.now();
          const { start, end } = windowTimesRef.current;
          const remaining = Math.max(0, end - now);
          const percentage = (remaining / (end - start)) * 100;
          setTimeRemaining(percentage);
          if (remaining === 0 && timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    });

    const unsubscribePlayerJoined = on("PLAYER_JOINED", (payload: { nickname: string }) => {
      // Only show join toasts in lobby, not mid-game
      if (!gameStarted && payload.nickname !== nickname) {
        toast.success(`${payload.nickname} joined the game!`);
      }
    });

    const unsubscribeAnswerResult = on("ANSWER_RESULT", (payload: any) => {
      if (payload.isCorrect) {
        toast.success(`Correct! +${payload.score.toFixed(2)} points`);
      } else {
        toast.error(`Wrong! Correct answer: ${payload.correctAnswer}`);
      }
    });

    const unsubscribeGameOver = on("GAME_OVER", (_payload: any) => {
      playGameEndSound();
      toast.success("Quiz finished! Moving to results...");
      setTimeout(() => {
        navigate(`/player/results/${gamePin}`);
      }, 500);
    });

    const unsubscribeError = on("ERROR", (payload: any) => {
      const msg = payload?.message || "Something went wrong.";
      if (msg.includes("already answered")) return;
      toast.error(msg);
    });

    return () => {
      unsubscribeQuestion();
      unsubscribePlayerJoined();
      unsubscribeAnswerResult();
      unsubscribeGameOver();
      unsubscribeError();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [on, nickname, gamePin, navigate, gameStarted]);

  const handleSelectAnswer = (index: number) => {
    if (answerLocked || selected !== null) return;

    const times = windowTimesRef.current;
    const qu_id = questionIdRef.current;

    if (!times) {
      toast.error("No active question window.");
      return;
    }

    if (Date.now() > times.end) {
      toast.error("Time's up!");
      return;
    }

    setSelected(index);
    setAnswerLocked(true);
    playAnswerSound();

    const selectedAnswer = question.answers?.[index];
    if (selectedAnswer) {
      emit("ANSWER", {
        question_id: qu_id,
        answer: selectedAnswer.content,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-foreground flex items-center justify-between px-8 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground tabular">
            pin: {gamePin}
          </span>
          {totalQuestions > 0 && (
            <span className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground tabular">
              Question {currentQuestion} of {totalQuestions}
            </span>
          )}
        </div>
        <h1 className="text-xl font-display font-black tracking-tighter">qwizza.</h1>
      </div>

      {/* Question */}
      <div className="border-b-2 border-foreground px-8 py-12 md:py-16">
        <AnimatePresence mode="wait">
          <motion.h2
            key={question.qu_id}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
            className="text-3xl md:text-4xl font-display font-black tracking-tighter text-balance max-w-3xl"
          >
            {question.content}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Timer bar */}
      <div className="h-3 bg-muted border-b-2 border-foreground">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${timeRemaining}%` }}
        />
      </div>

      {/* Answers */}
      <div className="flex-1 grid grid-cols-2 gap-0">
        {question.answers?.map((answer, i) => (
          <div
            key={answer.a_id}
            className="border-r-2 border-b-2 border-foreground last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(4)]:border-r-0"
          >
            <AnswerBlock
              label={answer.content}
              color={colors[i]}
              selected={selected === i}
              disabled={answerLocked && selected !== i}
              onClick={() => handleSelectAnswer(i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerGame;