import React, { useRef, useState, useEffect } from "react";
import "./styles.scss";
import Button from "../Button";

interface ContrastCanvasProps {
  onContinue: () => void;
}

interface Square {
  x: number;
  y: number;
  size: number;
  progress: number;
  color: string;
}

const NUM_SQUARES = 5;
const BASE_SIZE = 60;
const MAX_SCALE_FACTOR = 2.5;
const MAX_SIZE = BASE_SIZE * MAX_SCALE_FACTOR;
const GAP_SIZE = 40;
const DRAG_SENSITIVITY = 300;
const SNAP_PERCENTAGE_STEP = 5;

const BASE_COLOR_HEX = "#d1d5db";
const HIGHLIGHT_COLOR_HEX = "#10b981";

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null;
}

function lerp(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

function lerpColor(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number
) {
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bl = Math.round(lerp(a.b, b.b, t));
  return `rgb(${r}, ${g}, ${bl})`;
}

const ContrastCanvas: React.FC<ContrastCanvasProps> = ({ onContinue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [squares, setSquares] = useState<Square[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialProgress, setInitialProgress] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [allowSkip, setAllowSkip] = useState(false);

  const BASE_COLOR_RGB = hexToRgb(BASE_COLOR_HEX)!;
  const HIGHLIGHT_COLOR_RGB = hexToRgb(HIGHLIGHT_COLOR_HEX)!;

  const initSquares = () => {
    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth;
    const squaresArr: Square[] = [];
    const totalContentWidth =
      NUM_SQUARES * BASE_SIZE + (NUM_SQUARES - 1) * GAP_SIZE;
    let currentX = (containerWidth - totalContentWidth) / 2;
    const bottomY = 200 + MAX_SIZE / 2; // Canvas height = 400

    for (let i = 0; i < NUM_SQUARES; i++) {
      squaresArr.push({
        x: currentX,
        y: bottomY - BASE_SIZE,
        size: BASE_SIZE,
        progress: 0,
        color: BASE_COLOR_HEX,
      });
      currentX += BASE_SIZE + GAP_SIZE;
    }
    setSquares(squaresArr);
    setActiveIndex(null);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const BOTTOM_ALIGN_Y = height / 2 + MAX_SIZE / 2;
    let totalWidth =
      squares.reduce((sum, s) => sum + s.size, 0) +
      (NUM_SQUARES - 1) * GAP_SIZE;
    let x = (width - totalWidth) / 2;

    squares.forEach((s, i) => {
      const size =
        i === activeIndex && s.progress <= 0.5
          ? lerp(BASE_SIZE, MAX_SIZE, s.progress * 2)
          : i === activeIndex
          ? MAX_SIZE
          : s.size;

      const color =
        i === activeIndex && s.progress > 0.5
          ? lerpColor(
              BASE_COLOR_RGB,
              HIGHLIGHT_COLOR_RGB,
              (s.progress - 0.5) * 2
            )
          : s.color;

      const y = BOTTOM_ALIGN_Y - size;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);

      if (!isDragging && hoveredIndex === i) {
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          x - (MAX_SIZE - size) / 2,
          BOTTOM_ALIGN_Y - MAX_SIZE,
          MAX_SIZE,
          MAX_SIZE
        );
        ctx.setLineDash([]);
      }

      x += size + GAP_SIZE;
    });

    if (isDragging) {
      ctx.font = "24px Inter";
      ctx.fillStyle = "#a1a1aa";
      ctx.textAlign = "center";
      ctx.fillText("<------->", width / 2, height - 30);
    }
  };

  const updatePercentage = () => {
    if (activeIndex === null) return;
    const prog = Math.round((squares[activeIndex].progress || 0) * 100);
    setPercentage(prog);
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const idx = squares.findIndex(
      (s) => x >= s.x && x <= s.x + s.size && y >= s.y && y <= s.y + s.size
    );
    if (idx !== -1) {
      setActiveIndex(idx);
      setIsDragging(true);
      setDragStartX(clientX);
      setInitialProgress(squares[idx].progress);
    }
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    const clientX =
      "touches" in e ? e.touches[0].clientX : "clientX" in e ? e.clientX : null;
    if (clientX === null) return;

    if (isDragging && activeIndex !== null) {
      let delta = (clientX - dragStartX) / DRAG_SENSITIVITY;
      let newProg = initialProgress + delta;
      const snapInverse = 100 / SNAP_PERCENTAGE_STEP;
      newProg = Math.round(newProg * snapInverse) / snapInverse;
      newProg = Math.max(0, Math.min(1, newProg));

      setSquares((prev) => {
        const updated = [...prev];
        const s = updated[activeIndex];
        s.progress = newProg;
        s.size =
          newProg <= 0.5 ? lerp(BASE_SIZE, MAX_SIZE, newProg * 2) : MAX_SIZE;
        return updated;
      });

      updatePercentage();
    } else {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clientX - rect.left;
      const y =
        "touches" in e
          ? e.touches[0].clientY - rect.top
          : "clientY" in e
          ? e.clientY - rect.top
          : 0;
      const idx = squares.findIndex(
        (s) => x >= s.x && x <= s.x + s.size && y >= s.y && y <= s.y + s.size
      );
      setHoveredIndex(idx !== -1 ? idx : null);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setActiveIndex(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, activeIndex, dragStartX, initialProgress]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      const width = containerRef.current?.offsetWidth || window.innerWidth;
      canvasRef.current.width = width;
      canvasRef.current.height = 400;
      initSquares();
      drawCanvas();
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [squares, hoveredIndex, isDragging]);

  useEffect(() => {
    setAllowSkip(false);
    const timer = setTimeout(() => setAllowSkip(true), 60000);
    return () => clearTimeout(timer);
  }, []);

  const startColor = [249, 93, 93];
  const endColor = [83, 234, 205];
  const factor = percentage / 100;
  const interpolatedColor = `rgb(${startColor
    .map((c, i) => Math.round(c + (endColor[i] - c) * factor))
    .join(",")})`;

  return (
    <div className="fade-wrapper fade-in">
      <div className="canvas-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          style={{ backgroundColor: "transparent", display: "block" }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
      </div>

      <div className="completion">
        <div className="completion-content">
          <span className="percentage" style={{ color: interpolatedColor }}>
            {percentage}%
          </span>
          {percentage === 100 ? (
            <div className="completed-info">
              <h3 className="completed-title">
                <strong>QUY TẮC TƯƠNG PHẢN</strong>
              </h3>
              <p className="completed-description">
                Bạn đã hoàn thành nhiệm vụ điều chỉnh các thanh chữ nhật để đạt
                độ tương phản tối ưu.
              </p>
            </div>
          ) : (
            <span className="instruction">
              Kéo các thanh chữ nhật để nét đứt thẳng hàng
            </span>
          )}
        </div>

        <div className="completion-button">
          {(percentage === 100 || allowSkip) && (
            <Button
              className={`animated-button ${
                percentage === 100 ? "completed" : ""
              }`}
              iconSrc="/img/right.png"
              text={percentage === 100 ? "Tiếp tục" : "Bỏ qua"}
              bgColor={
                percentage === 100 ? "rgb(83,234,205)" : "rgb(249,93,93)"
              }
              onClick={onContinue}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContrastCanvas;
