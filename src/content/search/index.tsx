/* eslint-disable react/jsx-one-expression-per-line */
import React, { FC } from 'react';
import { useParams } from "react-router-dom";
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
    const searchResults: SearchResult[] = helper(keyword);

    return (
      <StyledContainer>
        <h1>CRDC Search Results</h1>
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
