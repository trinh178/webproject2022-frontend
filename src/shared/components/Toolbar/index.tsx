import React from "react";
import "./syles.scss";

export default function Toolbar() {
    return (
        <div className="toolbar">
            <div>Toolbar</div>
            <div className="form-switch">
                <input className="form-check-input" type="checkbox" />
            </div>
        </div>
    );
}