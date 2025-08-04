import React, { useEffect, useState } from "react";
import "./styles.scss";
import IconButton from "../IconButton";
import { StudyAction } from "../../containers/Course"; // Adjust path if needed
import { SamuiSlideControlsProps } from "shared/components/SamuiSlideProvider";

interface CourseIntroProps {
  title: string;
  fetchCourse: () => Promise<any>;
  setInitialStudyAction: (action: StudyAction) => void;
  slideControlsRef: React.RefObject<SamuiSlideControlsProps>;
  courseLoading: boolean;
}

const iconPaths = ["/img/home.png", "/img/option.png", "/img/flag.png"];

const cards = [
  {
    key: "align",
    title: "QUY TẮC ALIGN",
    img: "/img/plants.png",
    difficulty: "Dễ",
    completion: "100%",
    action: "STUDY_FROM_SCRATCH" as StudyAction,
    bg: "align",
  },
  {
    key: "group",
    title: "QUY TẮC NHÓM",
    img: "/img/group.png",
    difficulty: "Dễ",
    completion: "100%",
    action: "CONTINUE_STUDY" as StudyAction,
    bg: "group",
  },
  {
    key: "build",
    title: "QUY TẮC LẶP",
    img: "/img/flowers.png",
    difficulty: "Dễ",
    completion: "100%",
    action: "STUDY_UNFINISHED_CONTENTS" as StudyAction,
    bg: "build",
  },
];

const CourseIntro: React.FC<CourseIntroProps> = ({
  title,
  fetchCourse,
  setInitialStudyAction,
  slideControlsRef,
  courseLoading,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 480 : false
  );
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleCardClick = (studyAction: StudyAction) => {
    fetchCourse()
      .then(() => {
        setInitialStudyAction(studyAction);
        slideControlsRef.current?.slideNext();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load course");
      });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const visibleCards = isMobile ? [cards[currentIndex]] : cards;

  const handlePrev = () => {
    setDirection("left");
    setHasInteracted(true);
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection("right");
    setHasInteracted(true);
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  const handleIconClick = (iconSrc: string) => {
    if (iconSrc === "/img/home.png" || iconSrc === "/img/option.png") {
      slideControlsRef.current?.slideTo(0);
    }
  };

  return (
    <div className="course-intro">
      <div className="logo">
        <span className="logo-part">GRA</span>
        <span className="logo-part">EDU</span>
      </div>
      <div className="course-content">
        <h1 className="course-title">{title}</h1>
        <div className="course-sections">
          <button className="nav-button prev" onClick={handlePrev}>
            <img src="/img/left-arrow.png" alt="Previous" />
          </button>

          {visibleCards.map((card) => (
            <div
              key={card.key}
              className={`section-card ${card.bg} ${
                hasInteracted ? `slide-${direction}` : ""
              }`}
              onClick={() => handleCardClick(card.action)}
            >
              <img src={card.img} alt={card.title} />
              <div className="content-container">
                <h2>{card.title}</h2>
                <div className="section-details">
                  <span>
                    Mức độ: <strong>{card.difficulty}</strong>
                  </span>
                  <span>
                    Hoàn thành: <strong>{card.completion}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button className="nav-button next" onClick={handleNext}>
            <img src="/img/right-arrow.png" alt="Next" />
          </button>
        </div>
      </div>
      <div className="course-icons">
        <IconButton icons={iconPaths} />
      </div>
    </div>
  );
};

export default CourseIntro;
