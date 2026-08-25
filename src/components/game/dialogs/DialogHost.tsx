import type { BossKind } from "@/components/game/engine";
import { AboutDialog } from "./AboutDialog";
import { CertificationsDialog } from "./CertificationsDialog";
import { ChallengeDialog } from "./ChallengeDialog";
import { ContactDialog } from "./ContactDialog";
import { EducationDialog } from "./EducationDialog";
import { EndDialog } from "./EndDialog";
import { JobDialog } from "./JobDialog";
import { JobsDialog } from "./JobsDialog";
import { ProjectDialog } from "./ProjectDialog";
import { ProjectsDialog } from "./ProjectsDialog";
import { SkillsDialog } from "./SkillsDialog";
import { ToolsDialog } from "./ToolsDialog";
import type { Dialog } from "./types";

export type { Dialog } from "./types";

export function DialogHost({
  dialog,
  collected,
  challengeProgress,
  challengeError,
  onNavigate,
  onStartChallenge,
  onAnswerChallenge,
  onClose,
}: {
  dialog: Dialog;
  collected: string[];
  challengeProgress: number;
  challengeError: string;
  onNavigate: (next: Dialog) => void;
  onStartChallenge: (boss: BossKind) => void;
  onAnswerChallenge: (boss: BossKind, correct: boolean) => void;
  onClose: () => void;
}) {
  switch (dialog?.type) {
    case "about":
      return <AboutDialog onClose={onClose} />;
    case "skills":
      return <SkillsDialog collected={collected} onClose={onClose} />;
    case "job":
      return <JobDialog index={dialog.index} onClose={onClose} />;
    case "jobs":
      return (
        <JobsDialog onPickJob={(index) => onNavigate({ type: "job", index })} onClose={onClose} />
      );
    case "project":
      return <ProjectDialog index={dialog.index} onClose={onClose} />;
    case "projects":
      return (
        <ProjectsDialog
          onPickProject={(index) => onNavigate({ type: "project", index })}
          onClose={onClose}
        />
      );
    case "education":
      return <EducationDialog onClose={onClose} />;
    case "certifications":
      return <CertificationsDialog onClose={onClose} />;
    case "tools":
      return <ToolsDialog onClose={onClose} />;
    case "challenge":
      return (
        <ChallengeDialog
          boss={dialog.boss}
          step={dialog.step}
          progress={challengeProgress}
          error={challengeError}
          onStart={() => onStartChallenge(dialog.boss)}
          onAnswer={(correct) => onAnswerChallenge(dialog.boss, correct)}
          onClose={onClose}
        />
      );
    case "contact":
      return <ContactDialog onClose={onClose} />;
    case "end":
      return <EndDialog collected={collected} onClose={onClose} />;
    default:
      return null;
  }
}
