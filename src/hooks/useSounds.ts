import { useRef, useCallback, useEffect } from "react"
import bossa from "../assets/sounds/bossa.mp3"

const generateAnswerSelectSound = (): void => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 880
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.12)
}

const generateGameEndSound = (): Promise<void> => {
    return new Promise((resolve) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const now = audioContext.currentTime
        
        const notes = [523.25, 659.25, 783.99] // C5, E5, G5
        const durations = [0.2, 0.2, 0.4]
        let currentTime = now
        
        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.value = freq
            oscillator.type = "sine"
            gainNode.gain.setValueAtTime(0.1, currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + durations[i])
            
            oscillator.start(currentTime)
            oscillator.stop(currentTime + durations[i])
            
            currentTime += durations[i] + 0.05
        })
        
        setTimeout(resolve, (currentTime - now) * 1000)
    })
}

const sounds = {
    lobby: bossa,
    answerSelect: "",
    gameEnd: "",
}

export default function useSound(audioType: string) {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // create audio element once and clean up on unmount
    useEffect(() => {
        let el: HTMLAudioElement | null = null
        if (audioType === "lobby" && sounds.lobby) {
            el = new Audio(sounds.lobby)
            el.loop = true
            el.preload = "auto"
            audioRef.current = el
        }

        return () => {
            if (el) {
                try {
                    el.pause()
                    el.currentTime = 0
                } catch (_) {
                }
            }
            audioRef.current = null
        }
    }, [audioType])

    const play = useCallback(async () => {
        try {
                    if (audioType === "answerSelect") {
                        generateAnswerSelectSound()
                    } else if (audioType === "correct") {
                        generateCorrectSound()
                    } else if (audioType === "wrong") {
                        generateWrongSound()
                    } else if (audioType === "gameEnd") {
                        await generateGameEndSound()
                    } else if (audioRef.current) {
                // if already playing, don't restart to avoid overlapping
                if (audioRef.current.paused) {
                    audioRef.current.currentTime = 0
                    await audioRef.current.play()
                }
            }
        } catch (err) {
            console.error("Failed to play audio:", err)
        }
    }, [audioType])

    const stop = useCallback(() => {
        if (audioRef.current) {
            try {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            } catch (_) {
                // ignore
            }
        }
    }, [])

    return { play, stop, audio: audioRef.current }
}

const generateCorrectSound = (): void => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, now)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc.start(now)
    osc.stop(now + 0.18)
}

const generateWrongSound = (): void => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
    osc.start(now)
    osc.stop(now + 0.28)
}