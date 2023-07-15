# guesswhotv

GuessWhoTV is an online, TV-themed version of the [classic board game “Guess Who?”](https://en.wikipedia.org/wiki/Guess_Who%3F), built with Remix.

<p align="center">
  <img height="300" src="https://guesswho.tv/images/gameplay.png" alt="a screenshot presenting the gameplay of Guess Who TV.">
</p>

## how to play

1. Find a friend (or enemy) to play with
2. Pick a TV show
3. Play Guess Who!

## data source

[TVMaze API](https://www.tvmaze.com/api)

## how it works

### search

simple text search using [tvmaze/show-search](https://www.tvmaze.com/api#show-search)

### main cast

main cast of a given TV show is gathered using [tvmaze/show-cast](https://www.tvmaze.com/api#show-cast).
if this returns less than 6 characters, guest crews per episode will be queried from [tvmaze/show-seasons](https://www.tvmaze.com/api#show-seasons) and [tvmaze/season-episodes](https://www.tvmaze.com/api#season-seasons). if a guest crew member appears at least 3 times throughout all seasons, they get included in the character set. this is repeated until a set of 6 characters is achieved.

### picking custom character set

at the start of each game, an option to `"change characters"` is provided.
this opens up a list of characters split by main cast, and then guest crew members per season
(guest crew who appear less than 3 times overall will also be excluded here).

once a custom set of characters is selected using the checkboxes on the page, a base64-encoded list of the character IDs selected gets injected into the URL, so that it can easily be shared across devices.
