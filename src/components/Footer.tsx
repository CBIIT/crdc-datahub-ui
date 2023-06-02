import React, { FC } from 'react';
import "./stylesheets/TopFooterStyles.css"
import "./stylesheets/BottomFooterStyles.css"
import "./stylesheets/ScrollToTopStyles.css"
import BottomFooter from './BottomFooter';
import TopFooter from './TopFooter';
import ScrollToTop from './ScrollToTop';

const defaultBottomFooterContactUsLinks = [["https://livehelp.cancer.gov/", "Live chat"],
                                          ["tel:+18004226237", "1-800-4-CANCER"], 
                                          ["mailto:+cdshelpdesk@mail.nih.gov", "cdshelpdesk@mail.nih.gov"],
                                          ["https://nci.az1.qualtrics.com/jfe/form/SV_aeLLobt6ZeGVn5I", "Site Feedback"]];

class Footer extends React.Component {
  state = {
    innerWidth: window.innerWidth,
    scroll: window.scrollY
  }

  componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this))
    window.addEventListener("scroll", this.scroll.bind(this))
    this.resize()
  }
  resize() {
    this.setState({ innerWidth: window.innerWidth })
  }
  scroll() {
    this.setState({ scroll: window.scrollY })
  }

  render() {
    return (
      <div id="block-ncidsfooterenglish">
        <footer>
          <TopFooter></TopFooter>
          <BottomFooter innerWidth={this.state.innerWidth} contactUsLinks = {defaultBottomFooterContactUsLinks}></BottomFooter>
          <ScrollToTop scrollY={this.state.scroll}></ScrollToTop>
        </footer>
      </div>
    )
  }
}

export default Footer;