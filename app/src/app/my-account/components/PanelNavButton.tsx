'use client'

import React from 'react'

type PanelNavButtonProps = {
    className: string;
    isActive?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    trailing?: React.ReactNode;
}

export default React.memo(function PanelNavButton({
    className,
    isActive = false,
    onClick,
    children,
    trailing,
}: PanelNavButtonProps) {
    return (
        <button
            type="button"
            className={`${className} text-left border-none bg-transparent ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            {children}
            {trailing}
        </button>
    )
})
