# Getting started
- If you want, create a virtualenv
- `npm i -g coffee-script`
- `npm install`
- Until now you have to download a already generated sqlite database:
  - Download the database from https://github.com/strongs-de/strongs/releases
  - Save it into the directory where the `index.coffee` file is located
  - Rename it to `strongs_dev.sqlite`
- `coffee index.coffee`

# API version 1.0
1. [Overview](#overview)
1. REST API
  1. [List all available translations](#list-translations)
  1. [Get bible text](#get-bible-text)
  1. [Search within bibles](#search-within-bibles)
  1. [Get greek informations](#get-greek-informations)
    1. [Strong number statistics](#strong-number-statistics)

## Overview
This REST Api responds always with a JSON return type.

## List translations

    GET /bible/translations

This returns a list of all translations that are currently stored in the database. Here is an example response:

```javascript
[
  {"identifier":"ELB1905STR","language":"GER","name":"Elberfelder 1905"},
  {"identifier":"ILGRDE","language":"GER","name":"Interlinearübersetzung"},
  {"identifier":"LUTH1912","language":"GER","name":"Luther 1912"},
  {"identifier":"SCH1951","language":"GER","name":"Schlachter Bibel 1951 with Strong"}
]
```

## Get bible text

    GET /bible/:translations/:bookNr/:chapterNr

This function returns the requested bible text for all translations you specified. The translations needs to be specified by the translation identifier. You can choose multiple translations by concatenating them with a comma. Here's an example request:

    GET /bible/get/ELB1905STR,LUTH1912/30/1

The result is a JSON array with the bible text. If multiple translations are requested, the verses are sorted in alphabetical order of the translation identifier and the vers number. The result looks like:

```javascript
[
  {
    "translation": {
      "identifier":"LUTH1912",
      "name":"Luther 1912"
    },
    "versNumber":1,
    "text":"Text of vers 1",
    "chapter":30,
    "book": {
      "nr":1,
      "name":"1.Mose",
      "shortName":"1Mos"
    }
  },
  {
    "translation": {
      "identifier":"LUTH1912",
      "name":"Luther 1912"
    },
    "versNumber":2,
    "text":"Ttext of vers 2",
    "chapter":30,
    "book": {
      "nr":1,
      "name":"1.Mose",
      "shortName":"1Mos"
    }
  }
]
```

## Search within bibles

    GET /bible/search/:translations/:searchString
    GET /bible/search/:translations/:bookNr/:searchString
    GET /bible/search/:translations/:bookNr/:chapterNr/:searchString

This function searches in all given translations (comma separated translation identifier) for the given `searchString`. You can optionally specify a book number and chapter number if you wish.

The response is the same as in the [get bible text request](#get-bible-text).

## Get greek informations
There are multiple methods to get informations about the greek text.

### Strong number statistics

    GET /strong/:strongNr

You can request informations about a single strong number without the context of a bible vers. That means, you cannot get any grammar informations, but only the statistical informations about this greek word. This includes, how often is this word used all over in the new / old testament, how often is it used in a specific bible book and how it is translated in different bible translations.

This returns the following information JSON object:

```javascript
{
  overallUsageCount: 123,
  bookUsageCount: [
    {
      bookNr: 1,
      usageCount: 12
    },
    {
      bookNr: 2,
      usageCount: 23
    }
  ],
  translationVariants: [
    {
      translationIdentifier: 'LUTH1912',
      variants: [
        'Variant 1',
        'Variant 2',
        // ...
      ]
  ]
}
```




















