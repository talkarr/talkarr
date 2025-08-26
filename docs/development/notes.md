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
- Secondary: <span style="background-color: #5710e6; color: white; padding: 2px 4px; border-radius: 8px;">#5710e6</span>

## Why are there so many CI fix commits?

Most of them are due to the fact that I am a bit new to Playwright (E2E-Testing) and also probably because I am doing things more complicated than they have to be.

## Getting the minimum engine version

```bash
npx ls-engines --mode actual --save
```

## Using the actions/labeler action

The `actions/labeler` action is used to automatically add labels to pull requests. The configuration is stored in `.github/labeler.yml`.

You can find the documentation here: [actions/labeler](https://github.com/actions/labeler)

## Creating a release

Run the following command:

```bash
yarn version --minor # or --patch or --major
```

This will then create a commit "Publish Talkarr vX.Y.Z" and a tag "vX.Y.Z".
These can be pushed to the remote repository with:

```bash
git push --follow-tags
```

After the CI finishes, a new release will be created automatically.
It will not be published automatically, but set to "draft" so that you can check it.

[Link for quick access to releases](https://github.com/talkarr/talkarr/releases)

After that, you can just publish it and that's it.
