export class SpotifyJS {
    c: ClientObject;
    p: PlayerObject
    np: NowPlayingObject;
    
    constructor(player: PlayerObject, client: ClientObject) {
        this.p = player as PlayerObject;
        this.c = client as ClientObject;
        this.np = client.nowPlaying as NowPlayingObject;
    }

    pause(): void { this.p.pause() }

    resume(): void { this.p.resume()}

    mute(): void { if (!this.c.mute) this.c.toggleMute(); }

    unmute(): void { if (this.c.mute) this.c.toggleMute(); }

    seek(elapsedTimeMs: number): void { this.c.seek(elapsedTimeMs); }

    playTrack(trackURI: string): void { this.p.playTrack(trackURI, {}); }

    playFromArtist(artistURI: string, songIndex: number): void { this.p.playFromArtist(artistURI, {index: songIndex % 10}); }

    addToQueue(trackURI: string): void {this.c._enqueueAlbum(trackURI); }

    setRepeat(mode: string) {
        var modeNumber: number = 0;
        switch(mode) {
            case "off": modeNumber = 0; break;
            case "queue": modeNumber = 1; break;
            case "single": modeNumber = 2; break;
        }
        const modeDiff = modeNumber - this.c.repeat();
        if (modeDiff == 0) return;
        if (modeDiff > 0) {
            for (var i = 0; i++; i < modeDiff) this.c.toggleRepeat();
        } else {
            for (var i = 0; i++; i < Math.abs(modeDiff * 2) % 3) this.c.toggleRepeat();
        }
    }

    changeVolume(volume: number) { this.c.changeVolume(volume) }

    skipToNext(): void { this.c.skipToNext(); }

    skipToPrevious(): void { this.c.skipToPrevious() }

    togglePlay(): void { this.c.togglePlay(); }

    toggleMute(): void { return this.c.toggleMute(); }

    toggleShuffle(): void { return this.c.toggleShuffle(); }

    toggleRepeat(): void { return this.c.toggleRepeat(); }

    isMuted(): boolean { return this.c.mute(); }

    isPlaying(): boolean { return this.c.playing(); }

    isActuallyPlaying(): boolean { return this.c.actuallyPlaying(); }

    isShuffling(): boolean { return this.c.shuffle(); }

    isRepeating(): boolean { return (this.c.repeat() == 0) ? false : true; }

    volume(): number { return this.c.volume(); }

    unmutedVolume(): number { return this.c._unmutedVolume; }

    repeatMode(): string {
        switch(this.c.repeat()) {
            case 0: return "off";
            case 1: return "queue";
            case 2: return "single";
            default: return "unknown";
        }
    }

    currentTrackName(): string { return this.np.name(); }

    currentTrackURI(): string { return this.np.trackURI(); }

    currentTrackArtists(): SpotifyArtist[] {
        const artists: Artist[] = [];
        (this.np.artists() as Artist[]).forEach(a => {
            artists.push({name: a.name, uri: a.uri})
        });
        return artists;
    }

    currentTrackHasLyrics(): boolean { return this.c.trackHasLyrics(); }

    currentTrackDuration(): number { return this.c.duration(); }

    currentTrackElapsed(): number {
        const timeElapsed: string[] = this.c.elapsed().split(":");
        return parseInt(timeElapsed[0]) * 60 + parseInt(timeElapsed[1]);
    }

    currentTrackRemaining(): number {
        const timeRemaining: string[] = this.c.remaining().split(":");
        return parseInt(timeRemaining[0]) * 60 + parseInt(timeRemaining[1]);
    }

    currentTrackBannerURI(): string { return this.np.banUri(); }

    currentTrackImageURI(): string { return this.np.imageURI(); }

    currentTrackImageHeight(): number { return this.np.imageHeight() }

    currentTrackIsAd(): number { return this.np.isAd(); }

    currentTrackIsEpisode(): number { return this.np.isEpisode(); }

    currentTrackIsTrack(): number { return this.np.isTrack(); }

    currentTrackIsVideoAd(): number { return this.np.isVideoAd(); }
}
