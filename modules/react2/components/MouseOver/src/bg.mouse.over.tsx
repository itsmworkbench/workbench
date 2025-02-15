import React, { ReactNode, useRef } from "react";


export interface BgMouseOverProps {
    children: ReactNode;
    bgHover?: string;
    changeColour?: (colour: string) => void;
}

export type BgMouseOver = (props: BgMouseOverProps) => ReactNode;
export const SimpleBgMouseOver: BgMouseOver = ({ children, changeColour, bgHover = "blue" }: BgMouseOverProps) => {
    const PreserveColour = useRef<string | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
        const elem = e.currentTarget.firstElementChild as HTMLElement | null;
        if (elem && bgHover) {
            PreserveColour.current = elem.style.backgroundColor;
            elem.style.backgroundColor = bgHover;
            changeColour?.(bgHover);
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        const elem = e.currentTarget.firstElementChild as HTMLElement | null;
        const colour = PreserveColour.current || "transparent";
        if (elem) {
            elem.style.backgroundColor = colour;
            changeColour?.(colour);
        }
    }

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {children}
        </div>
    );
};
