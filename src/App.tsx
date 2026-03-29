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
import { getGuessSeconds } from "./helpers/quizConfig";
import { useQuizGame } from "./hooks/useQuizGame";

export default function App() {
  const game = useQuizGame();

  if (game.previewLoading) {
    return (
      <main className="app-shell app-shell-start">
        <p className="app-preview-loading">Загрузка предпросмотра…</p>
      </main>
    );
  }

  if (game.roundState === "intro") {
    if (game.isStartCinematic) {
      return <IntroScreen onVideoEnded={game.onIntroVideoEnded} onSkip={game.skipIntroAndGoToRules} />;
    }
    return (
      <main className="app-shell app-shell-start">
        <StartScreen onStart={game.startQuiz} />
      </main>
    );
  }

  if (game.roundState === "game_rules") {
    return <GameRulesScreen onComplete={game.skipGameRulesToModeSelect} />;
  }

  if (game.roundState === "mode_select") {
    return (
      <ModeSelectScreen onSelectMode={game.selectGameMode} quizEligibleCount={game.quizEligibleCount} />
    );
  }

  if (game.roundState === "rules") {
    if (!game.gameMode) {
      return null;
    }
    return <RulesScreen onComplete={game.skipRulesAndStart} gameMode={game.gameMode} />;
  }

  if (game.roundState === "finished") {
    const subtitle =
      game.gameMode === "quiz" ? `Правильных ответов: ${game.quizScore}` : undefined;
    return (
      <OutroScreen
        videoSrc={game.outroVideoSrc}
        subtitle={subtitle}
        onBackToModeSelect={game.returnToModeSelect}
        onExitToStart={game.exitToStartScreen}
      />
    );
  }

  if (!game.round) {
    return null;
  }

  return (
    <main className="app-shell app-shell-quiz">
      {game.previewMode && (
        <div className="preview-mode-banner" role="status">
          Предпросмотр одного раунда — выход в меню ведёт в редактор.
          {game.roundState === "transition" ? (
            <span className="preview-mode-banner-hint"> Коснитесь экрана или нажмите клавишу, чтобы начать (нужно для звука в Safari).</span>
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
        quizUiVariant={game.quizUiVariant}
        onReturnToModeSelectRequest={() => game.setShowRestartConfirm(true)}
        onExitToStart={() => game.setShowExitConfirm(true)}
        onRulesRequest={() => game.setShowRulesOverlay(true)}
      />
      <div className="app-overlay" key={game.roundIndex}>
        <QuizScreen
          round={game.round}
          roundIndex={game.roundIndex}
          totalRounds={game.orderedRounds.length}
          roundState={game.roundState}
          gameMode={game.gameMode}
          quizScore={game.quizScore}
          quizOptions={game.quizOptions}
          quizUiVariant={game.quizUiVariant}
          quizOrderUserIds={game.quizOrderUserIds}
          onReorderQuizOrder={game.reorderQuizOrderLines}
          quizCorrectIndex={game.quizCorrectIndex}
          selectedQuizIndex={game.selectedQuizIndex}
          onSelectQuizOption={game.setQuizSelection}
          hintLines={game.hintLines}
          revealLines={game.revealLines}
          visibleHintLineCount={game.visibleHintLineCount}
          timerSeconds={game.timerSeconds}
          totalSeconds={getGuessSeconds(game.revealLines.length)}
          gamePaused={game.gamePaused}
          onReplaySnippet={game.replaySnippet}
          onReveal={game.handleRevealClick}
          onConfirmQuiz={game.confirmQuizRound}
          onNextRound={game.nextRound}
        />
      </div>
      <RestartConfirmDialog
        open={game.showRestartConfirm}
        onCancel={() => game.setShowRestartConfirm(false)}
        onConfirm={() => {
          game.setShowRestartConfirm(false);
          game.returnToModeSelect();
        }}
      />
      <ExitConfirmDialog
        open={game.showExitConfirm}
        onCancel={() => game.setShowExitConfirm(false)}
        onConfirm={() => {
          game.setShowExitConfirm(false);
          game.exitToStartScreen();
        }}
      />
      <RulesOverlay open={game.showRulesOverlay} onClose={() => game.setShowRulesOverlay(false)} />
      <TransitionOverlay visible={game.roundState === "transition"} nextRoundTitle={game.upcomingRoundTitle} />
    </main>
  );
}
