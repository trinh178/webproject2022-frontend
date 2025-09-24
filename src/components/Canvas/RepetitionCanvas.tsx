import React, { useRef, useState, useEffect } from "react";
import Button from "../Button";
import "./styles.scss";

interface Pattern {
  type: "circle" | "square" | "triangle";
  color: string;
}

interface Row {
  y: number;
  isDraggable: boolean;
  offsetX?: number;
  patterns?: Pattern[];
  targetPatternIndex?: number;
  pattern?: Pattern;
}

interface RepetitionCanvasProps {
  onContinue: () => void;
}

const RepetitionCanvas: React.FC<RepetitionCanvasProps> = ({ onContinue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [allowSkip, setAllowSkip] = useState(false);

  const NUM_SHAPES_IN_VIEW = 3;
  const SHAPE_SIZE = 50;
  const SHAPE_GAP = 30;
  const ROW_HEIGHT = 80;
  const VIEWPORT_PADDING = 20;
  const SNAP_GRID_SIZE = 15;

  const GRAY_COLOR = "#d1d5db";
  const GREEN_COLOR = "#10b981";

  const [rows, setRows] = useState<Row[]>([]);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialOffsetX, setInitialOffsetX] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(
    localStorage.getItem("repetitionCompletedOnce") === "1"
  );

  const INSTRUCTION_DEFAULT =
    "Kéo các hàng để căn đúng mẫu lặp mục tiêu vào giữa (đạt 100%).";
  const INSTRUCTION_DONE = "Hoàn thành! Bạn có thể tiếp tục";
  const INSTRUCTION_SKIPPABLE = "Bạn đã đạt 100% trước đó — có thể bấm Bỏ qua";

  const shapeDrawers = {
    circle: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        x + SHAPE_SIZE / 2,
        y + SHAPE_SIZE / 2,
        SHAPE_SIZE / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    },
    square: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, SHAPE_SIZE, SHAPE_SIZE);
    },
    triangle: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + SHAPE_SIZE / 2, y);
      ctx.lineTo(x + SHAPE_SIZE, y + SHAPE_SIZE);
      ctx.lineTo(x, y + SHAPE_SIZE);
      ctx.closePath();
      ctx.fill();
    },
  };

  const initRows = () => {
    const containerHeight = 400;
    const startY = (containerHeight - 4 * ROW_HEIGHT) / 2;

    const initialRows: Row[] = [
      {
        y: startY,
        isDraggable: false,
        pattern: { type: "circle", color: GRAY_COLOR },
      },
      {
        y: startY + ROW_HEIGHT,
        isDraggable: false,
        pattern: { type: "square", color: GREEN_COLOR },
      },
      {
        y: startY + ROW_HEIGHT * 2,
        isDraggable: true,
        offsetX: 0,
        patterns: [
          { type: "triangle", color: GREEN_COLOR },
          { type: "circle", color: GRAY_COLOR },
        ],
        targetPatternIndex: 1,
      },
      {
        y: startY + ROW_HEIGHT * 3,
        isDraggable: true,
        offsetX: 0,
        patterns: [
          { type: "square", color: GRAY_COLOR },
          { type: "square", color: GREEN_COLOR },
        ],
        targetPatternIndex: 1,
      },
    ];

    setRows(initialRows);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpi = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpi;
    const canvasHeight = canvas.height / dpi;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const shapesViewportWidth =
      NUM_SHAPES_IN_VIEW * SHAPE_SIZE + (NUM_SHAPES_IN_VIEW - 1) * SHAPE_GAP;
    const shapesViewportX = (canvasWidth - shapesViewportWidth) / 2;
    const visualViewportWidth = shapesViewportWidth + VIEWPORT_PADDING * 2;
    const visualViewportX = shapesViewportX - VIEWPORT_PADDING;

    rows.forEach((row, index) => {
      ctx.save();

      if (row.isDraggable) {
        ctx.beginPath();
        ctx.rect(visualViewportX, row.y, visualViewportWidth, SHAPE_SIZE);
        ctx.clip();
      }

      if (row.isDraggable && row.patterns && row.offsetX !== undefined) {
        const singlePatternWidth =
          NUM_SHAPES_IN_VIEW * (SHAPE_SIZE + SHAPE_GAP);
        const fullTapeWidth = singlePatternWidth * row.patterns.length;
        const baseOffset =
          ((row.offsetX % fullTapeWidth) + fullTapeWidth) % fullTapeWidth;

        const numTapesToDraw = 4;
        for (
          let tapeIndex = -numTapesToDraw / 2;
          tapeIndex < numTapesToDraw / 2;
          tapeIndex++
        ) {
          row.patterns.forEach((pattern, patternIndex) => {
            for (let i = 0; i < NUM_SHAPES_IN_VIEW; i++) {
              const x =
                shapesViewportX +
                baseOffset +
                tapeIndex * fullTapeWidth +
                patternIndex * singlePatternWidth +
                i * (SHAPE_SIZE + SHAPE_GAP);
              shapeDrawers[pattern.type](ctx, x, row.y, pattern.color);
            }
          });
        }
      } else if (row.pattern) {
        for (let i = 0; i < NUM_SHAPES_IN_VIEW; i++) {
          const x = shapesViewportX + i * (SHAPE_SIZE + SHAPE_GAP);
          shapeDrawers[row.pattern.type](ctx, x, row.y, row.pattern.color);
        }
      }

      ctx.restore();

      if (row.isDraggable && hoveredRowIndex === index && !isDragging) {
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          visualViewportX,
          row.y - (ROW_HEIGHT - SHAPE_SIZE) / 2,
          visualViewportWidth,
          ROW_HEIGHT
        );
        ctx.setLineDash([]);
      }
    });
  };

  const calculateProgress = () => {
    let totalCorrectness = 0;

    rows.forEach((row) => {
      if (
        !row.isDraggable ||
        !row.patterns ||
        row.offsetX === undefined ||
        row.targetPatternIndex === undefined
      )
        return;

      const patternWidth = NUM_SHAPES_IN_VIEW * (SHAPE_SIZE + SHAPE_GAP);
      const fullTapeWidth = patternWidth * row.patterns.length;
      const targetOffset = -row.targetPatternIndex * patternWidth;

      const normalizedOffset =
        ((row.offsetX % fullTapeWidth) + fullTapeWidth) % fullTapeWidth;
      const normalizedTarget =
        ((targetOffset % fullTapeWidth) + fullTapeWidth) % fullTapeWidth;

      const distance = Math.abs(normalizedOffset - normalizedTarget);
      const shortestDistance = Math.min(distance, fullTapeWidth - distance);

      const maxDistance = fullTapeWidth / 2;
      const correctness = Math.max(0, 1 - shortestDistance / maxDistance);
      totalCorrectness += correctness * 50;
    });

    const newPercentage = Math.round(totalCorrectness);
    setPercentage(newPercentage);

    if (newPercentage === 100 && !hasCompletedOnce) {
      setHasCompletedOnce(true);
      localStorage.setItem("repetitionCompletedOnce", "1");
    }
  };

  // Tương tác chuột / touch
  const getMousePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const m = getMousePos(e.nativeEvent);
    const clickedIndex = rows.findIndex(
      (row) =>
        row.isDraggable && m.y >= row.y - 15 && m.y <= row.y + SHAPE_SIZE + 15
    );
    if (clickedIndex !== -1) {
      setIsDragging(true);
      setActiveRowIndex(clickedIndex);
      setDragStartX(m.x);
      setInitialOffsetX(rows[clickedIndex].offsetX || 0);
      e.preventDefault?.();
    }
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    const m = getMousePos(e);
    setHoveredRowIndex(
      rows.findIndex(
        (row) =>
          row.isDraggable && m.y >= row.y - 15 && m.y <= row.y + SHAPE_SIZE + 15
      ) || null
    );

    if (!isDragging || activeRowIndex === null) return;
    const deltaX = m.x - dragStartX;
    let newOffset = initialOffsetX + deltaX;
    newOffset = Math.round(newOffset / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;

    setRows((prev) => {
      const updated = [...prev];
      if (updated[activeRowIndex].offsetX !== undefined) {
        updated[activeRowIndex].offsetX = newOffset;
      }
      return updated;
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setActiveRowIndex(null);
  };

  useEffect(() => {
    initRows();
    const canvas = canvasRef.current;
    const dpi = window.devicePixelRatio || 1;
    if (canvas) {
      canvas.width = (containerRef.current?.offsetWidth || 800) * dpi;
      canvas.height = 400 * dpi;
      const ctx = canvas.getContext("2d");
      ctx?.scale(dpi, dpi);
    }

    const anim = () => {
      draw();
      calculateProgress();
      requestAnimationFrame(anim);
    };
    anim();

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    window.addEventListener("resize", initRows);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      window.removeEventListener("resize", initRows);
    };
  }, [activeRowIndex, isDragging]);

  return (
    <div className="fade-wrapper fade-in">
      <div className="canvas-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          height={400}
          style={{ backgroundColor: "transparent" }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
      </div>

      <div className="completion">
        <div className="completion-content">
          <span className="percentage" style={{ color: GREEN_COLOR }}>
            {percentage}%
          </span>
          <span className="instruction">
            {percentage === 100
              ? INSTRUCTION_DONE
              : hasCompletedOnce
              ? INSTRUCTION_SKIPPABLE
              : INSTRUCTION_DEFAULT}
          </span>
        </div>

        <div className="completion-button">
          {percentage === 100 || allowSkip ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RepetitionCanvas;
