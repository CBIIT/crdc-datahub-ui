/* eslint-disable react/jsx-one-expression-per-line */
import React, { FC, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import styled from '@emotion/styled';
import staticContent from '../../config/StaticPageContentConfig';

const StyledContainer = styled.div`
    margin: 40px auto;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    font-family: "Nunito Sans",sans-serif;
    h1 {
      font-family: "Nunito Sans",sans-serif;
      margin-bottom: 45px;
      font-weight: normal;
      font-size: 40px;
    }
    .count {
      font-family: "Nunito Sans",sans-serif;
      font-size: 32px;
      font-weight: normal;
      margin-top: 0px;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: normal;
      line-height: inherit;
      color: #1779ba;
      text-decoration: none;
      cursor: pointer;
      background-color: transparent;
      font-family: "Nunito Sans",sans-serif;
    }
    .description {
      font-family: "Lato",sans-serif;
      font-size: 16px;
      font-weight: 400;
      margin-bottom: 10px;
      margin-top: 10px;
    }
    .linkText {
      color: #757575;
      font-size: 18px;
      text-decoration: none;
      font-family: "Lato",sans-serif;
      font-weight: 400;
    }
    .searchResultContainer {
      margin-bottom:30px;
    }
    .noResults {
      font-family: "Nunito Sans",sans-serif;
      color: #0772B6;
      font-size: 20px;
      font-weight: 600;
    }
    .middleSearchBar{
      background: #F0F0F0;
      border-radius: 5px;
      padding: 35px 30px 30px;
      margin-bottom: 50px;
    }
    .searchButton {
      font-family: "Lato",sans-serif;
      font-size: 16px;
      font-weight: 500;
      line-height: 2.625;
      padding: 0 34px;
      text-align: center;
      color: #FFFFFF;
      background: #007BBD;
      background-image: linear-gradient(to right, #6C4DBF, #5062C4, #2E88CA);
      background-color: #6C4DBF;
      background-size: 117px;
      width:  117.031px
    }

    .searchButton:hover {
      cursor: pointer;
      background: #004971;
    }
`;

const SearchInput = styled.input`
  font-family: Inter, sans-serif;
  font-weight: normal;
  color: #1b1b1b;
  width: 100%;
  height: 2.4375rem;
  margin: 0 0 1rem;
  padding: 0.5rem;
  border: 1px solid #cacaca;
  border-radius: 20px;
  transition: box-shadow 0.5s,border-color 0.25s ease-in-out;
`;
type SearchResult = {
  title: string;
  text: string;
  link: string;
};
const helper: (keyword: string) => SearchResult[] = (keyword) => {
  const result = [];
  const keys = Object.keys(staticContent);
  for (let i = 0; i < keys.length; i++) {
    const listOfTextInCurrentKey:string[] = Object.values(staticContent[keys[i]].pageContent);
    for (let j = 0; j < listOfTextInCurrentKey.length; j++) {
      if (listOfTextInCurrentKey[j].toLowerCase().includes(keyword.toLowerCase())) {
        let newText = listOfTextInCurrentKey[j];
        // Set length here
        if (newText.length > 300) {
          newText = newText.substring(newText.toLowerCase().indexOf(keyword) - 100, newText.toLowerCase().indexOf(keyword) + 200).concat("...");
        }
        if (!newText.startsWith(listOfTextInCurrentKey[j].substring(0, 10))) {
          newText = "...".concat(newText);
        }
        result.push({ title: keys[i], text: newText, link: staticContent[keys[i]].link });
        break;
      }
    }
  }
  return result;
};
const boldKeyword = (text, keyphrase) => {
  const parts = text.split(new RegExp(`(${keyphrase})`, 'gi'));
  const highlightedParts = parts.map((part) => {
    if (part.toLowerCase() === keyphrase.toLowerCase()) {
      return <strong>{part}</strong>;
    }
    return part;
  });

  return <span>{highlightedParts}</span>;
};

const Search: FC = () => {
    const { keyword } = useParams();
    const navigate = useNavigate();
    const [localText, setLocalText] = useState("");
    const searchResults: SearchResult[] = helper(keyword);
    const handleTextInputChange = (event) => {
      const text = event.target.value;
      setLocalText(text);
    };
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        navigate(`/sitesearch/${localText.trim()}`);
        setLocalText("");
      }
    };
    const handleSearch = () => {
      navigate(`/sitesearch/${localText.trim()}`);
      setLocalText("");
    };
    return (
      <StyledContainer>
        <h1>CRDC Search Results</h1>
        <div className="middleSearchBar">
          <SearchInput id="header-search-bar" type="search" value={localText} onChange={handleTextInputChange} onKeyDown={handleKeyPress} />
          <div role="button" tabIndex={0} className="searchButton" onKeyDown={handleKeyPress} onClick={handleSearch}>Search</div>
        </div>
        {searchResults.length === 0 ? <div className="noResults"> Your search yielded no results.</div>
        : (
          <div>
            <pre className="count">
              {searchResults.length} results for: <b>{keyword}</b>
            </pre>
            {searchResults.map(({ title, text, link }) => (
              <div className="searchResultContainer">
                <a href="/" className="title">{title}</a>
                <div className="description">
                  {boldKeyword(text, keyword)}
                </div>
                <div className="linkText">{link}</div>
              </div>
          ))}
          </div>
) }

      </StyledContainer>
    );
};

export default Search;
