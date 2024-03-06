# Slack Jukebox

This is a Slack bot for managing an ongoing playlist for a Slack channel.

You can use a shortcut to create a playlist in a channel, and from that point on other users can add
items to that playlist. Folk adding tracks from Slack use the playlist creator's credentials, so they 
don't need a Spotify subscription.

# Use

## Create a Jukebox Playlist
Use the Shortcut to create a Jam playlist.
![image](https://github.com/threefjefff/SlackJukebox/assets/1656602/83f20f57-06ea-406e-b228-51248e7e1c19)

This'll open a modal instructing you to login via Spotify:
(For the technically minded, this is using Auth Code w/PKCE flow)
![image](https://github.com/threefjefff/SlackJukebox/assets/1656602/1b1bef9d-d092-4235-9708-8b8ddfc1cc1c)
![image](https://github.com/threefjefff/SlackJukebox/assets/1656602/0632dc97-a5d0-4ddc-bd39-b8189f9831e4)

Once you've agreed, you'll hit a blank screen (sorry) and the Modal in Slack will have updated, 
and you can fill in some info about the playlist you want to create
![image](https://github.com/threefjefff/SlackJukebox/assets/1656602/93389119-0f9b-46bf-9515-c7a539bf1a52)

A message linking you to the playlist will be posted by the bot, indicating that you're ready to go!
![image](https://github.com/threefjefff/SlackJukebox/assets/1656602/06acd6d8-f78e-4e13-abaf-85679b6300d1)

## Adding to the current Jukebox
![image](https://github.com/threefjefff/SlackJukebox/assets/1656602/16031596-ded8-482a-9e8c-8c45e1f45507)

Or, you can search from Slack, and choose to add a result from there:
![image](https://github.com/threefjefff/SlackJukebox/assets/1656602/382ed034-100b-4876-a782-bc4a6a8550ba)


Either way, when we've got a track added, I'll let you know!
![image](https://github.com/threefjefff/SlackJukebox/assets/1656602/7580a9d8-dbb9-4d6c-84bd-396f5003f5f1)


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
