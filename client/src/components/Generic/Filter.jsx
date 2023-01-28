import React from "react";

function filter (props) {
    return (
        <div className="timer__filter">
            <h4 className="form__input-label">Client Name</h4>
            <input className="timer__form-input" value={props.value} onChange={props.handleChange} />
        </div>
    );
};

export default filter;