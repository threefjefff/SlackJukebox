import {Playlist, SpotifyApi, TrackItem} from "@spotify/web-api-ts-sdk";
import {FetchChannelPlaylist} from "./spotify_slack_link";
import {SayFn} from "@slack/bolt";

const slackMessageRegex = /<@[A-Z0-9]+>\s(.*)/
export const spotifyLinkRegex = /<https:\/\/open.spotify.com\/(artist|track|album|playlist)\/(\S*)\?.*(>|\|.*>)\s*/;
export const FindMusic = async (client: SpotifyApi, playlist: Playlist<TrackItem>, fullMessage: string, threadId: string, say: SayFn): Promise<void> => {
    //Strip out the user info. We don't care.
    const fullMessageMatch = slackMessageRegex.exec(fullMessage);
    let matchText = '';
    if(fullMessageMatch === null){
        matchText = fullMessage;
    } else{
        matchText = fullMessageMatch[1];
    }
    //Contains a link?
    const linked = spotifyLinkRegex.exec(matchText);
    console.log(matchText)

    if(linked !== null){
        //Yep, there's a link in there, possibly multiple but we'll just grab the first
        const type = linked[1];
        const spotifyId = linked[2];
        if (type !== "track") {
            await say({
                thread_ts: threadId,
                text: `You're going to have to be more specific! Try linking a track from that ${type}`,
                mrkdwn: true
            });
        } else {
            const track = await client.tracks.get(spotifyId);
            await addTrack(client, playlist.id, track.uri);
            await say({
                thread_ts: threadId,
                text: `Added!`,
                mrkdwn: true
            });
        }
        return;
    }

    const results = await client.search(matchText, ['track'], undefined, 5);
    const blocks = results.tracks?.items.flatMap(track => {
        const track_name = track.name;
        const artist = track.artists[0].name
        const album = track.album.name
        const track_spotify_uri = track.uri;
        const album_artwork_uri = track.album.images[0].url
        return buildBlock(track_name, artist, album, album_artwork_uri, track_spotify_uri)
    });
    await say({
        thread_ts: threadId,
        blocks
    })
}

export const addTrack = async (client: SpotifyApi, playlistId: string, spotifyUri: string) => {
    await client.playlists.addItemsToPlaylist(playlistId, [spotifyUri])
}

const buildBlock = (title: string, artist: string, album: string, album_artwork: string, spotify_uri: string) => {
    return [
        {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": `Title: ${title}\nArtist: ${artist}\n Album: ${album}`
            },
            "accessory": {
                "type": "image",
                "image_url": album_artwork,
                "alt_text": `Album: ${album}`
            }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Add to Jam",
                        "emoji": true
                    },
                    "value": spotify_uri,
                    "action_id": "add-track"
                }
            ]
        }
    ]
}