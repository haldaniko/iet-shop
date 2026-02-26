import React from 'react'

export const IconBag = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
)

export const IconUser = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

export const IconChevronDown = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
)

export const IconMapPin = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

// UK flag (English)
export const IconFlagUK = ({ className = "w-full h-full" }: { className?: string }) => (
    <svg
        width="100%"
        height="100%"
        viewBox="0 0 60 30"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ borderRadius: '50%', flexShrink: 0 }}
    >
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
)

// Bulgarian flag
export const IconFlagBG = ({ className = "w-full h-full" }: { className?: string }) => (
    <svg
        width="100%"
        height="100%"
        viewBox="0 0 60 30"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ borderRadius: '50%', flexShrink: 0 }}
    >
        <rect width="60" height="10" fill="#fff" />
        <rect y="10" width="60" height="10" fill="#00966E" />
        <rect y="20" width="60" height="10" fill="#D62612" />
    </svg>
)

export const IconLightbulb = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 18C9.45 18 8.97933 17.8043 8.588 17.413C8.19667 17.0217 8.00067 16.5507 8 16V14.75C7.05 14.1 6.31267 13.2667 5.788 12.25C5.26333 11.2333 5.00067 10.15 5 9C5 7.05 5.67933 5.396 7.038 4.038C8.39667 2.68 10.0507 2.00067 12 2C13.9493 1.99933 15.6037 2.67867 16.963 4.038C18.3223 5.39733 19.0013 7.05133 19 9C19 10.15 18.7373 11.2293 18.212 12.238C17.6867 13.2467 16.9493 14.084 16 14.75V16C16 16.55 15.8043 17.021 15.413 17.413C15.0217 17.805 14.5507 18.0007 14 18H10ZM10 16H14V13.7L14.85 13.1C15.5333 12.6333 16.0627 12.0377 16.438 11.313C16.8133 10.5883 17.0007 9.81733 17 9C17 7.61667 16.5123 6.43767 15.537 5.463C14.5617 4.48833 13.3827 4.00067 12 4C10.6173 3.99933 9.43833 4.487 8.463 5.463C7.48767 6.439 7 7.618 7 9C7 9.81667 7.18767 10.5877 7.563 11.313C7.93833 12.0383 8.46733 12.634 9.15 13.1L10 13.7V16ZM10 22C9.71667 22 9.47933 21.904 9.288 21.712C9.09667 21.52 9.00067 21.2827 9 21V20H15V21C15 21.2833 14.904 21.521 14.712 21.713C14.52 21.905 14.2827 22.0007 14 22H10Z" fill="currentColor" />
    </svg>
)

export const IconHelpBtn = ({ className }: { className?: string }) => (
    <svg width="78" height="55" viewBox="0 0 78 55" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="76" height="53" rx="23" stroke="black" strokeWidth="2" />
        <path d="M23.9814 38.453C24.0195 38.453 25.0985 38.2166 29.8891 35.5199C40.6683 29.4521 48.0243 21.8808 50.4873 19.1339C51.46 18.0491 51.9598 17.6744 52.3972 17.2904C55.1074 14.9108 38.234 20.1294 36.815 20.7292C33.2191 22.249 51.968 15.8039 52.6089 16.6185C52.3452 20.6051 52.9664 27.5022 53.5097 30.9499C53.6313 31.5948 53.8221 32.3414 54.0186 33.282" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
)
export const IconGoogle = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
    </svg>
)

export const IconArrowLeft = ({ className }: { className?: string }) => (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M9.4181 1C6.88323 2.95714 3.00545 6.9494 1.64272 8.62127C1.32004 9.01714 1.02756 9.4021 1.01389 9.83342C2.94138 11.6293 6.61428 12.9453 8.30198 14.0073C8.74469 14.2871 9.21642 14.567 10.0139 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

export const IconArrowRight = ({ className }: { className?: string }) => (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M1.59597 1C4.13084 2.95714 8.00862 6.9494 9.37135 8.62127C9.69403 9.01714 9.98651 9.4021 10.0002 9.83342C8.07269 11.6293 4.39979 12.9453 2.71209 14.0073C2.26938 14.2871 1.79764 14.567 1.00018 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)
