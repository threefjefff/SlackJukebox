import {SpotifyApi} from "@spotify/web-api-ts-sdk";

export interface CreatePlaylistArgs {
    title: string,
    description: string,
}

export const CreatePlaylist = async (spotifyApi: SpotifyApi, playlistArgs: CreatePlaylistArgs) => {
    if(spotifyApi === null){
        console.log("💣")
        return;
    }
    const me = await spotifyApi.currentUser.profile()
    const playlist = await spotifyApi.playlists.createPlaylist(me.id, {
        name: playlistArgs.title,
        description: playlistArgs.description,
        public: true,
        collaborative: true
    });
    console.log(playlist.href)

    return playlist;
}