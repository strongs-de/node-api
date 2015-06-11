[![Build Status](https://travis-ci.org/strongs-de/node-api.svg?branch=master)](https://travis-ci.org/strongs-de/node-api) [![Dependency Status](https://david-dm.org/strongs-de/node-api.svg)](https://david-dm.org/strongs-de/node-api)

# Getting started
- `git clone` this repository into a directory of your choice
- Navigate to `node-api` directory
- If you want, create a virtualenv
- `npm i -g coffee-script`
- `npm install`
- Until now you have to download a already generated sqlite database:
  - Download the database from https://github.com/strongs-de/strongs/releases
  - Save it into the directory where the `index.coffee` file is located
  - Rename it to `strongs_dev.sqlite`
- `coffee index.coffee`

# General information
In order to continue feature development and don't lose backward compatibility
all api calls should be used with a version number.

# API version 1
1. [List all available translations](#list-translations)
2. [Get bible text](#get-bible-text)
3. [Search within bibles](#search-within-bibles)
4. [Get greek informations](#get-greek-informations)
 1. [Strong number statistics](#strong-number-statistics)
 2. [Grammar details](#grammar-details)

## List translations

    GET /translations

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

    GET /bible/ELB1905STR,LUTH1912/30/1

The result is a JSON array with the bible text. If multiple translations are requested, the verses are sorted in alphabetical order of the translation identifier and the vers number. The result looks like:

```javascript
{
  "translations": [
    {
      "translation": {
        "identifier": "LUTH1912",
        "name": "Luther 1912"
      },
      "book": {
        "nr": 1,
        "name": "1.Mose",
        "shortName": "1Mos"
      }
      "chapter": 30,
      "verses": [
        {
          "versNumber":1,
          "text":"Text of vers 1",
        },
        //...
      ]
    },
    // next translation object ...
  ]
}
```

## Search within bibles

    GET /search/:translations/:searchString
    GET /search/:translations/:bookNr/:searchString
    GET /search/:translations/:bookNr/:chapterNr/:searchString

This function searches in all given translations (comma separated translation identifier) for the given `searchString`. You can optionally specify a book number and chapter number if you wish.

The response is nearly the same as in the [get bible text request](#get-bible-text):
```javascript
{
  "translations": [
    {
      "translation": {
        "identifier": "LUTH1912",
        "name": "Luther 1912"
      },
      "verses": [
        {
          "book": {
            "nr": 1,
            "name": "1.Mose",
            "shortName": "1Mos"
          }
          "chapter": 30,
          "versNumber":1,
          "text":"Text of vers 1",
        },
        //...
      ]
    },
    // next translation object ...
  ]
}
```


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

### Grammar details

    GET /strong/:translation/:bookNr/:chapterNr/:versNr/:strongNr

You can request detailed informations about a specific word in a bible vers. There is only one limitation. If the strong number exists multiple times in this vers, there is returned a JSON object for each one of the occurences. You don't know for sure which one matches to which word in this vers.

The result looks like this:

```javascript
[
  {
    translationIdentifier: 'LUTH1912',
    book: 45
    chapter: 1,
    vers: 1,
    strongNr: 2034,
    greek: '[the greek word]',
    pronounciation: '[how to pronounce it]',
    grammar: '[grammar identifier]'
  },
  // ...
]
```

The grammar identifier is correlating with Robertsons Morphological Analysis Codes.
