import React, { useRef, useState, useEffect } from "react";
import "./styles.scss";
import Button from "../Button";

interface AlignCanvasProps {
  onContinue: () => void;
}

const AlignCanvas: React.FC<AlignCanvasProps> = ({ onContinue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State quản lý thanh và tiến độ
  const [barWidths, setBarWidths] = useState<number[]>([]);
  const [barOffsets, setBarOffsets] = useState<number[]>([]);
  const [percentage, setPercentage] = useState(0);

  // State cho thao tác kéo thả
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);

  const [allowSkip, setAllowSkip] = useState(false);

  const LINE_OFFSET = 15;
  const SNAP_GRID_SIZE = 2;
  const barYPositions = [50, 120, 190, 260, 330];
  const barHeight = 40;

  const getRandomWidth = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const generateBarWidths = () => {
    if (window.innerWidth <= 480) {
      return Array.from({ length: 5 }, () => getRandomWidth(150, 250));
    } else if (window.innerWidth <= 768) {
      return Array.from({ length: 5 }, () => getRandomWidth(200, 350));
    } else {
      return Array.from({ length: 5 }, () => getRandomWidth(200, 500));
    }
  };

  const getRandomOffset = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const generateBarOffsets = () => {
    if (window.innerWidth <= 480) {
      return Array.from({ length: 5 }, () => getRandomOffset(-100, 100));
    } else if (window.innerWidth <= 768) {
      return Array.from({ length: 5 }, () => getRandomOffset(-120, 120));
    } else {
      return Array.from({ length: 5 }, () => getRandomOffset(-150, 150));
    }
  };

  // Vẽ canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Tính điểm neo để vẽ đường thẳng
    const points = barWidths.map((w, i) => {
      const xLeft = width / 2 + barOffsets[i] - w / 2;
      const x = xLeft - LINE_OFFSET;
      const y = barYPositions[i] + barHeight / 2;
      return { x, y };
    });

    // Vẽ các thanh
    ctx.fillStyle = "rgb(198,198,198)";
    barWidths.forEach((w, i) => {
      const x = width / 2 + barOffsets[i] - w / 2;
      const y = barYPositions[i];
      ctx.fillRect(x, y, w, barHeight);
    });

    // Vẽ đường nét đứt
    ctx.strokeStyle = percentage === 100 ? "rgb(83,234,205)" : "rgb(2,2,2)";
    ctx.lineWidth = percentage === 100 ? 2 : 3;
    if (percentage !== 100) ctx.setLineDash([10, 15]);
    else ctx.setLineDash([]);

    ctx.beginPath();
    if (percentage === 100 && points.length > 0) {
      const perfectX = points[0].x;
      points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(perfectX, pt.y);
        else ctx.lineTo(perfectX, pt.y);
      });
    } else {
      points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const updatePercentage = () => {
    const width = canvasRef.current?.width || 0;

    const xPositions = barOffsets.map((offset, i) => {
      return width / 2 + offset - barWidths[i] / 2;
    });

    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const deviation = maxX - minX;

    const MAX_DEV = width / 2;
    let completion = 100 * (1 - Math.min(deviation, MAX_DEV) / MAX_DEV);

    completion = Math.max(0, Math.min(100, Math.round(completion)));
    if (deviation <= 1) completion = 100;

    setPercentage(completion);
  };

  // Lấy index của thanh khi click
  const getBarIndexAtPosition = (mouseX: number, mouseY: number) => {
    const width = canvasRef.current?.width || 0;
    for (let i = 0; i < barWidths.length; i++) {
      const barCenterX = width / 2 + barOffsets[i];
      const xStart = barCenterX - barWidths[i] / 2;
      const xEnd = xStart + barWidths[i];
      const yStart = barYPositions[i];
      const yEnd = yStart + barHeight;
      if (
        mouseX >= xStart &&
        mouseX <= xEnd &&
        mouseY >= yStart &&
        mouseY <= yEnd
      ) {
        return i;
      }
    }
    return null;
  };

  // Sự kiện nhấn chuột
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const index = getBarIndexAtPosition(mouseX, mouseY);
    if (index !== null) {
      setDraggingIndex(index);
      setDragStartX(clientX);
      setDragStartOffset(barOffsets[index]);
    }
  };

  // Sự kiện kéo chuột
  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (draggingIndex === null) return;

    let clientX;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ("clientX" in e) {
      clientX = e.clientX;
    } else return;

    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth;
    const dx = clientX - dragStartX;
    let newOffset = dragStartOffset + dx;
    newOffset = Math.round(newOffset / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;

    const barWidth = barWidths[draggingIndex];
    const minOffset = -containerWidth / 2 + barWidth / 2;
    const maxOffset = containerWidth / 2 - barWidth / 2;

    if (newOffset < minOffset) newOffset = minOffset;
    if (newOffset > maxOffset) newOffset = maxOffset;

    setBarOffsets((prev) => {
      const updated = [...prev];
      updated[draggingIndex] = newOffset;
      return updated;
    });
  };

  // Sự kiện nhả chuột
  const handlePointerUp = () => setDraggingIndex(null);

  // useEffect gắn event listener
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
  }, [draggingIndex, dragStartX, dragStartOffset]);

  // useEffect resize canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const containerWidth =
        containerRef.current?.offsetWidth || window.innerWidth;
      setBarWidths(generateBarWidths());
      setBarOffsets(generateBarOffsets());

      if (canvasRef.current) {
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = 400;
      }
      drawCanvas();
      updatePercentage();
    };

    requestAnimationFrame(resizeCanvas);
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // useEffect vẽ lại canvas khi thay đổi state
  useEffect(() => {
    drawCanvas();
    updatePercentage();
  }, [barWidths, barOffsets, percentage]);

  // useEffect hiện nút bỏ qua sau 60s
  useEffect(() => {
    setAllowSkip(false);
    const timer = setTimeout(() => setAllowSkip(true), 60000);
    return () => clearTimeout(timer);
  }, []);

  // Tính màu sắc chuyển dần theo %
  const startColor = [249, 93, 93];
  const endColor = [83, 234, 205];
  const colorFactor = percentage / 100;

  const interpolateColor = (startColor, endColor, factor) => {
    const result = startColor.map((start, i) =>
      Math.round(start + (endColor[i] - start) * factor)
    );
    return `rgb(${result.join(",")})`;
  };

  const interpolatedColor = interpolateColor(startColor, endColor, colorFactor);

  // Render
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
          <span className="percentage" style={{ color: interpolatedColor }}>
            {percentage}%
          </span>
          {percentage === 100 ? (
            <div className="completed-info">
              <h3 className="completed-title">
                <strong>QUY TẮC ALIGN</strong>
              </h3>
              <p className="completed-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          ) : (
            <span className="instruction">
              Kéo các thanh chữ nhật để nét đứt thẳng hàng
            </span>
          )}
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

export default AlignCanvas;
