import CursorSVG from "@/public/assets/CursorSVG"



type Props = {
    color: string
    x: string
    y: string
    message: string
}



const Cursor = ({ color, x, y, message }: Props) => {
    return (
        <div
            className={`pointer-events-none  absolute top-0 left-0`}
            style={{ transform: `translateX(${x}px) translateY(${y}px)` }}>
            <CursorSVG color={color} />

            {message && (
                <div style={{ background: color }} className="absolute left-2 top-5 rounded-3xl px-4 py-2">
                    <p className="text-white text-sm leading-relaxed whitespace-nowrap">{message}</p>
                </div>
            )}

        </div>
    );
}

export default Cursor;
