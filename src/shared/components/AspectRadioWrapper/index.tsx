import { PropsWithChildren } from "react";
interface AspectRadioWrapperProps {
  ratio: {
    width: number;
    height: number;
  };
}
export default function AspectRadioWrapper({
  ratio,
  children,
}: PropsWithChildren<AspectRadioWrapperProps>) {
  return (
    <div
      id="aspect-ratio-container-wrapper"
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: `${100 / (ratio.width / ratio.height)}%`,
      }}
    >
      <div
        id="aspect-ratio-container"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
