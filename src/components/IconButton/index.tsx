import React from "react";
import "./styles.scss";

interface IconButtonProps {
  icons: string[];
}

const IconButton: React.FC<IconButtonProps> = ({ icons }) => {
  return (
    <div className="icon-button-group">
      {icons.map((icon, index) => (
        <button key={index} className="icon-button">
          <img src={icon} alt={`icon-${index}`} className="icon-image" />
        </button>
      ))}
    </div>
  );
};

export default IconButton;
