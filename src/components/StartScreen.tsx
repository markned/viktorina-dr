import { assetUrl } from "../helpers/quizConfig";

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="start-screen-layout">
      <div className="start-screen start-screen-icon" onClick={onStart}>
        <img
          src={assetUrl("/content/icons/start-icon.png")}
          alt="Начать"
          className="start-icon"
        />
      </div>
      <div className="start-screen-author" aria-label="Социальные сети">
        <a
          href="https://t.me/hm_que_mark"
          target="_blank"
          rel="noopener noreferrer"
          className="start-screen-author-icon-link"
          aria-label="Telegram автора"
        >
          <img src={assetUrl("/content/icons/telegram.png")} alt="" width={32} height={32} decoding="async" />
        </a>
        <a
          href="https://www.instagram.com/hm.que.mark/"
          target="_blank"
          rel="noopener noreferrer"
          className="start-screen-author-icon-link"
          aria-label="Instagram автора"
        >
          <img src={assetUrl("/content/icons/instagram.png")} alt="" width={32} height={32} decoding="async" />
        </a>
      </div>
      <p className="start-screen-disclaimer" role="note">
        Автор категорически осуждает употребление наркотических и иных опасных веществ. Материал не содержит призыва к
        употреблению и не является его пропагандой.
      </p>
    </div>
  );
}
