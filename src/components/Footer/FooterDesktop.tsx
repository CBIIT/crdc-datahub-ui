import React, { useState, useRef } from "react";
import { styled } from "@mui/material";
import FooterData from "../../config/globalFooterData";

const FooterStyled = styled("div")({
  backgroundColor: "#1B496E",
  borderTop: "1px solid #6C727B",
  bottom: 0,
  width: "100%",
  zIndex: 10,
  position: "relative",
});

const FooterContainer = styled("div")({
  padding: "2rem",
  maxWidth: "1400px",
  marginLeft: "auto",
  marginRight: "auto",
  display: "flex",
  justifyContent: "space-between",
});

const FooterEmailSignupContainer = styled("form")({
  width: "33.3%",
  "& .signUpTitle": {
    fontFamily: "poppins",
    fontWeight: 700,
    fontSize: "22.88px",
    lineHeight: "34px",
    color: "#FFFFFF",
    marginBottom: "1rem",
  },
  "& .enterTitle": {
    fontFamily: "Open Sans",
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#FFFFFF",
    marginBottom: "10px",
  },
  "& .signUpInputBox": {
    width: "100%",
    height: "47px",
    fontSize: "25px",
    paddingLeft: "8px",
    marginTop: "4px",
    "&:focus": {
      outline: "0.25rem solid #2491ff",
    },
  },
  "& .signUpButton": {
    background: "#FACE00",
    borderRadius: "8px",
    border: 0,
    padding: "9px 16px",
    fontFamily: "Open Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#14315C",
    marginTop: "18px",
    "&:hover": {
      cursor: "pointer",
    },
  },
});

