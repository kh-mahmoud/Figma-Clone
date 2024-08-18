


type Props = {
  cursor: { x: number; y: number } | null ;
  setReaction: (reaction: string) => void;
};

export default function ReactionSelector({ cursor, setReaction }: Props) {
  return (
    <div
      onPointerMove={(e) => e.stopPropagation()}
      className=" absolute top-3 left-2 w-fit   rounded-full bg-white px-2"
      style={{ transform: `translateX(${cursor?.x}px) translateY(${cursor?.y}px)` }}
    >

      <ReactionButton reaction="👍" onSelect={setReaction} />
      <ReactionButton reaction="🔥" onSelect={setReaction} />
      <ReactionButton reaction="😍" onSelect={setReaction} />
      <ReactionButton reaction="👀" onSelect={setReaction} />
      <ReactionButton reaction="😱" onSelect={setReaction} />
      <ReactionButton reaction="🙁" onSelect={setReaction} />
    </div>
  );
}



function ReactionButton({ reaction, onSelect }: { reaction: string; onSelect: (reaction: string) => void }) {
  return (
    <button
      className="transform select-none p-2 text-xl transition-transform hover:scale-150 focus:scale-150 focus:outline-none"
      onPointerDown={() => onSelect(reaction)}
    >
      {reaction}
    </button>
  );
}