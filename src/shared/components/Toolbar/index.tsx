import React from "react";
import "./syles.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function Toolbar() {
    const navigate = useNavigate();
    const [invert, setInvert] = React.useState<boolean>(false);
    React.useEffect(() => {
        if (invert) {
            document.body.classList.add("invert");
        } else {
            document.body.classList.remove("invert");
        }
        return () => {
            document.body.classList.remove("invert");
        };
    }, [invert]);
    const onReset = () => {
        localStorage.clear();
        navigate(0);
    };
    return (
        <div className="toolbar">
            <div>Toolbar</div>
            <div className="d-flex m-0 p-0 align-items-center">
                <div className="form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        value={String(invert)}
                        onChange={() => setInvert(!invert)}
                    />
                </div>
                <div
                    className="ms-1 btn btn-sm btn-danger m-0 p-0 ps-2 pe-2"
                    onClick={() => onReset()}    
                ><FontAwesomeIcon icon={faRefresh} /></div>
            </div>
        </div>
    );
}