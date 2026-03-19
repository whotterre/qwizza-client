import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnswerBlock from "@/components/AnswerBlock";
import { useSocket } from "@/hooks/useSocket";
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
  const [selected, setSelected] = useState<number | null>(null);
  const [question, setQuestion] = useState<QuestionPayload["question"]>({
    qu_id: 0,
    content: "waiting for the next question...",
    answers: [
      { a_id: 0, qu_id: 0, content: "option a" },
      { a_id: 1, qu_id: 0, content: "option b" },
      { a_id: 2, qu_id: 0, content: "option c" },
      { a_id: 3, qu_id: 0, content: "option d" },
    ],
  });
  const [timeRemaining, setTimeRemaining] = useState(100);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const windowTimesRef = useRef<{ start: number; end: number } | null>(null);
  const questionIdRef = useRef<number>(0);
  const nickname = localStorage.getItem("qwizza_player_nickname");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[PlayerGame] Data check - gamePin:", gamePin, "nickname:", nickname);
  }, [gamePin, nickname]);

  const { emit, on } = useSocket({
    onConnect: () => {
      console.log("[PlayerGame] Socket connected, emitting PLAYER_JOIN with gamePin:", gamePin, "nickname:", nickname);
      emit("PLAYER_JOIN", { gamePin, nickname });
    },
  });

  useEffect(() => {
    const onsubscribeQuestion = on("QUESTION", (payload: any) => {
      console.log("[PlayerGame] QUESTION event received:", payload);
      setQuestion(payload.question);
      questionIdRef.current = payload.question.qu_id;
      windowTimesRef.current = { start: payload.windowStart, end: payload.windowEnd };
      
      // Update progress info
      if (payload.questionNumber !== undefined) {
        setCurrentQuestion(payload.questionNumber);
      }
      if (payload.totalQuestions !== undefined) {
        setTotalQuestions(payload.totalQuestions);
      }
      
      setSelected(null);
      
      // Clear old timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start timer that updates remaining time
      const updateTimer = () => {
        if (windowTimesRef.current) {
          const now = Date.now();
          const remaining = Math.max(0, windowTimesRef.current.end - now);
          const percentage = (remaining / (windowTimesRef.current.end - windowTimesRef.current.start)) * 100;
          setTimeRemaining(percentage);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 50);
    });

    const onsubscribePlayerJoined = on("PLAYER_JOINED", (payload: { nickname: string }) => {
      if (payload.nickname !== nickname) {
        toast.success(`${payload.nickname} joined the game!`);
      }
    });

    const onsubscribeAnswerResult = on("ANSWER_RESULT", (payload: any) => {
      console.log("[PlayerGame] ANSWER_RESULT received:", payload);
      if (payload.isCorrect) {
        toast.success(`Correct! +${payload.score.toFixed(2)} points`);
      } else {
        toast.error(`Wrong! Correct answer: ${payload.correctAnswer}`);
      }
    });

    const onsubscribeQuizEnded = on("QUIZ_ENDED", (payload: any) => {
      console.log("[PlayerGame] QUIZ_ENDED received:", payload);
      toast.success("Quiz finished! Moving to results...");
      // Navigate to results page
      setTimeout(() => {
        navigate(`/player/${gamePin}/results`);
      }, 500);
    });

    return () => {
      onsubscribeQuestion();
      onsubscribePlayerJoined();
      onsubscribeAnswerResult();
      onsubscribeQuizEnded();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [on, nickname, gamePin, navigate]);

  const handleSelectAnswer = (index: number) => {
    const times = windowTimesRef.current;
    const qu_id = questionIdRef.current;
    
    console.log("[PlayerGame] Answer selected - index:", index, "times:", times, "qu_id:", qu_id);
    
    if (!times) {
      console.warn("[PlayerGame] No window times available");
      return;
    }
    
    setSelected(index);
    const selectedAnswer = question.answers?.[index];
    
    if (selectedAnswer) {
      console.log("[PlayerGame] Emitting ANSWER event:", { qu_id, answer: selectedAnswer.content });
      emit("ANSWER", {
        question_id: qu_id,
        answer: selectedAnswer.content,
        windowStart: times.start,
        windowEnd: times.end,
        gameId: parseInt(gamePin || "0"),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-foreground flex items-center justify-between px-8 py-4">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground tabular">
            pin: {gamePin}
          </span>
          {totalQuestions > 0 && (
            <span className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground tabular mt-1">
              Question {currentQuestion} of {totalQuestions}
            </span>
          )}
        </div>
        <h1 className="text-xl font-display font-black tracking-tighter">qwizza.</h1>
      </div>

      {/* Question */}
      <div className="border-b-2 border-foreground px-8 py-12 md:py-16">
        <motion.h2
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
          className="text-3xl md:text-4xl font-display font-black tracking-tighter text-balance max-w-3xl"
        >
          {question.content}
        </motion.h2>
      </div>

      {/* Timer bar */}
      <div className="h-3 bg-muted border-b-2 border-foreground">
        <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${timeRemaining}%` }} />
      </div>

      {/* Answers */}
      <div className="flex-1 grid grid-cols-2 gap-0">
        {question.answers?.map((answer, i) => (
          <div key={i} className="border-r-2 border-b-2 border-foreground last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(4)]:border-r-0">
            <AnswerBlock
              label={answer.content}
              color={colors[i]}
              selected={selected === i}
              onClick={() => handleSelectAnswer(i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerGame;
