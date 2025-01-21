# Development Notes

Here are some notes on the development of the project.

## media.ccc.de API

For implementing the search, the api `https://api.media.ccc.de/public/events/search?q=<SEARCH>`will be used.

You can find the "full" api documentation here: [https://github.com/voc/voctoweb?tab=readme-ov-file#public-json-api](https://github.com/voc/voctoweb?tab=readme-ov-file#public-json-api)

## Wording

Sometimes, the word "event" is used to refer to a talk. This is because the API from media.ccc.de is using the term "event", while I prefer to use "Talk".

## "Branding"

Our main colors are:

- Main: <span style="background-color: #9b69ff; color: white; padding: 2px 4px; border-radius: 8px;" width="10" height="10">#9b69ff</span>
- Secondary: <span style="background-color: #390a96; color: white; padding: 2px 4px; border-radius: 8px;">#390a96</span>

## Why are there so many CI fix commits?

Most of them are due to the fact that I am a bit new to Playwright (E2E-Testing) and also probably because I am doing things more complicated than they have to be.
