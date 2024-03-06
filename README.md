# Slack Jukebox

This is a Slack bot for managing an ongoing playlist for a Slack channel.

You can use a shortcut to create a playlist in a channel, and from that point on other users can add
items to that playlist. Folk adding tracks from Slack use the playlist creator's credentials, so they 
don't need a Spotify subscription.

# Use

## Create a Jukebox Playlist
<TODO: I'm probably going to edit this live on git and use thier file hosting for images?>

# Setup

## Create a Slack App
Using the included `slack-manifest.json` file, create a Slack App from Manifest. This'll do most of the heavy
lifting for you.

In `Basic Information` -> `Install your app`, click `Install your app to the workspace`. 

Scroll down `Basic Information` to `App-Level Tokens`. You'll need to create an App level token with the
`connections:write` scope to use Socket Mode.

Make a note of the:

- `SLACK_SIGNING_SECRET` - Basic Information -> App Credentials -> Signing Secret
- `SLACK_APP_TOKEN` - As created above
- `SLACK_BOT_TOKEN` - OAuth & Permissions -> OAuth Tokens for Your Workspace - Bot User OAuth Token

## Create a Spotify App
In [Spotify](https://developer.spotify.com/) create a new app. Scope it to the Web API, and add some redirect URIs that point back
to wherever you're hosting this.

Make a note of the:

- `SPOTIFY_CLIENT_ID` - Basic Information - Client ID
- `SPOTIFY_REDIRECT_URI` - An exact match to what you put in the redirect field.

## Finally...
Pick a `PORT` to run the thing on. It'll default to `:3000` if you don't, but it's there if you need it.

### Next Up
- Ideally the login page wouldn't just sorta hang there. Either self close, or redirect to the Slack channel
- Hopefully one day Spotify releases the ability to start a Jam from the API; that way the owner can
start a Jam straight from Slack
- We could probably keep a track of Slack users -> Tracks added for blame/accolades after the fact
  - But for now, you can see them add it in the channel so that's probably fine!