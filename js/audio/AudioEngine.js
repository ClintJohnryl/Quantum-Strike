// ===== AUDIO ENGINE - Realistic Sound Design =====

class AudioEngine {
    constructor() {
        this.audioCtx = null;
        this.enabled = true;
        this.masterGain = 0.4;
        this._heavyRailgunBuffer = null;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio engine initialized with realistic synthesis');
        } catch (e) {
            console.warn('Audio not supported:', e);
            this.enabled = false;
        }
    }

    resume() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    // === LOAD EXTERNAL SOUND ===
    loadSound(url) {
        return new Promise((resolve, reject) => {
            if (!this.enabled || !this.audioCtx) {
                reject('Audio not enabled');
                return;
            }
            
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    resolve(audioBuffer);
                })
                .catch(error => {
                    console.error('Failed to load sound:', error);
                    reject(error);
                });
        });
    }

    playBufferedSound(buffer, volume = 0.4, pan = 0) {
        if (!this.enabled || !this.audioCtx || !buffer) return null;

        try {
            const source = this.audioCtx.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.audioCtx.createGain();
            gainNode.gain.value = volume * this.masterGain;

            const panner = this.audioCtx.createStereoPanner();
            panner.pan.value = pan;

            source.connect(gainNode);
            gainNode.connect(panner);
            panner.connect(this.audioCtx.destination);

            source.start();
            source.stop(this.audioCtx.currentTime + buffer.duration);

            return source;
        } catch (e) {
            console.warn('Playback error:', e);
            return null;
        }
    }

    // === UTILITY FUNCTIONS ===

    createBuffer(duration, fn) {
        if (!this.enabled || !this.audioCtx) return null;
        const sampleRate = this.audioCtx.sampleRate;
        const bufferSize = Math.floor(sampleRate * duration);
        const buffer = this.audioCtx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = fn(i / sampleRate);
        }
        return buffer;
    }

    playBuffer(buffer, volume = 0.3, pan = 0) {
        if (!this.enabled || !this.audioCtx || !buffer) return null;

        try {
            const source = this.audioCtx.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.audioCtx.createGain();
            gainNode.gain.value = volume * this.masterGain;

            const panner = this.audioCtx.createStereoPanner();
            panner.pan.value = pan;

            source.connect(gainNode);
            gainNode.connect(panner);
            panner.connect(this.audioCtx.destination);

            source.start();
            source.stop(this.audioCtx.currentTime + buffer.duration);

            return source;
        } catch (e) {
            console.warn('Playback error:', e);
            return null;
        }
    }

    // === SYNTHESIS METHODS ===

    // FM Synthesis (Frequency Modulation)
    fmSynthesis(carrierFreq, modulatorFreq, modulationIndex, duration, volume = 0.3) {
        return this.createBuffer(duration, (t) => {
            const modulator = modulationIndex * Math.sin(2 * Math.PI * modulatorFreq * t);
            const signal = Math.sin(2 * Math.PI * carrierFreq * t + modulator);
            const envelope = Math.exp(-t * 4) * 0.7 + 0.3;
            return signal * envelope * volume;
        });
    }

    // AM Synthesis (Amplitude Modulation)
    amSynthesis(carrierFreq, modulatorFreq, depth, duration, volume = 0.3) {
        return this.createBuffer(duration, (t) => {
            const modulator = 1 + depth * Math.sin(2 * Math.PI * modulatorFreq * t);
            const signal = Math.sin(2 * Math.PI * carrierFreq * t) * modulator;
            const envelope = Math.exp(-t * 3) * 0.7 + 0.3;
            return signal * envelope * volume;
        });
    }

    // Granular Synthesis (short grains)
    granularSynthesis(duration, grainDuration = 0.02, density = 50, volume = 0.3) {
        return this.createBuffer(duration, (t) => {
            let sample = 0;
            const grainCount = density * duration;
            for (let i = 0; i < grainCount; i++) {
                const pos = Math.random() * duration;
                const amp = Math.exp(-Math.abs(t - pos) / (grainDuration / 3));
                const freq = 200 + Math.random() * 800;
                sample += amp * Math.sin(2 * Math.PI * freq * (t - pos));
            }
            const envelope = Math.exp(-t * 3) * 0.7 + 0.3;
            return sample * envelope * volume / 10;
        });
    }

    // === GAME SOUND EFFECTS ===

    // Laser Shoot - Sci-fi blaster with character
    playShoot(volume = 0.12) {
        if (!this.enabled) return;
        
        // FM synthesis for laser sound
        const buffer = this.fmSynthesis(800, 200, 5, 0.08, volume);
        this.playBuffer(buffer, volume * 0.8, 0);
        
        // Add a quick noise burst for impact
        setTimeout(() => {
            const noise = this.createBuffer(0.02, (t) => {
                const env = Math.exp(-t * 100);
                return (Math.random() * 2 - 1) * env * volume * 0.4;
            });
            this.playBuffer(noise, volume * 0.3, 0);
        }, 30);
    }

    // Heavy Railgun - Plays the WAV file
    playHeavyRailgun(volume = 0.35) {
        if (!this.enabled) return;
        
        // Try to play the custom WAV sound if loaded
        if (this._heavyRailgunBuffer) {
            this.playBufferedSound(this._heavyRailgunBuffer, volume);
            console.log('Playing Heavy Railgun WAV sound');
        } else {
            console.log('Heavy Railgun WAV not loaded yet');
        }
    }

    // Explosion - Realistic cinematic boom
    playExplosion(volume = 0.35, size = 1) {
        if (!this.enabled) return;
        
        const duration = 0.3 + size * 0.15;
        
        // Deep sub-bass
        const sub = this.createBuffer(duration, (t) => {
            const env = Math.exp(-t * 3);
            const signal = Math.sin(2 * Math.PI * 20 * t) * 3;
            return signal * env * volume * 0.4;
        });
        this.playBuffer(sub, volume * 0.4, 0);
        
        // FM explosion
        const explosion = this.fmSynthesis(80 / size, 30, 10, duration, volume * 0.7);
        this.playBuffer(explosion, volume * 0.7, 0);
        
        // Noise layers (pink + white)
        const noise = this.createBuffer(duration, (t) => {
            const env = Math.exp(-t * 5);
            const pink = (Math.random() * 2 - 1) * 0.5 + (Math.random() * 2 - 1) * 0.3;
            const white = (Math.random() * 2 - 1) * 0.5;
            return (pink + white) * env * volume * 0.5;
        });
        this.playBuffer(noise, volume * 0.5, 0);
        
        // Debris impact clicks
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const click = this.createBuffer(0.03, (t) => {
                    const env = Math.exp(-t * 80);
                    const freq = 500 + Math.random() * 1000;
                    const signal = Math.sin(2 * Math.PI * freq * t);
                    return signal * env * volume * 0.2;
                });
                this.playBuffer(click, volume * 0.2, (Math.random() - 0.5) * 0.8);
            }, 50 + i * 30 + Math.random() * 50);
        }
    }

    // Collision - Metallic impact
    playCollision(volume = 0.2, intensity = 1) {
        if (!this.enabled) return;
        
        // FM metallic ring
        const ring = this.fmSynthesis(800 + intensity * 400, 200, 3, 0.12, volume * 0.7);
        this.playBuffer(ring, volume * 0.7, 0);
        
        // Second harmonic
        setTimeout(() => {
            const ring2 = this.amSynthesis(1200 + intensity * 300, 150, 0.5, 0.08, volume * 0.4);
            this.playBuffer(ring2, volume * 0.4, 0);
        }, 40);
        
        // Impact noise
        setTimeout(() => {
            const impact = this.createBuffer(0.04, (t) => {
                const env = Math.exp(-t * 60);
                return (Math.random() * 2 - 1) * env * volume * 0.4;
            });
            this.playBuffer(impact, volume * 0.4, 0);
        }, 10);
    }

    // Asteroid collision - Rocks grinding
    playAsteroidCollision(volume = 0.25, size = 1) {
        if (!this.enabled) return;
        
        const duration = 0.15 + size * 0.1;
        
        // Granular synthesis for rock texture
        const rock = this.granularSynthesis(duration, 0.01, 30, volume * 0.5);
        this.playBuffer(rock, volume * 0.5, 0);
        
        // Low rumble
        const rumble = this.fmSynthesis(60 / (size * 0.5 + 0.5), 20, 5, duration, volume * 0.5);
        this.playBuffer(rumble, volume * 0.5, 0);
        
        // Crunch noise
        const crunch = this.createBuffer(duration, (t) => {
            const env = Math.exp(-t * 8);
            const signal = (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * (200 + Math.random() * 300) * t);
            return signal * env * volume * 0.4;
        });
        this.playBuffer(crunch, volume * 0.4, 0);
    }

    // Powerup pickup - Satisfying reward
    playPowerup(volume = 0.25) {
        if (!this.enabled) return;
        
        // Ascending arpeggio
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const tone = this.fmSynthesis(freq, 50, 1, 0.12, volume * (1 - i * 0.12));
                this.playBuffer(tone, volume * (1 - i * 0.12), 0);
            }, i * 80);
        });
        
        // Sparkle effect
        setTimeout(() => {
            const sparkle = this.createBuffer(0.1, (t) => {
                const env = Math.exp(-t * 20);
                const signal = Math.sin(2 * Math.PI * (800 + 400 * Math.sin(t * 20)) * t);
                return signal * env * volume * 0.3;
            });
            this.playBuffer(sparkle, volume * 0.3, 0);
        }, 300);
    }

    // Engine hum - Throbbing drive
    playEngine(volume = 0.04) {
        if (!this.enabled) return;
        
        // Layered engine sound
        const layers = [
            { freq: 40, amp: 1.0 },
            { freq: 80, amp: 0.6 },
            { freq: 160, amp: 0.3 },
            { freq: 320, amp: 0.15 }
        ];
        
        const buffer = this.createBuffer(0.5, (t) => {
            let signal = 0;
            layers.forEach(layer => {
                signal += Math.sin(2 * Math.PI * layer.freq * t) * layer.amp;
                signal += Math.sin(2 * Math.PI * layer.freq * 1.02 * t + 0.5) * layer.amp * 0.5;
            });
            const envelope = 0.8 + 0.2 * Math.sin(t * 20);
            return signal * envelope * volume * 0.3;
        });
        this.playBuffer(buffer, volume, 0);
    }

    // Enemy spawn - Ominous warning
    playEnemySpawn(volume = 0.2) {
        if (!this.enabled) return;
        
        // Descending FM sweep
        const sweep = this.createBuffer(0.4, (t) => {
            const freq = 400 - t * 300;
            const env = Math.exp(-t * 3);
            const signal = Math.sin(2 * Math.PI * freq * t + 2 * Math.sin(2 * Math.PI * 20 * t));
            return signal * env * volume;
        });
        this.playBuffer(sweep, volume, 0);
        
        // Second sweep
        setTimeout(() => {
            const sweep2 = this.createBuffer(0.3, (t) => {
                const freq = 300 - t * 200;
                const env = Math.exp(-t * 4);
                const signal = Math.sin(2 * Math.PI * freq * t);
                return signal * env * volume * 0.6;
            });
            this.playBuffer(sweep2, volume * 0.6, 0);
        }, 150);
    }

    // Game Over - Dramatic defeat
    playGameOver(volume = 0.3) {
        if (!this.enabled) return;
        
        // Descending chord
        const notes = [440, 392, 349, 294];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const tone = this.fmSynthesis(freq, 30, 3, 0.4, volume * (1 - i * 0.15));
                this.playBuffer(tone, volume * (1 - i * 0.15), 0);
            }, i * 200);
        });
    }

    // Shield break - Energy shatter
    playShieldBreak(volume = 0.2) {
        if (!this.enabled) return;
        
        // Energy crackle
        const crackle = this.createBuffer(0.15, (t) => {
            const env = Math.exp(-t * 15);
            const freq = 2000 + 1000 * Math.sin(t * 100);
            const signal = Math.sin(2 * Math.PI * freq * t) * Math.sin(2 * Math.PI * 60 * t);
            return signal * env * volume * 0.6;
        });
        this.playBuffer(crackle, volume * 0.6, 0);
        
        // Shatter noise
        const shatter = this.createBuffer(0.1, (t) => {
            const env = Math.exp(-t * 20);
            const noise = (Math.random() * 2 - 1) * 0.7 + (Math.random() * 2 - 1) * 0.3;
            return noise * env * volume * 0.4;
        });
        this.playBuffer(shatter, volume * 0.4, 0);
    }

    // Ship hit - Impact
    playShipHit(volume = 0.15) {
        if (!this.enabled) return;
        
        const hit = this.createBuffer(0.06, (t) => {
            const env = Math.exp(-t * 40);
            const noise = (Math.random() * 2 - 1) * 0.6;
            const tone = Math.sin(2 * Math.PI * 150 * t) * 0.4;
            return (noise + tone) * env * volume;
        });
        this.playBuffer(hit, volume, 0);
    }

    // Mine deploy - Mechanical click
    playMineDeploy(volume = 0.12) {
        if (!this.enabled) return;
        
        const click1 = this.createBuffer(0.03, (t) => {
            const env = Math.exp(-t * 80);
            const signal = Math.sin(2 * Math.PI * 600 * t);
            return signal * env * volume;
        });
        this.playBuffer(click1, volume, 0);
        
        setTimeout(() => {
            const click2 = this.createBuffer(0.03, (t) => {
                const env = Math.exp(-t * 80);
                const signal = Math.sin(2 * Math.PI * 400 * t);
                return signal * env * volume * 0.6;
            });
            this.playBuffer(click2, volume * 0.6, 0);
        }, 60);
    }

    // Boss spawn - Epic entrance
    playBossSpawn(volume = 0.4) {
        if (!this.enabled) return;
        
        // Deep drum hit
        const drum = this.createBuffer(0.3, (t) => {
            const env = Math.exp(-t * 8);
            const signal = Math.sin(2 * Math.PI * 30 * t) * 1.5 + Math.sin(2 * Math.PI * 60 * t) * 0.5;
            return signal * env * volume * 0.6;
        });
        this.playBuffer(drum, volume * 0.6, 0);
        
        // Rising tension
        setTimeout(() => {
            const rise = this.createBuffer(0.5, (t) => {
                const freq = 100 + t * 300;
                const env = Math.sin(t * Math.PI / 0.5);
                const signal = Math.sin(2 * Math.PI * freq * t);
                return signal * env * volume * 0.4;
            });
            this.playBuffer(rise, volume * 0.4, 0);
        }, 100);
        
        // Cinematic noise burst
        setTimeout(() => {
            const noise = this.createBuffer(0.25, (t) => {
                const env = Math.exp(-t * 8);
                const pink = (Math.random() * 2 - 1) * 0.7;
                return pink * env * volume * 0.3;
            });
            this.playBuffer(noise, volume * 0.3, 0);
        }, 250);
    }

    // Victory - Triumphant
    playVictory(volume = 0.3) {
        if (!this.enabled) return;
        
        const notes = [523, 659, 784, 1047, 784, 659, 523];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const tone = this.fmSynthesis(freq, 40, 2, 0.2, volume * (1 - i * 0.05));
                this.playBuffer(tone, volume * (1 - i * 0.05), 0);
            }, i * 120);
        });
    }

    // Shield activate - Energy hum
    playShieldActivate(volume = 0.15) {
        if (!this.enabled) return;
        
        const buffer = this.fmSynthesis(400, 80, 4, 0.2, volume);
        this.playBuffer(buffer, volume, 0);
    }

    // Speed boost - Whoosh
    playSpeedBoost(volume = 0.15) {
        if (!this.enabled) return;
        
        const whoosh = this.createBuffer(0.3, (t) => {
            const env = Math.exp(-t * 5);
            const freq = 200 + t * 600;
            const signal = Math.sin(2 * Math.PI * freq * t) * 1.2;
            return signal * env * volume * 0.6;
        });
        this.playBuffer(whoosh, volume * 0.6, 0);
        
        // Wind noise
        const wind = this.createBuffer(0.2, (t) => {
            const env = Math.exp(-t * 10);
            const noise = (Math.random() * 2 - 1) * 0.4;
            return noise * env * volume * 0.3;
        });
        this.playBuffer(wind, volume * 0.3, 0);
    }

    // Drone launch - Mechanical release
    playDroneLaunch(volume = 0.12) {
        if (!this.enabled) return;
        
        const release = this.createBuffer(0.08, (t) => {
            const env = Math.exp(-t * 30);
            const freq = 800 - t * 400;
            const signal = Math.sin(2 * Math.PI * freq * t);
            return signal * env * volume;
        });
        this.playBuffer(release, volume, 0);
        
        setTimeout(() => {
            const hum = this.fmSynthesis(200, 30, 2, 0.15, volume * 0.5);
            this.playBuffer(hum, volume * 0.5, 0);
        }, 50);
    }

    // Enemy explosion - Death sound
    playEnemyExplosion(volume = 0.25, size = 1) {
        if (!this.enabled) return;
        
        const duration = 0.15 + size * 0.1;
        
        // Short explosion
        const boom = this.fmSynthesis(120 / size, 40, 6, duration, volume * 0.7);
        this.playBuffer(boom, volume * 0.7, 0);
        
        // Debris
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const debris = this.createBuffer(0.04, (t) => {
                    const env = Math.exp(-t * 50);
                    const freq = 300 + Math.random() * 400;
                    return Math.sin(2 * Math.PI * freq * t) * env * volume * 0.3;
                });
                this.playBuffer(debris, volume * 0.3, (Math.random() - 0.5) * 0.8);
            }, 20 + i * 30);
        }
    }

    // Auto-cannon - Rapid fire
    playAutoCannon(volume = 0.08) {
        if (!this.enabled) return;
        
        const shot = this.createBuffer(0.04, (t) => {
            const env = Math.exp(-t * 60);
            const noise = (Math.random() * 2 - 1) * 0.5;
            const tone = Math.sin(2 * Math.PI * 600 * t) * 0.5;
            return (noise + tone) * env * volume;
        });
        this.playBuffer(shot, volume, 0);
    }

    // Mine explosion
    playMineExplosion(volume = 0.3) {
        if (!this.enabled) return;
        
        const buffer = this.fmSynthesis(150, 50, 8, 0.2, volume);
        this.playBuffer(buffer, volume, 0);
        
        setTimeout(() => {
            const noise = this.createBuffer(0.15, (t) => {
                const env = Math.exp(-t * 10);
                return (Math.random() * 2 - 1) * env * volume * 0.4;
            });
            this.playBuffer(noise, volume * 0.4, 0);
        }, 30);
    }
}

// Create global audio instance
const Audio = new AudioEngine();
window.Audio = Audio;

console.log('Audio engine ready with realistic sound synthesis!');
console.log('Sound synthesis techniques:');
console.log('  - FM Synthesis (Frequency Modulation)');
console.log('  - AM Synthesis (Amplitude Modulation)');
console.log('  - Granular Synthesis');
console.log('  - Layered Noise');
console.log('  - ADSR Envelopes');
console.log('  - External WAV sound loading support');