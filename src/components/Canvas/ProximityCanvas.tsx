import React, { useRef, useState, useEffect } from "react";
import Button from "../Button";
import "./styles.scss";

interface Shape {
  id: number;
  type: "square" | "circle";
  x: number;
  y: number;
  size: number;
  color: string;
}

interface ProximityCanvasProps {
  onContinue: () => void;
}

const BASE_UNIT = 10;
const NUM_SHAPES_PER_TYPE = 4;
const PADDING = BASE_UNIT * 2;
const COLLISION_PADDING = BASE_UNIT / 2;
const MIN_SIZE_MULTIPLIER = 3;
const MAX_SIZE_MULTIPLIER = 6;
const COLLISION_ITERATIONS = 8;

const GRAY_COLOR = "#9ca3af";
const GREEN_COLOR = "#10b981";

const ProximityCanvas: React.FC<ProximityCanvasProps> = ({ onContinue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [allowSkip, setAllowSkip] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState<boolean>(
    localStorage.getItem("proximityCompletedOnce") === "1"
  );

  const minTotalArea = useRef({ squares: 0, circles: 0 });
  const initialTotalArea = useRef(0);

  // ====== INIT SHAPES ======
  const initShapes = () => {
    const containerWidth = containerRef.current?.offsetWidth || 1320;
    const containerHeight = 500;
    const newShapes: Shape[] = [];

    // Tạo placeholders dạng lưới 2x4
    const placeholders: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];
    const gridCols = 4;
    const gridRows = 2;
    const cellWidth = MAX_SIZE_MULTIPLIER * BASE_UNIT + PADDING * 2;
    const cellHeight = MAX_SIZE_MULTIPLIER * BASE_UNIT + PADDING * 2;
    const totalGridWidth = gridCols * cellWidth;
    const totalGridHeight = gridRows * cellHeight;
    const gridStartX = (containerWidth - totalGridWidth) / 2;
    const gridStartY = (containerHeight - totalGridHeight) / 2;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        placeholders.push({
          x: gridStartX + c * cellWidth,
          y: gridStartY + r * cellHeight,
          width: cellWidth,
          height: cellHeight,
        });
      }
    }

    // Shuffle placeholders
    for (let i = placeholders.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [placeholders[i], placeholders[j]] = [placeholders[j], placeholders[i]];
    }

    for (let i = 0; i < NUM_SHAPES_PER_TYPE * 2; i++) {
      const sizeMultiplier =
        Math.floor(
          Math.random() * (MAX_SIZE_MULTIPLIER - MIN_SIZE_MULTIPLIER + 1)
        ) + MIN_SIZE_MULTIPLIER;
      const size = sizeMultiplier * BASE_UNIT;
      const pos = placeholders[i];
      const shapeX = pos.x + (pos.width - size) / 2;
      const shapeY = pos.y + (pos.height - size) / 2;
      newShapes.push({
        id: i,
        type: i < NUM_SHAPES_PER_TYPE ? "square" : "circle",
        x: shapeX,
        y: shapeY,
        size,
        color: GRAY_COLOR,
      });
    }

    resolveCollisions(newShapes);
    const squares = newShapes.filter((s) => s.type === "square");
    const circles = newShapes.filter((s) => s.type === "circle");
    minTotalArea.current.squares = getMinimumArea(squares);
    minTotalArea.current.circles = getMinimumArea(circles);
    initialTotalArea.current =
      getBoundingBox(squares).area + getBoundingBox(circles).area;

    setShapes(newShapes);
  };

  // ====== BOUNDING BOX & MIN AREA ======
  const getBoundingBox = (arr: Shape[]) => {
    if (!arr.length) return { x: 0, y: 0, width: 0, height: 0, area: 0 };
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    arr.forEach((s) => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + s.size);
      maxY = Math.max(maxY, s.y + s.size);
    });
    const x = minX - PADDING;
    const y = minY - PADDING;
    const width = maxX - minX + PADDING * 2;
    const height = maxY - minY + PADDING * 2;
    return { x, y, width, height, area: width * height };
  };

  const getMinimumArea = (arr: Shape[]) => {
    if (!arr.length) return 0;
    const totalW =
      arr.reduce((sum, s) => sum + s.size, 0) +
      (arr.length - 1) * COLLISION_PADDING;
    const maxH = Math.max(...arr.map((s) => s.size));
    return (totalW + PADDING * 2) * (maxH + PADDING * 2);
  };

  const getIntersection = (b1: any, b2: any) => {
    const x1 = Math.max(b1.x, b2.x);
    const y1 = Math.max(b1.y, b2.y);
    const x2 = Math.min(b1.x + b1.width, b2.x + b2.width);
    const y2 = Math.min(b1.y + b1.height, b2.y + b2.height);
    if (x1 < x2 && y1 < y2) {
      return {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
        area: (x2 - x1) * (y2 - y1),
      };
    }
    return null;
  };

  // ====== COLLISION RESOLVE ======
  const resolveCollisions = (shapeArr: Shape[]) => {
    const containerWidth = containerRef.current?.offsetWidth || 1320;
    const containerHeight = 500;
    for (let i = 0; i < COLLISION_ITERATIONS; i++) {
      for (let j = 0; j < shapeArr.length; j++) {
        for (let k = j + 1; k < shapeArr.length; k++) {
          const s1 = shapeArr[j];
          const s2 = shapeArr[k];
          const dx = s1.x + s1.size / 2 - (s2.x + s2.size / 2);
          const dy = s1.y + s1.size / 2 - (s2.y + s2.size / 2);
          const combW = (s1.size + s2.size) / 2 + COLLISION_PADDING;
          const combH = (s1.size + s2.size) / 2 + COLLISION_PADDING;
          if (Math.abs(dx) < combW && Math.abs(dy) < combH) {
            const ox = combW - Math.abs(dx);
            const oy = combH - Math.abs(dy);
            if (ox < oy) {
              s1.x += (ox / 2) * Math.sign(dx);
              s2.x -= (ox / 2) * Math.sign(dx);
            } else {
              s1.y += (oy / 2) * Math.sign(dy);
              s2.y -= (oy / 2) * Math.sign(dy);
            }
          }
        }
      }
      shapeArr.forEach((s) => {
        s.x = Math.min(
          Math.max(s.x, PADDING),
          containerWidth - PADDING - s.size
        );
        s.y = Math.min(
          Math.max(s.y, PADDING),
          containerHeight - PADDING - s.size
        );
      });
    }
  };

  // ====== DRAW ======
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    shapes.forEach((s) => {
      ctx.fillStyle = s.color;
      if (s.type === "square") ctx.fillRect(s.x, s.y, s.size, s.size);
      else {
        ctx.beginPath();
        ctx.arc(s.x + s.size / 2, s.y + s.size / 2, s.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (selectedShape) {
      const squares = shapes.filter((s) => s.type === "square");
      const circles = shapes.filter((s) => s.type === "circle");
      const boxS = getBoundingBox(squares);
      const boxC = getBoundingBox(circles);
      const intersection = getIntersection(boxS, boxC);

      if (intersection) {
        ctx.fillStyle = "rgba(255,0,0,0.1)";
        ctx.fillRect(
          intersection.x,
          intersection.y,
          intersection.width,
          intersection.height
        );
      }

      [boxS, boxC].forEach((box, idx) => {
        const isComplete =
          box.area <=
          (idx === 0
            ? minTotalArea.current.squares
            : minTotalArea.current.circles);
        ctx.strokeStyle = isComplete ? GREEN_COLOR : GRAY_COLOR;
        ctx.lineWidth = 2;
        ctx.setLineDash(isComplete ? [] : [5, 5]);
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      });
      ctx.setLineDash([]);
    }
  };

  // ====== PROGRESS ======
  const updatePercentage = () => {
    const squares = shapes.filter((s) => s.type === "square");
    const circles = shapes.filter((s) => s.type === "circle");
    const boxS = getBoundingBox(squares);
    const boxC = getBoundingBox(circles);
    const intersection = getIntersection(boxS, boxC);
    const overlapArea = intersection ? intersection.area : 0;

    const currentTotalArea = boxS.area + boxC.area;
    const minArea = minTotalArea.current.squares + minTotalArea.current.circles;
    const areaRange = initialTotalArea.current - minArea;
    const areaScoreRatio =
      areaRange > 0 ? 1 - (currentTotalArea - minArea) / areaRange : 1;
    const scoreA = Math.max(0, Math.min(1, areaScoreRatio)) * 50;

    const maxOverlapArea = currentTotalArea * 0.5;
    const overlapScoreRatio =
      maxOverlapArea > 0 ? 1 - overlapArea / maxOverlapArea : 1;
    const scoreB = Math.max(0, Math.min(1, overlapScoreRatio)) * 50;

    const percent = Math.round(scoreA + scoreB);
    setPercentage(percent);

    if ((percent === 100 || hasCompletedOnce) && !hasCompletedOnce) {
      localStorage.setItem("proximityCompletedOnce", "1");
      setHasCompletedOnce(true);
    }
  };

  // ====== HANDLE POINTER ======
  const getPointerPos = (e: any) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (
        pos.x >= s.x &&
        pos.x <= s.x + s.size &&
        pos.y >= s.y &&
        pos.y <= s.y + s.size
      ) {
        setSelectedShape(s);
        setOffsetX(pos.x - s.x);
        setOffsetY(pos.y - s.y);
        return;
      }
    }
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!selectedShape) return;
    const pos = getPointerPos(e);
    const nx = Math.round((pos.x - offsetX) / BASE_UNIT) * BASE_UNIT;
    const ny = Math.round((pos.y - offsetY) / BASE_UNIT) * BASE_UNIT;
    selectedShape.x = nx;
    selectedShape.y = ny;
    setShapes([...shapes]);
    updatePercentage();
  };

  const handlePointerUp = () => {
    if (!selectedShape) return;
    resolveCollisions(shapes);
    setSelectedShape(null);
    setShapes([...shapes]);
    updatePercentage();
  };

  // ====== EFFECTS ======
  useEffect(() => {
    initShapes();
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [shapes, selectedShape]);

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
  }, [selectedShape, shapes]);

  // Allow skip after 60s
  useEffect(() => {
    setAllowSkip(false);
    const timer = setTimeout(() => setAllowSkip(true), 60000);
    return () => clearTimeout(timer);
  }, []);

  // ====== RENDER ======
  return (
    <div className="fade-wrapper fade-in">
      <div className="canvas-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={containerRef.current?.offsetWidth || 1320}
          height={500}
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
              ? "Hoàn thành! Bạn có thể tiếp tục"
              : "Kéo các hình vuông và hình tròn để gom nhóm gần nhau và hạn chế chồng lấn."}
          </span>
        </div>

        <div className="completion-button">
          {(percentage === 100 || allowSkip) && (
            <Button
              className={`animated-button ${
                percentage === 100 ? "completed" : ""
              }`}
              iconSrc="/img/right.png"
              text={percentage === 100 ? "Tiếp tục" : "Bỏ qua"}
              bgColor={percentage === 100 ? GREEN_COLOR : "#f95d5d"}
              onClick={onContinue}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProximityCanvas;
