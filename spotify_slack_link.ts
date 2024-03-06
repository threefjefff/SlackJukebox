import {generatePkceChallenge} from "./pkce";
import {Playlist, SpotifyApi, TrackItem} from "@spotify/web-api-ts-sdk";

const user_spotify_map: {[slack_user: string]: SpotifyApi} = {};
const user_login_map: {[slack_user: string]: string} = {};
const channel_spotify_map: {[channel_id: string]: SpotifyApi} = {};
const channel_playlist_map: {[channel_id: string]: Playlist<TrackItem>} = {};

export const GenerateSpotifyLoginUri = async (slack_user: string) => {
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    authUrl.search = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID || '',
        scope: 'playlist-modify-public',
        code_challenge_method: 'S256',
        code_challenge: await generatePkceChallenge(slack_user),
        state: slack_user,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI || ''
    }).toString()
    return authUrl.toString();
}

export const SetLoginModal = (slack_user: string, modal_id: string): void => {
    user_login_map[slack_user] = modal_id;
}

export const GetLoginModal = (slack_user: string): string => user_login_map[slack_user];

export const RegisterUserClient = (slack_user: string, response: any) => {
    user_spotify_map[slack_user] = SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID || '', response);
}

export const FetchUserClient = (slack_user: string) : SpotifyApi => user_spotify_map[slack_user]


export const RegisterPlaylist = (channel_id: string, playlist: Playlist<TrackItem>, client: SpotifyApi) => {
    channel_spotify_map[channel_id] = client;
    channel_playlist_map[channel_id] = playlist;
}

export const FetchChannelClient = (channel_id: string) : SpotifyApi => channel_spotify_map[channel_id]
export const FetchChannelPlaylist = (channel_id: string) : Playlist<TrackItem> => channel_playlist_map[channel_id]