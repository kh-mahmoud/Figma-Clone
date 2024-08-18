import { CursorChatProps, CursorMode } from '@/types/type';
import React, { memo } from 'react';

const CursorChat = ({ cursor, cursorState, setCursorState, updateMyPresence }: CursorChatProps) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: e.target.value })

    setCursorState({
      mode: CursorMode.Chat,
      message: e.target.value,
      previousMessage: null
    })

  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && cursorState.mode === CursorMode.Chat) {
      setCursorState({
        mode: CursorMode.Chat,
        message: "",
        previousMessage: cursorState.message
      })
    } else if (e.key === 'Escape') {
      setCursorState({
        mode: CursorMode.Hidden,
      })
    }

  }



  return (
    <div
      style={{ transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)` }}
      className='absolute top-0 '
    >
      {cursorState.mode === CursorMode.Chat && (
        <>
          <div
            className="absolute top-3 left-2 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white rounded-[20px]"
            onKeyUp={(e) => e.stopPropagation()}
          >
            {cursorState.previousMessage &&
              <div>
                {cursorState.previousMessage}
              </div>
            }

            <input
              type="text"
              className='w-60 border-none text-white bg-transparent outline-none placeholder-blue-300'
              autoFocus
              placeholder={cursorState.previousMessage ? '' : "type message..."}
              value={cursorState.message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={50}
            />
          </div>
        </>
      )}

    </div>
  );
}

export default memo(CursorChat);
