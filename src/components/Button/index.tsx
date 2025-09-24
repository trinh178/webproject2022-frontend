import React from "react";
import "./styles.scss";

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  className: string;
  iconSrc: string;
  text: string;
  bgColor?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  className,
  iconSrc,
  text,
  bgColor,
  onClick,
  ...restProps
}) => {
  return (
    <div
      className="button-container"
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
      {...restProps}
    >
      <img src={iconSrc} alt="Icon" className="icon" />
      <span className="text">{text}</span>
    </div>
  );
};

export default Button;
