import { IntroScreen } from "./components/IntroScreen";
import { GameRulesScreen } from "./components/GameRulesScreen";
import { ModeSelectScreen } from "./components/ModeSelectScreen";
import { OutroScreen } from "./components/OutroScreen";
import { GamePauseToggle } from "./components/GamePauseToggle";
import { DockChromaKeyLayer } from "./components/DockChromaKeyLayer";
import { QuizBackground } from "./components/QuizBackground";
import { QuizScreen } from "./components/QuizScreen";
import { ExitConfirmDialog } from "./components/ExitConfirmDialog";
import { RestartConfirmDialog } from "./components/RestartConfirmDialog";
import { RulesOverlay } from "./components/RulesOverlay";
import { RulesScreen } from "./components/RulesScreen";
import { StartScreen } from "./components/StartScreen";
import { TransitionOverlay } from "./components/TransitionOverlay";
import type { ReactNode } from "react";
import { MasterVolumeControl } from "./components/MasterVolumeControl";
import { getGuessSeconds } from "./helpers/quizConfig";
import { useQuizGame } from "./hooks/useQuizGame";

export default function App() {
  const game = useQuizGame();

  let content: ReactNode;

  if (game.previewLoading) {
    content = (
      <main className="app-shell app-shell-start">
        <p className="app-preview-loading">Загрузка предпросмотра…</p>
      </main>
    );
  } else if (game.roundState === "intro") {
    if (game.isStartCinematic) {
      content = <IntroScreen onVideoEnded={game.onIntroVideoEnded} onSkip={game.skipIntroAndGoToRules} />;
    } else {
      content = (
        <main className="app-shell app-shell-start">
          <StartScreen onStart={game.startQuiz} />
        </main>
      );
    }
  } else if (game.roundState === "game_rules") {
    content = <GameRulesScreen onComplete={game.skipGameRulesToModeSelect} />;
  } else if (game.roundState === "mode_select") {
    content = (
      <ModeSelectScreen onSelectMode={game.selectGameMode} quizEligibleCount={game.quiz.eligibleCount} />
    );
  } else if (game.roundState === "rules") {
    if (!game.gameMode) {
      content = null;
    } else {
      content = <RulesScreen onComplete={game.skipRulesAndStart} gameMode={game.gameMode} />;
    }
  } else if (game.roundState === "finished") {
    const subtitle = game.gameMode === "quiz" ? `Правильных ответов: ${game.quiz.score}` : undefined;
    content = (
      <OutroScreen
        videoSrc={game.outroVideoSrc}
        subtitle={subtitle}
        onBackToModeSelect={game.returnToModeSelect}
        onExitToStart={game.exitToStartScreen}
      />
    );
  } else if (!game.round) {
    content = null;
  } else {
    content = (
      <main className="app-shell app-shell-quiz">
        {game.previewMode && (
          <div className="preview-mode-banner" role="status">
            Предпросмотр одного раунда — выход в меню ведёт в редактор.
            {game.roundState === "transition" ? (
              <span className="preview-mode-banner-hint">
                {" "}
                Коснитесь экрана или нажмите клавишу, чтобы начать (нужно для звука в Safari).
              </span>
            ) : null}
          </div>
        )}
        <QuizBackground
          photoUrl={game.roundPhotoBackground}
          youtubeSrc={game.roundYoutubeBackgroundEmbed}
          videoSrc={game.roundVideoBackgroundUrl}
          videoStartSec={game.roundVideoBackgroundStart}
        />
        <DockChromaKeyLayer />
        <GamePauseToggle
          paused={game.gamePaused}
          disabled={game.roundState === "transition" || game.roundState === "quiz_feedback"}
          onToggle={game.toggleGamePause}
          touchMode={game.gesturePauseLayout}
          gameMode={game.gameMode}
          quizUiVariant={game.quiz.uiVariant}
          onReturnToModeSelectRequest={() => game.overlay.setShowRestartConfirm(true)}
          onExitToStart={() => game.overlay.setShowExitConfirm(true)}
          onRulesRequest={() => game.overlay.setShowRulesOverlay(true)}
        />
        <div className="app-overlay" key={game.roundIndex}>
          <QuizScreen
            round={game.round}
            roundIndex={game.roundIndex}
            totalRounds={game.orderedRounds.length}
            roundState={game.roundState}
            gameMode={game.gameMode}
            quizScore={game.quiz.score}
            quizOptions={game.quiz.options}
            quizUiVariant={game.quiz.uiVariant}
            quizOrderUserIds={game.quiz.orderUserIds}
            onReorderQuizOrder={game.quiz.reorderLines}
            quizCorrectIndex={game.quiz.correctIndex}
            selectedQuizIndex={game.quiz.selectedIndex}
            onSelectQuizOption={game.quiz.setSelection}
            hintLines={game.hintLines}
            revealLines={game.revealLines}
            visibleHintLineCount={game.visibleHintLineCount}
            timerSeconds={game.timerSeconds}
            totalSeconds={getGuessSeconds(game.revealLines.length)}
            gamePaused={game.gamePaused}
            onReplaySnippet={game.replaySnippet}
            onReveal={game.handleRevealClick}
            onConfirmQuiz={game.quiz.confirm}
            onNextRound={game.nextRound}
          />
        </div>
        <RestartConfirmDialog
          open={game.overlay.showRestartConfirm}
          onCancel={() => game.overlay.setShowRestartConfirm(false)}
          onConfirm={() => {
            game.overlay.setShowRestartConfirm(false);
            game.returnToModeSelect();
          }}
        />
        <ExitConfirmDialog
          open={game.overlay.showExitConfirm}
          onCancel={() => game.overlay.setShowExitConfirm(false)}
          onConfirm={() => {
            game.overlay.setShowExitConfirm(false);
            game.exitToStartScreen();
          }}
        />
        <RulesOverlay
          open={game.overlay.showRulesOverlay}
          onClose={() => game.overlay.setShowRulesOverlay(false)}
        />
        <TransitionOverlay
          visible={game.roundState === "transition"}
          nextRoundTitle={game.upcomingRoundTitle}
        />
      </main>
    );
  }

  return (
    <>
      <MasterVolumeControl />
      {content}
    </>
  );
}
