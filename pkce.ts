import crypto from "crypto";
//Stolen eagerly from: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

const user_verifier_map: {[slack_user: string]: string} = {};

export const fetchVerifier = (slack_user: string): string =>
{
    console.log(`Verifier for ${slack_user} is ${user_verifier_map[slack_user]}`);
    return user_verifier_map[slack_user];
}

export const generatePkceChallenge = async (slack_user: string): Promise<string> => {
    const verifier = generateCodeVerifier()
    user_verifier_map[slack_user] = verifier;
    console.log(`Verifier for ${slack_user} is ${user_verifier_map[slack_user]}`);
    return base64encode(await sha256(verifier))
}

const generateCodeVerifier = (): string => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(128));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
}

const base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}