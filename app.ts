import dotenv from "dotenv"
import {App, LogLevel} from "@slack/bolt";
import {addTrack, FindMusic} from "./music_matcher";
import {fetchVerifier} from "./pkce";
import {
    FetchChannelClient, FetchChannelPlaylist,
    FetchUserClient,
    GetLoginModal,
    RegisterPlaylist,
    RegisterUserClient
} from "./spotify_slack_link";
import {OpenLoginModal, UpdateLoginModal} from "./slack_client";
import {CreatePlaylist} from "./spotify_client";
dotenv.config()

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    logLevel: LogLevel.DEBUG,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: parseInt(process.env.PORT || '') || 3000,
    customRoutes: [
        {
            path: '/spotify/auth',
            method: ['GET'],
            handler: async (req, res) => {
                const urlParams = new URL(req.url || '', `http://${req.headers.host}`).searchParams;
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                if(code === null){
                    res.writeHead(400, 'No code found')
                    res.end()
                }
                else if(state === null){
                    res.writeHead(400, 'No user found')
                    res.end()
                } else {
                    const verifier = fetchVerifier(state) || '';
                    console.log(verifier);
                    const payload = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            client_id: process.env.SPOTIFY_CLIENT_ID || '',
                            grant_type: 'authorization_code',
                            code,
                            redirect_uri: process.env.SPOTIFY_REDIRECT_URI || '',
                            code_verifier: verifier,
                        }),
                    }

                    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', payload);
                    if(!tokenResponse.ok){
                        res.writeHead(400, await tokenResponse.text());
                        res.end()
                    } else {
                        const response = await tokenResponse.json();
                        console.log(response)
                        RegisterUserClient(state, response);
                        await UpdateLoginModal(app.client, GetLoginModal(state || ''))
                        //TODO - Can write a page that closes itself here.
                        res.writeHead(200);
                        res.end()
                    }
                }
            }
        }
    ]
});

app.event("app_mention", async ({ say, event}) => {
    const message = event.text;
    const spotifyClient = FetchChannelClient(event.channel)
    const currentPlaylist = FetchChannelPlaylist(event.channel)
    if(!spotifyClient || ! currentPlaylist){
        await say({
            thread_ts: event.ts,
            text: `There doesn't seem to be a playlist created yet!`,
            mrkdwn: true
        })
    } else {
        await FindMusic(spotifyClient, currentPlaylist, message, event.ts, say);
    }
});

app.shortcut("create-jam-playlist", async ({shortcut, ack, client}) => {
    await ack();
    await OpenLoginModal(client, shortcut.trigger_id, shortcut.user.id);
});

app.view("create-playlist", async ({ack, view, client, context}) => {
    await ack();
    const spotifyClient = FetchUserClient(context.userId || '')
    const title = view['state']['values']['playlist-title']['title'].value || 'SBF - Default'
    const description = view['state']['values']['playlist-description']['description'].value || 'SBF - This a description'
    const channel_id = view['state']['values']['playlist-post-channel']['channel'].selected_conversation || 'JukeboxFriday'
    const playlist = await CreatePlaylist(spotifyClient, {title, description})
    if(playlist === undefined){
        await client.chat.postEphemeral({
            user: context.userId || '',
            channel: channel_id,
            mrkdwn: true,
            text: `Something went wrong creating the playlist. Soz pal!`
        });
    } else {
        await client.chat.postMessage({
            channel: channel_id,
            mrkdwn: true,
            text: `This week's Jukebox Friday has been created <${playlist?.external_urls.spotify}|here>. You can add to it directly, or try adding tracks by mentioning me!`
        });
        //By registering after the fact, we can ensure the channel is real (by virtue of the fact we've been able to post a message there)
        RegisterPlaylist(channel_id, playlist, spotifyClient)
    }
});

app.action("add-track", async ({ack, say, action, body}) => {
    await ack();
    if(action.type !== "button" || body.type !== "block_actions" || !body.channel || !body.message){
        await say("Not sure how you got here from something other than a button, bud.")
    } else {
        const client = FetchChannelClient(body.channel.id)
        const currentPlaylist = FetchChannelPlaylist(body.channel.id)
        console.log(currentPlaylist)
        if(!client || !currentPlaylist){
            await say({
                thread_ts: body.message.ts,
                text: "Looks like the Jam ended. You could start another?"
            })
        }
        const spotify_uri = action.value
        await addTrack(client, currentPlaylist.id, spotify_uri);
        await say({
            thread_ts: body.message.ts,
            text: "Added!"
        })
    }
});

(async () => {
    if(process.env.SPOTIFY_CLIENT_ID === undefined){
        console.log("Config needed! SPOTIFY_CLIENT_ID")
    }
    if(process.env.SPOTIFY_REDIRECT_URI === undefined){
        console.log("Config needed! SPOTIFY_REDIRECT_URI")
    }
    await app.start(Number(process.env.PORT) || 3000);

    console.log('💿 Set the Records Spinning!')
})();