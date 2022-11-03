<p align="center"><img width="800px" src="https://i.imgur.com/3ny3m8z.jpg" /></p>
<h3 align="center">Ryuko</h3>
<h4 align="center">A Utility bot with Verification, Music, Tickets, a Starboard, and more.
</h4>
<p align="center" href="https://google.com"><img src="https://github.com/jacany/ryuko/actions/workflows/ci.yml/badge.svg?branch=master&event=push" /></p>

---

⚠️THE BELOW INSTRUCTIONS ARE OUTDATED, AND WILL NOT BE UPDATED SINCE THIS PROJECT IS BEING ARCHIVED FOR POSTERITY PURPOSES⚠️

# Usage

To use the bot, you will need some prerequsites:

-   A MariaDB Server
-   A Lavalink Node
-   A Redis Server
-   [Yarn](https://yarnpkg.com) installed on the machine it is running on.

Once you have all of these, rename `config.template.json` to `config.json`, and fill it out.

# Running

Running Ryuko is a breeze!
If you wan to normally start the bot, make sure you [fully built it](#building) (building everything). Then run `yarn start`

To run it in developer mode (restarts on file change) run `yarn dev` for the bot, and `yarn watch` for stylesheets.

# Building

Building is handled through the `build.mjs` script at the root directory. It uses google's [zx](https://github.com/google/zx) library, so some aspects of the script won't make sense unless you look at zx's documentation.

Below is a table of all build actions, and their commands.

<!-- prettier-ignore -->
Build Action | Linux/MacOS | Windows
------------ | ------------- | -------------
Everything | `./build.mjs` or `./build.mjs all` | `yarn zx build.mjs` or `yarn zx build.mjs all`
Bot | `./build.mjs bot` | `yarn zx build.mjs bot`
Website | `./build.mjs site` | `yarn zx build.mjs site`
