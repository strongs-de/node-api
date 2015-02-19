# Quick start
- If you want, create a virtualenv
- `npm i -g coffee-script`
- `npm install`
- Until now you have to download a already generated sqlite database:
  - Download the database from https://github.com/strongs-de/strongs/releases
  - Save it into the directory where the `index.coffee` file is located
  - Rename it to `strongs_dev.sqlite`
- `coffee index.coffee`

# Implemented Api functions:
## Get all available translations

**`/bible/get/translations`**
This returns a list of all translations that are currently stored in the database.

## Get bible text
**`/bible/get/:translations/:bookNr/:chapterNr`**

This function returns the requested bible text for all translations you specified. The translations needs to be specified by the translation identifier. You can choose multiple translations by concatenating them with a comma. Here's an example:

    /bible/get/ELB1905STR,LUTH1912/30/1

## Search within bibles
**`/bible/search/:translations/(:bookNr/)(:chapterNr/)/:searchString`**

This function searches in all given translations (comma separated translation identifier) for the given searchString. You can optionally specify a book number and chapter number if you wish to.
