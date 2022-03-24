import React from "react";
import "./styles.scss";

export interface SamuiSlideComponentProps {
    slidePrevious: () => void;
    slideNext: () => void;
}
interface SamuiSlideContentProps {
    key: string;
    component: React.ComponentType<SamuiSlideComponentProps>,
}
interface SamuiSlideProviderProps {
    contents: SamuiSlideContentProps[];
}
export default function SamuiSlideProvider({ contents }: SamuiSlideProviderProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [beforeIndex, setBeforeIndex] = React.useState(0);
    const previous = () => {
        if (currentIndex === 0) return;
        setBeforeIndex(currentIndex);
        setCurrentIndex(currentIndex - 1);
    }
    const next = () => {
        if (currentIndex === contents.length - 1) return;
        setBeforeIndex(currentIndex);
        setCurrentIndex(currentIndex + 1);
    };
    return (
        <div className="samuislideprovider-container">
            <div className="samuislideprovider-anchor">
                {
                    contents.map((d, i) => {
                        const AA = d.component;
                        if (i === currentIndex - 1) {
                            return <div key={d.key} className={`samuislideprovider-content ${currentIndex >= beforeIndex ? 'slide-out-top' : 'slide-out-bottom'}`}>
                                <d.component slidePrevious={previous} slideNext={next} />
                            </div>
                        }
                        if (i === currentIndex) {
                            return <div key={d.key} className={`samuislideprovider-content ${currentIndex >= beforeIndex ? 'slide-in-bottom' : 'slide-in-top'}`}>
                                <d.component slidePrevious={previous} slideNext={next} />
                            </div>
                        }
                        if (i === currentIndex + 1) {
                            return <div key={d.key} className={`samuislideprovider-content ${currentIndex >= beforeIndex ? 'slide-out-top' : 'slide-out-bottom'}`}>
                                <d.component slidePrevious={previous} slideNext={next} />
                            </div>
                        }
                        return <div key={d.key} className={`${currentIndex > beforeIndex ? 'slide-out-top' : 'slide-out-top'}`}></div>;
                    })
                }
            </div>
        </div>
    );
}