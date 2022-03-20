import { isNumber, isObject } from "lodash";
import { PropsWithChildren } from "react";
interface AspectRadioWrapperProps {
  aspectRadio: number | {
    width: number;
    height: number;
  };
}
export default function AspectRadioWrapper({
  aspectRadio,
  children,
}: PropsWithChildren<AspectRadioWrapperProps>) {
  let f = aspectRadio;
  if (typeof aspectRadio === 'object') {
    f = aspectRadio.width / aspectRadio.height;
  }
  return (
    <div
      id="aspect-ratio-container-wrapper"
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: `${100 / (f as number)}%`,
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
