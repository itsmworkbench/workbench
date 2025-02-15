import React, { ReactNode, useRef } from "react";


export interface MouseOverProps {
    children: ReactNode;
    linkHover?: string;
    changeColour?: (colour: string) => void;
}

export type MouseOver = (props: MouseOverProps) => ReactNode;
export const SimpleMouseOver: MouseOver = ({ children, changeColour, linkHover = "blue" }: MouseOverProps) => {
    const PreserveColour = useRef<string | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
        const elem = e.currentTarget.firstElementChild as HTMLElement | null;
        if (elem && elem.style.color) {
            PreserveColour.current = elem.style.color;
            elem.style.color = linkHover;
            changeColour?.(linkHover);
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        const elem = e.currentTarget.firstElementChild as HTMLElement | null;
        const colour = PreserveColour.current;
        if (elem && colour) {
            elem.style.color = colour;
            changeColour?.(colour);
        }
    };

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {children}
        </div>
    );
};
