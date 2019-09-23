# gatsby-source-gcp-storage
A Gatsby source plugin for sourcing data into your Gatsby application from file in a GCP Storage bucket.

The plugin creates `GCPFile` nodes from files in GCP Storage. It then uses the `gatsby-source-filesystem` to download a local copy of the files from GCP, and generate `File` nodes. The various "transformer" plugins can transform the File nodes into various other types of data e.g. `gatsby-transformer-json` transforms JSON files into JSON data nodes and `gatsby-transform-remark` transforms markdown files into `MarkdownRemark` nodes from which you can query and HTML representation of the markdown.

## Install
npm: `npm install --save gatsby-source-gcp-storage`

## How to use


## Options

`tokenPath`

`bucket`

`directory`

`ignore`

`How to query`