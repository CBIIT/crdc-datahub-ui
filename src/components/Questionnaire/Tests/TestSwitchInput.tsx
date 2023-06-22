import React, { FC, useId, useState } from "react";
import styled from "styled-components";

const StyleContainer = styled.div`
  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: #2196f3;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
`;

type Props = {
  label: string;
  name: string;
  required: boolean;
  value: boolean;
};
const CustomSwitch: FC<Props> = ({ ...props }) => {
  const id = useId();
  const [val, setVal] = useState(props.value);
  return (
    <StyleContainer>
      <div className="switch">
        <input type="checkbox" />
        <span className="slider" />
      </div>

      <div className="switch">
        <input type="checkbox" />
        <span className="slider round" />
      </div>

    </StyleContainer>
    //   <div>
    //     <div className={val ? classes.text : classes.textChecked}>No</div>
    //     <Switch
    //       focusVisibleClassName={classes.focusVisible}
    //       id={id}
    //       checked={val}
    //       name={props.name}
    //       onChange={(e, c) => { setVal(c); console.log('event:', `new value is: ${c}`); }}
    //       classes={{
    //       root: classes.root,
    //       switchBase: classes.switchBase,
    //       thumb: classes.thumb,
    //       track: classes.track,
    //       checked: classes.checked,
    //     }}
    //     />
    //     <div className={val ? classes.textChecked : classes.text}>Yes</div>
    //   </div>
  );
};

export default CustomSwitch;
