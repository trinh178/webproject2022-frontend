import React from "react";
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

const CourseIntro: React.FC<CourseIntroProps> = ({
  title,
  fetchCourse,
  setInitialStudyAction,
  slideControlsRef,
  courseLoading,
}) => {
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
          <button className="nav-button prev">
            <img src="/img/left-arrow.png" alt="Previous" />
          </button>
          <div
            className="section-card align"
            onClick={() => handleCardClick("STUDY_FROM_SCRATCH")}
          >
            <img src="/img/plants.png" alt="Align Icon" />
            <div className="content-container">
              <h2>QUY TẮC ALIGN</h2>
              <div className="section-details">
                <span>
                  Mức độ: <strong>Dễ</strong>
                </span>
                <span>
                  Hoàn thành: <strong>100%</strong>
                </span>
              </div>
            </div>
          </div>
          <div
            className="section-card group"
            onClick={() => handleCardClick("CONTINUE_STUDY")}
          >
            <img src="/img/group.png" alt="Group Icon" />
            <div className="content-container">
              <h2>QUY TẮC NHÓM</h2>
              <div className="section-details">
                <span>
                  Mức độ: <strong>Dễ</strong>
                </span>
                <span>
                  Hoàn thành: <strong>100%</strong>
                </span>
              </div>
            </div>
          </div>
          <div
            className="section-card build"
            onClick={() => handleCardClick("STUDY_UNFINISHED_CONTENTS")}
          >
            <img src="/img/flowers.png" alt="Build Icon" />
            <div className="content-container">
              <h2>QUY TẮC LẬP</h2>
              <div className="section-details">
                <span>
                  Mức độ: <strong>Dễ</strong>
                </span>
                <span>
                  Hoàn thành: <strong>100%</strong>
                </span>
              </div>
            </div>
          </div>
          <button className="nav-button next">
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
