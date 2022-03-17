import "styles/app.scss";
import "styles/global.scss";

import TheoryContentSlide from "components/TheoryContentSlide";

function App() {
    return <div style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
    }}>
        <div style={{
            width: "83.33333333%",
            padding: 50,
        }}>
            <TheoryContentSlide theory={{
                text: "Initial text ...",
                canvasScript: "",
            }} nextHandle={() => {}} />
        </div>
    </div>
}
export default App;