const FooterLinksContainer = styled("div")({
  width: "66.7%",
  display: "grid",
  gridTemplateColumns: "repeat(3, 33%)",
  "& .footItem": {
    marginBottom: "24px",
  },
  "& .footItemTitle": {
    fontFamily: "Open Sans",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "22px",
    marginBottom: "10px",
  },
  "& .footItemSubtitle": {
    marginBottom: "10px",
    maxWidth: "290px",
  },
  "& .footItemLink": {
    fontFamily: "Open Sans",
    color: "#FFFFFF",
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "22px",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

const BottomFooter = styled("div")({
  background: "#14315C",
  "& span": {
    display: "block",
  },
  "& .bottom-footer-container": {
    display: "flex",
    flexFlow: "wrap",
    justifyContent: "space-between",
    maxWidth: "1400px",
    marginLeft: "auto",
    marginRight: "auto",
    height: "fit-content",
    paddingTop: "1.25rem",
    paddingBottom: "1.25rem",
    paddingLeft: "2rem",
    paddingRight: "2rem",
  },
  "& .break": {
    order: 2,
    width: "100%",
    flexBasis: "100%",
    height: "2rem",
    margin: 0,
    border: 0,
  },
  "& .logoText": {
    textDecoration: "none",
  },
  "& .logoUpperText": {
    fontFamily: "poppins",
    fontWeight: 700,
    fontSize: "24.96px",
    lineHeight: "37px",
    color: "#FFFFFF",
  },
  "& .logoLowerText": {
    fontFamily: "poppins",
    fontWeight: 400,
    fontSize: "18.72px",
    color: "#FFFFFF",
  },
  "& #bottom-footer-contact-us": {
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "22.88px",
    lineHeight: "34px",
    textAlign: "right",
    color: "#FFFFFF",
    order: 1,
  },
  "& #bottom-footer-contact-links": {
    fontFamily: "Open Sans",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#FFFFFF",
    marginTop: "0.25rem",
    "& a": {
      textDecoration: "none",
      color: "#FFFFFF",
      marginLeft: "1rem",
    },
  },
  "& #bottom-footer-follow-us": {
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: 700,
    fontSize: "22.88px",
    lineHeight: "34px",
    color: "#FFFFFF",
    order: 3,
  },
  "& #bottom-footer-follow-us-links": {
    marginTop: "1rem",
  },
  "& .bottom-footer-social-media-imgs": {
    marginLeft: "10px",
  },
  "& #bottom-footer-gov-links": {
    order: 4,
  },
  "& #bottom-footer-gov-links a": {
    textDecoration: "none",
    display: "block",
    fontFamily: "Open Sans",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "1.6",
    textAlign: "right",
    color: "#FFFFFF",
  },
});

const FooterDesktop = () => {
  const [emailContent, setEmailContent] = useState("");
  const emailForm = useRef<HTMLFormElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  function validateEmail(email) {
    const reg = /^[A-Za-z0-9]+([_.-][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/;
    return reg.test(email);
  }

  const handleSubmit = (e) => {
    emailForm.current.reportValidity();
    if (!validateEmail(emailContent)) {
      emailInput.current.setCustomValidity("Please enter valid email");
      e.preventDefault();
    } else {
      emailInput.current.setCustomValidity("");
      emailForm.current.submit();
    }
  };

  const handleChange = (e) => {
    setEmailContent(e.target.value);
  };
  return (
    <>
      <FooterStyled role="contentinfo">
        <FooterContainer>
          <FooterLinksContainer>
            {FooterData.link_sections.map((linkItem, linkidx) => {
              const linkkey = `link_${linkidx}`;
              return (
                <div className="footItem" key={linkkey}>
                  <div className="footItemTitle">{linkItem.title}</div>
                  {linkItem.items.map((item, itemidx) => {
                    const itemkey = `item_${itemidx}`;
                    return (
                      <div className="footItemSubtitle" key={itemkey}>
                        {item.link.includes("http") ? (
                          <a
                            className="footItemLink"
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <a className="footItemLink" href={item.link}>
                            {item.text}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </FooterLinksContainer>
          <FooterEmailSignupContainer
            onSubmit={handleSubmit}
            ref={emailForm}
            action="https://public.govdelivery.com/accounts/USNIHNCI/subscribers/qualify"
            method="post"
            target="_blank"
            id="signup"
            noValidate
          >
            <input type="hidden" name="topic_id" id="topic_id" value="USNIHNCI_223" />
            <div className="signUpTitle">Sign up for email updates</div>
            <div className="enterTitle">
              <label htmlFor="email">
                Sign up for the newsletter
                <input
                  ref={emailInput}
                  id="email"
                  type="email"
                  name="email"
                  className="signUpInputBox"
                  value={emailContent}
                  onChange={(e) => handleChange(e)}
                />
              </label>
            </div>
            <button type="submit" className="signUpButton">
              Sign up
            </button>
          </FooterEmailSignupContainer>
        </FooterContainer>
      </FooterStyled>
      <BottomFooter>
        <div className="bottom-footer-container">
          <div id="bottom-footer-header">
            <a
              className="logoText"
              href="https://www.cancer.gov"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="logoUpperText">National Cancer Institute</div>
              <div className="logoLowerText">at the National Institutes of Health</div>
            </a>
          </div>
          <div id="bottom-footer-contact-us">
            Contact Us
            <div id="bottom-footer-contact-links">
              {FooterData.contact_links.map((contactItem, contactidx) => {
                const contactkey = `contact_${contactidx}`;
                return contactItem.link.includes("http") ? (
                  <a
                    key={contactkey}
                    href={contactItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contactItem.text}
                  </a>
                ) : (
                  <a key={contactkey} href={contactItem.link}>
                    {contactItem.text}
                  </a>
                );
              })}
            </div>
          </div>
          <div className="break" />
          <div id="bottom-footer-follow-us">
            Follow Us
            <div id="bottom-footer-follow-us-links">
              {FooterData.followUs_links.map((followItem, followidx) => {
                const followkey = `follow_${followidx}`;
                return (
                  <a
                    key={followkey}
                    className={followidx !== 0 ? "bottom-footer-social-media-imgs" : ""}
                    href={followItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={followItem.img} alt={followItem.description} />
                  </a>
                );
              })}
            </div>
          </div>
          <div id="bottom-footer-gov-links">
            {FooterData.global_footer_links.map((linkItem, idx) => {
              const linkitemkey = `linkitem_${idx}`;
              return (
                <a key={linkitemkey} href={linkItem.link} target="_blank" rel="noopener noreferrer">
                  {linkItem.text}
                </a>
              );
            })}
          </div>
        </div>
      </BottomFooter>
    </>
  );
};

export default FooterDesktop;
