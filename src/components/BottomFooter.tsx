import React, { FC } from 'react';
import instagram_svg from './images/Instagram.svg';
import twitter_svg from './images/Twitter.svg';
import facebook_svg from './images/Facebook.svg';
import youtube_svg from './images/Youtube.svg';
import linkedin_svg from './images/LinkedIn.svg';
interface bottomFooterProps {
    innerWidth: number;
}
class BottomFooter extends React.Component<bottomFooterProps> {

    render() {
        if (this.props.innerWidth > 906) {
            return (
                <div id="bottom-footer">
                    <div className="bottom-footer-container">
                        <div className="bottom-footer-item" id="bottom-footer-nci-info">
                            <span id="bottom-footer-nci-text">National Cancer Institute</span>
                            <span id="bottom-footer-nci-subtext">at the National Institutes of Health</span>
                            <span id="bottom-footer-follow-us-text">Follow Us</span>
                            <span id="bottom-footer-social-media-links">
                                <a href="https://www.instagram.com/nationalcancerinstitute/">
                                    <img src={instagram_svg} />
                                </a>
                                <a className="bottom-footer-social-media-imgs" href="https://twitter.com/thenci">
                                    <img src={twitter_svg} />
                                </a>
                                <a className="bottom-footer-social-media-imgs" href="https://www.facebook.com/cancer.gov">
                                    <img src={facebook_svg} />
                                </a>
                                <a className="bottom-footer-social-media-imgs" href="https://www.youtube.com/NCIgov">
                                    <img src={youtube_svg} />
                                </a>
                                <a className="bottom-footer-social-media-imgs" href="https://www.linkedin.com/company/nationalcancerinstitute/">
                                    <img src={linkedin_svg} />
                                </a>
                            </span>
                        </div>
                        <div className="bottom-footer-item" id="bottom-footer-contact-us-section">
                            <span id="bottom-footer-contact-us-text" >Contact Us</span>
                            <br></br>
                            <span id="bottom-footer-contact-us-links">
                                <a href="https://livehelp.cancer.gov/" id="bottom-footer-contact-us-live-chat">
                                    Live chat
                                </a>
                                <a href="tel:+18004226237" id="bottom-footer-contact-us-phone">
                                    1-800-4-CANCER
                                </a>
                                <a href="mailto:+cdshelpdesk@mail.nih.gov" id="bottom-footer-contact-us-email">
                                    cdshelpdesk@mail.nih.gov
                                </a>
                                <a href="https://nci.az1.qualtrics.com/jfe/form/SV_aeLLobt6ZeGVn5I" id="bottom-footer-contact-us-site-feedback">
                                    Site Feedback
                                </a>
                            </span>
                            <span className="bottom-footer-gov-links">
                                <a href="https://www.hhs.gov/">U.S. Department of Health and Human Services</a>
                                <a href="https://www.nih.gov/">National Institutes of Health</a>
                                <a href="https://www.cancer.gov/">National Cancer Institute</a>
                                <a href="https://usa.gov/">USA.gov</a>
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        else if (this.props.innerWidth > 375) {
            return (
                <div id="bottom-footer">
                    <span id="bottom-footer-nci-text">National Cancer Institute</span>
                    <span id="bottom-footer-nci-subtext">at the National Institutes of Health</span>
                    <span id="bottom-footer-contact-us-text" >Contact Us</span>
                    <br></br>
                    <span id="bottom-footer-contact-us-links">
                        <a href="https://livehelp.cancer.gov/" id="bottom-footer-contact-us-live-chat">
                            Live chat
                        </a>
                        <a href="tel:+18004226237" id="bottom-footer-contact-us-phone">
                            1-800-4-CANCER
                        </a>
                        <a href="mailto:+cdshelpdesk@mail.nih.gov" id="bottom-footer-contact-us-email">
                            cdshelpdesk@mail.nih.gov
                        </a>
                        <br></br>
                        <a href="https://nci.az1.qualtrics.com/jfe/form/SV_aeLLobt6ZeGVn5I" id="bottom-footer-contact-us-site-feedback">
                            Site Feedback
                        </a>
                    </span>

                    <span id="bottom-footer-follow-us-text">Follow Us</span>
                    <span id="bottom-footer-social-media-links">
                        <a href="https://www.instagram.com/nationalcancerinstitute/">
                            <img src={instagram_svg} />
                        </a>
                        <a className="bottom-footer-social-media-imgs" href="https://twitter.com/thenci">
                            <img src={twitter_svg} />
                        </a>
                        <a className="bottom-footer-social-media-imgs" href="https://www.facebook.com/cancer.gov">
                            <img src={facebook_svg} />
                        </a>
                        <a className="bottom-footer-social-media-imgs" href="https://www.youtube.com/NCIgov">
                            <img src={youtube_svg} />
                        </a>
                        <a className="bottom-footer-social-media-imgs" href="https://www.linkedin.com/company/nationalcancerinstitute/">
                            <img src={linkedin_svg} />
                        </a>
                    </span>


                    <span className="bottom-footer-gov-links">
                        <a href="https://www.hhs.gov/">U.S. Department of Health and Human Services</a>
                        <a href="https://www.nih.gov/">National Institutes of Health</a>
                        <a href="https://www.cancer.gov/">National Cancer Institute</a>
                        <a href="https://usa.gov/">USA.gov</a>
                    </span>
                </div>
            )
        }
        else {
            return (
                <div id="bottom-footer">
                    <span id="bottom-footer-nci-text">National Cancer Institute</span>
                    <span id="bottom-footer-nci-subtext">at the National Institutes of Health</span>
                    <span id="bottom-footer-contact-us-text" >Contact Us</span>
                    <br></br>
                    <span id="bottom-footer-contact-us-links">
                        <a href="https://livehelp.cancer.gov/" id="bottom-footer-contact-us-live-chat">
                            Live chat
                        </a>
                        <br></br>
                        <a href="tel:+18004226237" id="bottom-footer-contact-us-phone">
                            1-800-4-CANCER
                        </a>
                        <br></br>
                        <a href="mailto:+cdshelpdesk@mail.nih.gov" id="bottom-footer-contact-us-email">
                            cdshelpdesk@mail.nih.gov
                        </a>
                        <br></br>
                        <a href="https://nci.az1.qualtrics.com/jfe/form/SV_aeLLobt6ZeGVn5I" id="bottom-footer-contact-us-site-feedback">
                            Site Feedback
                        </a>
                    </span>

                    <span id="bottom-footer-follow-us-text">Follow Us</span>
                    <span id="bottom-footer-social-media-links">
                        <a href="https://www.instagram.com/nationalcancerinstitute/">
                            <img src={instagram_svg} />
                        </a>
                        <a className="bottom-footer-social-media-imgs" href="https://twitter.com/thenci">
                            <img src={twitter_svg} />
                        </a>
                        <a className="bottom-footer-social-media-imgs" href="https://www.facebook.com/cancer.gov">
                            <img src={facebook_svg} />
                        </a>
                        <a className="bottom-footer-social-media-imgs" href="https://www.youtube.com/NCIgov">
                            <img src={youtube_svg} />
                        </a>
                        <a className="bottom-footer-social-media-imgs" href="https://www.linkedin.com/company/nationalcancerinstitute/">
                            <img src={linkedin_svg} />
                        </a>
                    </span>
                    <span className="bottom-footer-gov-links">
                        <a href="https://www.hhs.gov/">U.S. Department of Health and Human Services</a>
                        <a href="https://www.nih.gov/">National Institutes of Health</a>
                        <a href="https://www.cancer.gov/">National Cancer Institute</a>
                        <a href="https://usa.gov/">USA.gov</a>
                    </span>
                </div>
            )

        }
    }
}

export default BottomFooter;