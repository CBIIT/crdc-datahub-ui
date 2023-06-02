import React, { FC } from 'react';
import instagram_svg from './images/Instagram.svg';
import twitter_svg from './images/Twitter.svg';
import facebook_svg from './images/Facebook.svg';
import youtube_svg from './images/Youtube.svg';
import linkedin_svg from './images/LinkedIn.svg';
interface bottomFooterProps {
    innerWidth: number;
    contactUsLinks: Array<Array<string>>;
}
class BottomFooter extends React.Component<bottomFooterProps> {

    render() {
        return (
            <div id="bottom-footer">
                <div className="bottom-footer-container">
                    <div id="bottom-footer-header">
                        National Cancer Institute
                        <div id = "bottom-footer-sub-header">
                            at the National Institutes of health
                        </div>
                    </div>
                    <div  id="bottom-footer-contact-us">
                        Contact Us
                        <div id = "bottom-footer-contact-links">
                            {this.props.contactUsLinks.map(temp =>
                                <a href = {temp[0]}>{temp[1]}</a>
                            )}
                        </div>
                    </div>
                    <div className = "break"></div>
                    <div id="bottom-footer-follow-us">
                        Follow Us
                        <div id = "bottom-footer-follow-us-links">
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
                        </div>
                    </div>
                    <div id="bottom-footer-gov-links">
                        <a href="https://www.hhs.gov/">U.S. Department of Health and Human Services</a>
                        <a href="https://www.nih.gov/">National Institutes of Health</a>
                        <a href="https://www.cancer.gov/">National Cancer Institute</a>
                        <a href="https://usa.gov/">USA.gov</a>
                    </div>
                </div>
            </div>
        )
    }
}

export default BottomFooter;