import { assetUrl } from "../helpers/quizConfig";

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="start-screen-layout">
      <div className="start-screen-author" aria-label="Автор">
        <span className="start-screen-author-label">Автор:</span>
        <a
          href="https://t.me/hm_que_mark"
          target="_blank"
          rel="noopener noreferrer"
          className="start-screen-author-link"
          aria-label="Telegram автора"
        >
          <span className="start-screen-author-icon" aria-hidden>
            ✈
          </span>
          <span className="start-screen-author-handle">Telegram</span>
        </a>
        <a
          href="https://www.instagram.com/hm.que.mark/"
          target="_blank"
          rel="noopener noreferrer"
          className="start-screen-author-link"
          aria-label="Instagram автора"
        >
          <span className="start-screen-author-icon start-screen-author-icon--ig" aria-hidden>
            ◎
          </span>
          <span className="start-screen-author-handle">Instagram</span>
        </a>
      </div>
      <div className="start-screen start-screen-icon" onClick={onStart}>
        <img
          src={assetUrl("/content/icons/start-icon.png")}
          alt="Начать"
          className="start-icon"
        />
      </div>
      <p className="start-screen-disclaimer" role="note">
        Автор категорически осуждает употребление наркотических и иных опасных веществ. Материал не содержит призыва к
        употреблению и не является его пропагандой.
      </p>
    </div>
  );
}
