import React, { useState, useEffect } from 'react';
import "./ScrollButtonStyles.css";

const ScrollButton = () => {
    const [scroll, setScroll] = useState(0);

    const updateScroll = () => {
        setScroll(window.scrollY);
    };

    useEffect(() => {
        window.addEventListener('scroll', updateScroll);
    }, []);

    return (
      <a
        id="stt" href="#top"
        style={scroll < 200 ? {
                    opacity: 0,
                    visibility: "hidden"
                }
                    : {
                        visibility: "visible",
                        opacity: 1,
                    }}
      >
        <span id="stt-span">BACK TO TOP</span>
      </a>
    );
};

export default ScrollButton;
