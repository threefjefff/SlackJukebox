import {GenerateSpotifyLoginUri, SetLoginModal} from "./spotify_slack_link";
import { WebClient } from "@slack/web-api"

export const OpenLoginModal = async (client: WebClient, trigger_id: string, user_id: string) => {
    let openLoginModal = await client.views.open({
        trigger_id: trigger_id,
        view: {
            type: "modal",
            title: {
                type: "plain_text",
                text: "Let's log you in"
            },
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "In order to make a playlist for you (under your Spotify account!) You need to log in."
                    },
                    accessory: {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Log me in!"
                        },
                        "url": await GenerateSpotifyLoginUri(user_id)
                    }
                }
            ]
        }
    });
    if(openLoginModal.view !== undefined && openLoginModal.view.id !== undefined) {
        SetLoginModal(user_id, openLoginModal.view.id);
    }
}

export const UpdateLoginModal = async (client: WebClient, open_modal: string) => {
    await client.views.update({
        view_id: open_modal,
        view: {
            "type": "modal",
            "callback_id": "create-playlist",
            "title": {
                "type": "plain_text",
                "text": "Create a Playlist"
            },
            "blocks": [
                {
                    "block_id": "playlist-title",
                    "type": "input",
                    "element": {
                        "action_id": "title",
                        "type": "plain_text_input"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Title",
                        "emoji": true
                    }
                },
                {
                    "block_id": "playlist-description",
                    "type": "input",
                    "element": {
                        "action_id": "description",
                        "type": "plain_text_input"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Description",
                        "emoji": true
                    }
                },
                {
                    "type": "input",
                    "block_id": "playlist-post-channel",
                    "element": {
                        "action_id": "channel",
                        "type": "conversations_select",
                        "default_to_current_conversation": true,
                        "filter": {
                            "include": [
                                "public"
                            ]
                        }
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Pick a Channel",
                        "emoji": true
                    }
                }
            ],
            "submit": {
                "type": "plain_text",
                "text": "Let's rock!"
            }
        }
    })
}