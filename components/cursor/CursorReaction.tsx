import {CursorMode, CursorState } from '@/types/type';
import React, { memo } from 'react';


type Props = {
    cursor: { x: number; y: number };
    cursorState: CursorState;
}

const CursorReaction = ({ cursor, cursorState }: Props) => {


    return (
        <div
            style={{ transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)` }}
            className='absolute top-0'
        >
            {cursorState.mode === CursorMode.Reaction && (
                <>
                    <div className='absolute top-3 left-2 '>

                        {cursorState.reaction}

                    </div>
                </>
            )}

        </div>
    );
}

export default memo(CursorReaction);
