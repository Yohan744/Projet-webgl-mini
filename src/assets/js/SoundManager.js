import { Howl, Howler } from 'howler';
import { data } from '../../data/Sounds.js';
import { watch } from "vue";

export default class SoundManager {

    constructor() {
        this.sounds = {};
        this.init();
    }

    init() {
        Object.keys(data).forEach(key => {
            const sound = data[key];
            this.sounds[key] = new Howl({
                src: sound.src,
                volume: sound.volume,
                preload: sound.preload,
                loop: sound.loop,
            });
        });

        this.backgroundOriginalVolume = this.sounds['background'].volume();
    }

    play(key) {
        if (this.sounds[key].state() === 'unloaded') this.loadSongs();
        this.sounds[key].play();
    }

    pause(key) {
        this.sounds[key].pause();
    }

    stop(key) {
        this.sounds[key].stop();
    }

    fadeOutAndStopBackground(fadeDuration, onComplete = () => {}) {
        const originalVolume = this.sounds['background'].volume();

        this.sounds['background'].fade(originalVolume, 0, fadeDuration);

        setTimeout(() => {
            this.sounds['background'].stop();
            if (onComplete) onComplete();
        }, fadeDuration * 1000);
    }

    playSoundWithBackgroundFade(key, fadeDuration) {

        this.sounds['background'].fade(this.backgroundOriginalVolume, this.backgroundOriginalVolume / 3, fadeDuration);

        setTimeout(() => {
            this.sounds[key].play();

            this.sounds[key].on('end', () => {
                this.sounds['background'].fade(this.backgroundOriginalVolume / 3, this.backgroundOriginalVolume, fadeDuration);
                this.sounds[key].off('end');
            });
        }, fadeDuration * 1000)

    }

    loadSongs() {
        Object.keys(this.sounds).forEach(key => {
            this.sounds[key].load();
        });
    }

    destroy() {
        Object.keys(this.sounds).forEach(key => {
            this.sounds[key].stop();
            this.sounds[key].unload();
        });
    }
}
