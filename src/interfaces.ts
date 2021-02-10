interface SpotifyArtist {
    name: string;
    uri: string;
}

interface DevicesList {
    active: boolean;
    attached: boolean;
    can_play: boolean;
    state: string;
    name: string;
    type: string;
}

interface ConnectHelper {
    _currentDevicesList: Array<DevicesList>
}

interface Artist {
    name: string;
    uri: string
}

interface PlayerObject {
    pause: Function;
    playContext: Function;
    playFromArtist: Function;
    playFromCollectionResolver: Function;
    playFromPlaylistResolver: Function;
    playFromResolver: Function;
    playRows: Function;
    playTrack: Function;
    resume: Function;
    skipNext: Function;
    skipPrev: Function;
    updateContext: Function;
    updateWithRows: Function;
}

interface ClientObject {
    actuallyPlaying: Function;
    candyCaneEnabled: Function;
    connectButtonLabel: Function;
    connectButtonText: Function;
    connectHelper: ConnectHelper;
    connectIcon: Function;
    connectPopup: object;
    defaultQueueDropMimetypesUI: string;
    duration: Function;
    elapsed: Function;
    enableDarkMode: Function;
    error: boolean;
    fullScreenButtonEnabled: Function;
    fullScreenFeatureEnabled: Function;
    fullScreenIconFullScreen: Function;
    fullScreenIconMinimise: Function;
    fullScreenIconType: Function;
    fullScreenLabel: Function;
    fullScreenOpen: Function;
    fullScreenTooltipLabel: Function;
    isDraggingProgressBar: Function;
    isSkippableAdBreak: Function;
    liveLabel:Function;
    lyricsEnabled: Function;
    lyricsOpen: Function;
    mute: Function;
    muteLabel: Function;
    muteTooltip: Function;
    nextEnabled: Function;
    nextLabel: Function;
    nowPlaying: object;
    offlineLabel: Function;
    online: Function;
    playEnabled: Function;
    playLabel: Function;
    playing: Function;
    previousEnabled: Function;
    previousLabel: Function;
    progressbar: object;
    progressbarEnabled: Function;
    queueLabel: Function;
    queueOpen: Function;
    remaining: Function;
    remainingFormat: string
    remotePlaybackBar: object
    repeat: Function;
    repeatContextEnabled: Function;
    repeatEnabled: Function;
    repeatIcon: Function;
    repeatLabel: Function;
    repeatTrackEnabled: Function;
    seekEnabled: Function;
    showLive: Function;
    showSkipBack: Function;
    showSkipForward: Function;
    shuffle: Function;
    shuffleEnabled: Function;
    shuffleLabel: Function;
    skipAdDelay: number;
    skipBackDisabled: Function;
    skipBackLabel: Function;
    skipCountdownRemainingSecs: Function;
    skipCountdownText: Function;
    skipForwardDisabled: Function;
    skipForwardLabel: Function;
    swEnabled: Function;
    swSaberBar: object;
    swSaberColor: Function;
    swSaberHilt: Function;
    swToggleHilt: Function;
    thumbDownDisabled: Function;
    thumbDownLabel: Function;
    thumbUpDisabled: Function;
    thumbUpLabel: Function;
    tooltipContainerSelector: Function;
    trackHasLyrics: Function;
    trackThumbedDown: Function;
    trackThumbedUp: Function;
    volume: Function;
    volumeEnabled: Function;
    volumeIcon: Function;
    volumebar: object;
    _entityUri: string;
    _isPlaying: boolean;
    _trackMetadata: object;
    _unmutedVolume: number;
    _uri: string;
    seek: Function;
    skipForward: Function;
    skipBack: Function;
    changeVolume: Function;
    skipToNext: Function;
    skipToPrevious: Function;
    toggleRepeat: Function;
    toggleShuffle: Function;
    toggleMute: Function;
    togglePlay: Function
    _enqueueAlbum: Function;
}

interface NowPlayingObject {
    active: Function
    adInfo: Function
    adType: Function
    addLabel: Function
    artistScrollable: Function
    artists: Function
    artistsSeparator: Function
    banLabel: Function
    banUri: Function
    displayLargeCoverSize: Function
    formatListFeedbackMode: Function
    fullScreenFeatureEnabled: Function
    imageHeight: Function
    imageURI: Function
    imageURICSS: Function
    isAd: Function
    isEpisode: Function
    isInFullScreenMode: Function
    isLocal: Function
    isPlayingOverConnect: Function
    isPlayingVideoInNowPlaying: Function
    isToggleCoverSizeVisible: Function
    isToggleFullScreenVisible: Function
    isTrack: Function
    isVideo: Function
    isVideoAd: Function
    isVideoContainerVisible: Function
    name: Function;
    nowPlayingA11yLabel: Function;
    referrerURI: Function;
    relinkedTrackURI: Function;
    scrollResetters: Array<any>;
    showBanMenu: Function;
    showFeedback: Function;
    thumbDownDisabled: Function;
    thumbUpDisabled: Function;
    tooltipContainerSelector: Function;
    trackScrollable: Function;
    trackThumbedDown: Function;
    trackThumbedUp: Function;
    trackURI: Function;
    transitioning: Function;
    videoAdId: Function;
}