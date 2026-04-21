import { useCallback, useState } from "react";

export function useOverlayState() {
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showRulesOverlay, setShowRulesOverlay] = useState(false);

  const dismissOverlayChrome = useCallback(() => {
    setShowRestartConfirm(false);
    setShowExitConfirm(false);
    setShowRulesOverlay(false);
  }, []);

  return {
    showRestartConfirm,
    setShowRestartConfirm,
    showExitConfirm,
    setShowExitConfirm,
    showRulesOverlay,
    setShowRulesOverlay,
    dismissOverlayChrome,
  };
}
