import React, { FC } from 'react';
import scrollToTopText from './images/Back to top.svg';
import scrollToTopArrow from './images/Back to top arrow.svg';

interface scrollProps {
    scrollY: number;
}
class ScrollToTop extends React.Component<scrollProps> {
    render() {

        return (
            <a id="stt" href="#"  
            style={this.props.scrollY < 20 ? {
                opacity: 0,
                visibility: "hidden"
            }
            : {
                visibility: "visible",
                opacity: 1,
            }}>
                <span id = "stt-span">BACK TO TOP</span>
            </a>
        )
    }
}

export default ScrollToTop;