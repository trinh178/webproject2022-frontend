import React, { useState } from "react";
import "./styles.scss";

interface CardProps {
  index: number;
  imageUrl: string;
  isSelected: boolean;
  selectedCardIndex: number | null;
  onSelect: (index: number) => void;
  isCorrect: boolean;
  isCompareMode: boolean;
}

const Card: React.FC<CardProps> = ({
  index,
  imageUrl,
  isSelected,
  selectedCardIndex,
  onSelect,
  isCorrect,
  isCompareMode,
}) => {
  const isLeft = index === 0;
  const isActive = selectedCardIndex !== null;
  const zIndex = isCompareMode ? (isSelected ? 1 : 2) : isSelected ? 2 : 1;
  const [showStatusIcon, setShowStatusIcon] = useState(false);

  const handleTransitionEnd = () => {
    if (isActive) {
      setShowStatusIcon(true);
    }
  };

  return (
    <div
      className={`edu-card 
        ${isLeft ? "edu-card-left" : "edu-card-right"}
        ${isSelected ? "edu-card-selected" : ""}
        ${isActive ? "edu-card-merge" : ""}
      `}
      style={{ zIndex }}
      onClick={() => onSelect(index)}
      onTransitionEnd={handleTransitionEnd}
    >
      <img src={imageUrl} alt="card" />

      {showStatusIcon && (
        <div
          className="edu-card-status-icon"
          style={{
            backgroundColor: isCorrect ? "rgb(83,234,205)" : "rgb(249,93,93)",
          }}
        >
          <img
            src={isCorrect ? "/img/correct.png" : "/img/incorrect.png"}
            alt={isCorrect ? "correct" : "incorrect"}
          />
        </div>
      )}
    </div>
  );
};

export default Card;
