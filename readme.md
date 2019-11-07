# gatsby-source-gcp-storage
A Gatsby source plugin for sourcing data into your Gatsby application from file in a GCP Storage bucket.

[![](https://img.shields.io/npm/v/gatsby-source-gcp-storage.svg)](https://www.npmjs.com/package/gatsby-source-gcp-storage)
[![](https://img.shields.io/npm/dm/gatsby-source-gcp-storage.svg)](https://www.npmjs.com/package/gatsby-source-gcp-storage)
[![CircleCI](https://circleci.com/gh/TheMagoo73/gatsby-source-gcp-storage/tree/master.svg?style=svg)](https://circleci.com/gh/TheMagoo73/gatsby-source-gcp-storage/tree/master)
[![codecov](https://codecov.io/gh/TheMagoo73/gatsby-source-gcp-storage/branch/master/graph/badge.svg)](https://codecov.io/gh/TheMagoo73/gatsby-source-gcp-storage)
[![david](https://david-dm.org/themagoo73/gatsby-source-gcp-storage.svg)]()

The plugin creates `GCPFile` nodes from files in GCP Storage. It then uses the `gatsby-source-filesystem` to download a local copy of the files from GCP, and generate `File` nodes. The various "transformer" plugins can transform the File nodes into various other types of data e.g. `gatsby-transformer-json` transforms JSON files into JSON data nodes and `gatsby-transform-remark` transforms markdown files into `MarkdownRemark` nodes from which you can query and HTML representation of the markdown.

## Warnings!

This is very much an *alpha* project at the moment, so handle with care!

There are no unit tests, and it's 'options' should be considered volatile for the time being. It doesn't work well with `gatsby develop` as it doesn't spot changes to GCP storage buckets to trigger a refresh. You'll probably need to use `gatsby clean` between runs, as it's caching isn't great. Finally, it doesn't support `ignore` globs at the moment (work in progress), so it'll pull *every* file from the bucket it's pointed at.

## Install
npm: `npm install --save gatsby-source-gcp-storage`

## How to use

## Options

`tokenPath` Path to a GCP JSON token for a service account with access to the storage bucket to be used.

`bucket` The name of the bucket to query

`directory` The directory in the bucket to query

`ignore` Not currently supported

# How to query

For now, as this is an alpha, it's best to use the GraphQL Explorer to see what's produced as things are potentially in a state of flux.