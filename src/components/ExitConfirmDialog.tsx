type ExitConfirmDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ExitConfirmDialog({ open, onCancel, onConfirm }: ExitConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-backdrop" role="dialog" aria-modal="true">
      <div className="confirm-dialog">
        <h4>Выйти на главный экран?</h4>
        <p>Текущий прогресс по раундам будет сброшен.</p>
        <div className="confirm-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Отмена
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
