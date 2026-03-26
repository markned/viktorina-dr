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
      <p className="start-screen-disclaimer" role="note">
        Автор категорически осуждает употребление наркотических и иных опасных веществ. Материал не содержит призыва к
        употреблению и не является его пропагандой.
      </p>
    </div>
  );
}
