import React, { FC } from 'react';

class TopFooter extends React.Component {

    render() {
        return (
            <div id="top-footer">
                <div className="top-footer-container">
                <div className="top-footer-item" id="top-footer-about-and-policies-sections-mobile">
                        <div id="top-footer-about-section">
                            <button className='top-footer-about-and-policies-header'>About</button>
                            <a href = "" >About CCDI Hub</a>
                            <a href = "">About CCDI</a>
                            <a href = "www.google.com">Contact CCDI Hub</a>
                        </div>
                        <div id="top-footer-policies-section">
                            <span className='top-footer-about-and-policies-header'>Policies</span>
                            <a href = "https://www.cancer.gov/policies/accessibility" >Accessibility</a>
                            <a href = "https://www.cancer.gov/policies/foia">FOIA</a>
                            <a href = "https://www.cancer.gov/policies/privacy-security">Privacy & Security</a>
                            <a href = "https://www.cancer.gov/policies/disclaimer">Disclaimers</a>
                            <a href = "https://www.hhs.gov/vulnerability-disclosure-policy/index.html">Vulnerability Disclosure</a>
                        </div>
                    </div>
                    <div className="top-footer-item" id="top-footer-about-and-policies-sections">
                        <div id="top-footer-about-section">
                            <span className='top-footer-about-and-policies-header'>About</span>
                            <a href = "" >About CCDI Hub</a>
                            <a href = "">About CCDI</a>
                            <a href = "www.google.com">Contact CCDI Hub</a>
                        </div>
                        <div id="top-footer-policies-section">
                            <span className='top-footer-about-and-policies-header'>Policies</span>
                            <a href = "https://www.cancer.gov/policies/accessibility" >Accessibility</a>
                            <a href = "https://www.cancer.gov/policies/foia">FOIA</a>
                            <a href = "https://www.cancer.gov/policies/privacy-security">Privacy & Security</a>
                            <a href = "https://www.cancer.gov/policies/disclaimer">Disclaimers</a>
                            <a href = "https://www.hhs.gov/vulnerability-disclosure-policy/index.html">Vulnerability Disclosure</a>
                        </div>
                    </div>
                    <hr></hr>
                    <div className="top-footer-item" id="top-footer-sign-up-section">
                        <span id = "top-footer-sign-up-text">Sign up for email updates</span>
                        <span id = "top-footer-enter-email-address-text">Enter your email address</span>
                        <input id = "top-footer-email-input" type='email'></input>
                        <button id = "top-footer-email-button" type='submit'>Sign up</button>
                    </div>
                </div>
            </div>
        )

    }
}

export default TopFooter;