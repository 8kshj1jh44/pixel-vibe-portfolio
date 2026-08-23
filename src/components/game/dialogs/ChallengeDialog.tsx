import type { BossKind } from "@/components/game/engine";
import { BOSS_IDS, BOSS_TITLES } from "@/components/game/level";
import { PixelDialog } from "../PixelDialog";

export function ChallengeDialog({
  boss,
  step,
  progress,
  error,
  onStart,
  onAnswer,
  onClose,
}: {
  boss: BossKind;
  step: "intro" | "active" | "success";
  progress: number;
  error: string;
  onStart: () => void;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}) {
  const trivia = getDailyTrivia(boss);
  const current = trivia[progress];
  const life = Math.max(0, 4 - progress);
  return (
    <PixelDialog
      title={`${BOSS_TITLES[boss]} — DAILY TRIVIA`}
      onClose={onClose}
      footer={
        step === "intro" ? (
          <button
            type="button"
            className="pixel-btn bg-primary text-primary-foreground"
            onClick={onStart}
          >
            START CHALLENGE
          </button>
        ) : undefined
      }
    >
      <div className="mb-4" aria-label={`Boss life ${life} of 4`}>
        <div className="flex items-center justify-between font-display text-[0.48rem]">
          <span className="text-accent">BOSS LIFE</span>
          <span className="text-cyan-crt">{life}/4</span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1 border-4 border-border bg-screen p-1">
          {[0, 1, 2, 3].map((heart) => (
            <span key={heart} className={`h-3 ${heart < life ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
      {step === "intro" && (
        <p>
          Answer today&apos;s four technology and ocean trivia questions. Each correct answer
          removes one life point; the question set changes each day.
        </p>
      )}
      {step === "active" && (
        <div>
          <p className="font-display text-[0.55rem] text-cyan-crt">STEP {progress + 1} / 4</p>
          {current && (
            <>
              <p className="my-4 border-4 border-accent bg-screen p-4 text-xl text-foreground">
                {current.question}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {current.options.map((option, index) => (
                  <button
                    type="button"
                    key={option}
                    className="pixel-btn min-h-14 bg-secondary text-foreground"
                    onClick={() => onAnswer(index === current.answer)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
          {error && <p className="mt-3 text-destructive">! {error}</p>}
        </div>
      )}
      {step === "success" && (
        <div>
          <h3 className="font-display text-sm text-lime-crt">CHALLENGE CLEAR</h3>
          <p className="mt-3">The route ahead is open. Continue deeper into the portfolio.</p>
        </div>
      )}
    </PixelDialog>
  );
}

type TriviaQuestion = { question: string; options: string[]; answer: number };

const TRIVIA_SETS: TriviaQuestion[][] = [
  [
    {
      question: "Which protocol translates domain names into IP addresses?",
      options: ["DNS", "SSH", "FTP"],
      answer: 0,
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Pacific", "Indian"],
      answer: 1,
    },
    { question: "Which command lists files on Linux?", options: ["ls", "pwd", "ping"], answer: 0 },
    { question: "An octopus has how many arms?", options: ["Six", "Eight", "Ten"], answer: 1 },
  ],
  [
    {
      question: "What does CPU stand for?",
      options: ["Central Processing Unit", "Core Power Utility", "Computer Primary User"],
      answer: 0,
    },
    {
      question: "Which sea animal is the largest fish?",
      options: ["Blue whale", "Whale shark", "Giant squid"],
      answer: 1,
    },
    { question: "Which port is commonly used by HTTPS?", options: ["21", "80", "443"], answer: 2 },
    {
      question: "Coral reefs are built mainly by what?",
      options: ["Animals", "Plants", "Rocks"],
      answer: 0,
    },
  ],
  [
    {
      question: "Which language is commonly used with React?",
      options: ["JavaScript", "SQL", "Bash"],
      answer: 0,
    },
    {
      question: "What helps fish breathe underwater?",
      options: ["Lungs", "Gills", "Fins"],
      answer: 1,
    },
    {
      question: "What does LAN mean?",
      options: ["Local Area Network", "Linked Access Node", "Long Analog Network"],
      answer: 0,
    },
    {
      question: "Which zone receives no sunlight?",
      options: ["Sunlight", "Twilight", "Midnight"],
      answer: 2,
    },
  ],
];

function getDailyTrivia(boss: BossKind): TriviaQuestion[] {
  const day = Math.floor(Date.now() / 86_400_000);
  const index = (day + BOSS_IDS.indexOf(boss)) % TRIVIA_SETS.length;
  return TRIVIA_SETS[index] ?? TRIVIA_SETS[0] ?? [];
}
