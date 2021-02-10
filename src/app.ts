import { AudioManager } from './audio';
import { SpotifyJS } from './client';

class SpotifyVoice {
    api: SpotifyJS;
    audio: AudioManager;
    
    private audioInitPromise;

    constructor() {
        this.api = SpotifyVoice.initializeAPI();
        this.audio = new AudioManager();
        this.audioInitPromise = this.audio.init();
    }

    private static initializeAPI() {
        const transversed: Set<object> = new Set();
        var player: PlayerObject | undefined;
        var client: ClientObject | undefined;
    
        function walk(obj: any) {
            const keys: string[] = Object.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                if (player != undefined && client != undefined) break;
                const property = obj[keys[i]];
                if (property && typeof property == "object") {
                    if (!transversed.has(property)) {
                        if (Object.keys(property).includes("playTrack")) player = property;
                        else if (property.constructor?.name == "j") client = property;
                        transversed.add(property);
                        walk(property);
                    }
                }
            }
        }
        walk(window);
        if (player == undefined) throw Error("Failed to locate player object");
        if (client == undefined) throw Error("Failed to locate client object");
        return new SpotifyJS(player, client);
    }

    async ensureReady(): Promise<void[]> {
        return Promise.all([this.audioInitPromise]);
    }

    playSong(uri: string) {
        this.api.playTrack(uri);
    }
}

(window as any)["SpotifyVoice"] = SpotifyVoice;