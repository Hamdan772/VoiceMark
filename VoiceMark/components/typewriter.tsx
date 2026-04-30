import React, { useEffect, useState } from 'react'

type TypewriterProps = {
    words: string[]
    loop?: boolean
    typingSpeed?: number
    deletingSpeed?: number
    pause?: number
    className?: string
}

export default function Typewriter({
    words,
    loop = true,
    typingSpeed = 80,
    deletingSpeed = 40,
    pause = 1500,
    className = '',
}: TypewriterProps) {
    const [wordIndex, setWordIndex] = useState(0)
    const [subIndex, setSubIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (!words || words.length === 0) return

        const current = words[wordIndex]

        const timeout = setTimeout(() => {
            if (!isDeleting && subIndex === current.length) {
                // pause then start deleting
                setTimeout(() => setIsDeleting(true), pause)
                return
            }

            if (isDeleting && subIndex === 0) {
                setIsDeleting(false)
                setWordIndex((i) => (i + 1) % words.length)
                return
            }

            setSubIndex((i) => i + (isDeleting ? -1 : 1))
        }, isDeleting ? deletingSpeed : typingSpeed)

        return () => clearTimeout(timeout)
    }, [subIndex, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pause])

    useEffect(() => {
        if (!loop && wordIndex === words.length - 1 && subIndex === words[wordIndex].length) {
            // stop after last word typed when not looping
            return
        }
    }, [loop, wordIndex, subIndex, words])

    return (
        <span className={className} aria-live="polite">
            <span>{words[wordIndex].slice(0, subIndex)}</span>
            <span className="typewriter-caret" aria-hidden />
        </span>
    )
}
