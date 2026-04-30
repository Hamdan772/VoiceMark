'use client'

import { useEffect, useState } from 'react'

interface TypewriterAnimationProps {
    phrases: string[]
    speed?: number
    delayBetweenPhrases?: number
    className?: string
}

export function TypewriterAnimation({
    phrases,
    speed = 80,
    delayBetweenPhrases = 1200,
    className = '',
}: TypewriterAnimationProps) {
    const [displayText, setDisplayText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [phraseIndex, setPhraseIndex] = useState(0)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted) return

        const currentPhrase = phrases[phraseIndex]
        let timeout: NodeJS.Timeout

        if (!isDeleting) {
            // Typing
            if (displayText.length < currentPhrase.length) {
                timeout = setTimeout(() => {
                    setDisplayText(currentPhrase.slice(0, displayText.length + 1))
                }, speed)
            } else {
                // Pause before deleting
                timeout = setTimeout(() => {
                    setIsDeleting(true)
                }, delayBetweenPhrases)
            }
        } else {
            // Deleting
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1))
                }, speed * 0.5)
            } else {
                // Move to next phrase
                setIsDeleting(false)
                setPhraseIndex((prev) => (prev + 1) % phrases.length)
            }
        }

        return () => clearTimeout(timeout)
    }, [displayText, isDeleting, phraseIndex, phrases, speed, delayBetweenPhrases, isMounted])

    if (!isMounted) {
        return (
            <span className={className}>
                {phrases[0]}
                <span className="typewriter-cursor" />
            </span>
        )
    }

    return (
        <span className={className}>
            {displayText}
            <span className="typewriter-cursor" />
        </span>
    )
}
