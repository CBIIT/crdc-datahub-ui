import React, { FC } from 'react';
import content from '../../config/StaticPageContentConfig';

const { pageContent } = content["Other Resources"];
const OtherResources: FC = () => (
  <>
    <h1>{pageContent.header}</h1>
    <div>{pageContent.text}</div>
  </>
);

export default OtherResources;
