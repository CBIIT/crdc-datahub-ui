const https = require('https');
const fs = require('fs');

/**
 * Defines the output directory for the data model assets.
 */
const modelDescDir = "./public/models";

// ----------------- Download the ICDC data model assets -----------------
https.get("https://raw.githubusercontent.com/CBIIT/icdc-model-tool/e1f915524a665f33763659d554711d1ccf6ee7b9/model-desc/icdc-model-props.yml", (res) => {
  res.pipe(fs.createWriteStream(`${modelDescDir}/icdc-model-props.yml`));
});
https.get("https://raw.githubusercontent.com/CBIIT/icdc-model-tool/e1f915524a665f33763659d554711d1ccf6ee7b9/model-desc/icdc-model.yml", (res) => {
  res.pipe(fs.createWriteStream(`${modelDescDir}/icdc-model.yml`));
});
https.get("https://raw.githubusercontent.com/CBIIT/icdc-readMe-content/e84fd999c26486bb702010868ea16560d06cb5fb/Data_Model_Navigator_README.md", (res) => {
  res.pipe(fs.createWriteStream(`${modelDescDir}/icdc-model-readme.md`));
});
