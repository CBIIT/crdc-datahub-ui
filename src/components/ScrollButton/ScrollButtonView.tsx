import React, { useState, useEffect, useRef } from "react";
import "./ScrollButtonStyles.css";

const ScrollButton = () => {
  const [scroll, setScroll] = useState(0);
  const clickToTopRef = useRef<HTMLButtonElement>(null);

  const updateScroll = () => {
    setScroll(window.scrollY);
  };

  const onClickScrollToTop = () => {
    window.scrollTo(0, 0);
    setScroll(0);
  };

  useEffect(() => {
    window.addEventListener("scroll", updateScroll);
    clickToTopRef.current?.addEventListener("click", onClickScrollToTop);

    return () => {
      window.removeEventListener("scroll", updateScroll);
      clickToTopRef.current?.removeEventListener("click", onClickScrollToTop);
    };
  }, []);

  return (
    <button
      type="button"
      ref={clickToTopRef}
      id="stt"
      style={
        scroll < 200
          ? {
              opacity: 0,
              visibility: "hidden",
              cursor: "pointer",
            }
          : {
              visibility: "visible",
              opacity: 1,
              cursor: "pointer",
            }
      }
    >
      <span id="stt-span">BACK TO TOP</span>
    </button>
  );
};

export default ScrollButton;
