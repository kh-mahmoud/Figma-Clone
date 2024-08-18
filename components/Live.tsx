'use client'

import { useCallback, useEffect, useState } from 'react';
import LiveCursors from './cursor/LiveCursors';
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from '@liveblocks/react';
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type';
import CursorChat from './cursor/CursorChat';
import ReactionSelector from './reaction/ReactionButton';
import CursorReaction from './cursor/CursorReaction';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/lib/hooks/useInterval';
import { Comments } from './comments/Comments';


type Props = {
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
}


const Live = ({ canvasRef }: Props) => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence();
    const [CursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const broadcast = useBroadcastEvent();

    //track cursor movments in the live board
    const handlePointerMove = useCallback((event: React.PointerEvent) => {

        if (cursor == null || CursorState.mode !== CursorMode.ReactionSelector) {
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
            updateMyPresence({
                cursor: {
                    x: Math.round(x),
                    y: Math.round(y),
                },
            });
        }
    }, [updateMyPresence, cursor, CursorState.mode]);

    //stop the track out the live board
    const handlePointerLeave = useCallback(() => {
        updateMyPresence({ cursor: null });
    }, [updateMyPresence]);

    //track the cursor when click down
    const handlePointerDown = useCallback((event: React.PointerEvent) => {

        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({
            cursor: {
                x: Math.round(x),
                y: Math.round(y),
            },
        });

        setCursorState((state) => state.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state);
    }, [updateMyPresence]);


    //track the cursor when click up
    const handlePointerUp = useCallback(() => {
        setCursorState((state) => state.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state);
    }, []);

    //change the reaction and cursor mode
    const setReaction = useCallback((reaction: string) => {
        setCursorState({
            mode: CursorMode.Reaction,
            reaction,
            isPressed: false
        });
    }, []);


    //handle key event listners
    useEffect(() => {
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === '/') {
                setCursorState({
                    mode: CursorMode.Chat,
                    message: "",
                    previousMessage: null
                });
            } else if (e.key === 'Escape') {
                updateMyPresence({ message: '' });
                setCursorState({ mode: CursorMode.Hidden });
            } else if (e.key === 'e') {
                setCursorState({ mode: CursorMode.ReactionSelector });
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                return;
            }
            if (e.key === 'e' || e.key === '/') {
                e.preventDefault();
            }
        };

        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [updateMyPresence]);


    // Remove reactions that are not visible anymore (every 1 sec)
    useInterval(() => {
        setReactions((reactions) =>
            reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
        );
    }, 1000);

    //display reaction when pointer down
    useInterval(() => {
        if (CursorState.mode === CursorMode.Reaction && CursorState.isPressed && cursor) {
            setReactions((reactions) =>
                reactions.concat([
                    {
                        point: { x: cursor.x, y: cursor.y },
                        value: CursorState.reaction,
                        timestamp: Date.now(),
                    },
                ])
            );
            //broadcast the info for other users
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: CursorState.reaction,
            });
        }
    }, 100);

    //listen to the broadcaated event and use the data
    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        setReactions((reactions) =>
            reactions.concat([
                {
                    point: { x: event.x, y: event.y },
                    value: event.value,
                    timestamp: Date.now(),
                },
            ])
        );
    });


    return (
        <div className="h-[calc(100vh-60px)] relative  w-full overflow-hidden"
            id='canvas'
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >

            <canvas  ref={canvasRef} />

            {reactions.map((reaction) => {
                return (
                    <FlyingReaction
                        key={reaction.timestamp.toString()}
                        x={reaction.point.x}
                        y={reaction.point.y}
                        timestamp={reaction.timestamp}
                        value={reaction.value}
                    />
                );
            })}

            {cursor && CursorState.mode === CursorMode.Chat &&
                <CursorChat
                    cursor={cursor}
                    cursorState={CursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            }

            {cursor && CursorState.mode === CursorMode.Reaction &&
                <CursorReaction
                    cursor={cursor}
                    cursorState={CursorState}
                />
            }

            {CursorState.mode === CursorMode.ReactionSelector &&
                <ReactionSelector cursor={cursor} setReaction={setReaction} />
            }

            <LiveCursors others={others} />

        </div>
    );
};

export default Live;
