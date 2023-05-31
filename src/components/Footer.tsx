import React, { FC } from 'react';
import "./stylesheets/BottomFooterStyles.css"
import BottomFooter from './BottomFooter';
import TopFooter from './TopFooter';
import ScrollToTop from './ScrollToTop';

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
  scroll(){
    this.setState({ scroll: window.scrollY })
  }
  render() {
    return (
      <div id="block-ncidsfooterenglish">
        <footer>
          <TopFooter></TopFooter>
          <BottomFooter innerWidth={this.state.innerWidth}></BottomFooter>
          <ScrollToTop scrollY={this.state.scroll}></ScrollToTop>
        </footer>
      </div>
    )
  }
}

export default Footer;