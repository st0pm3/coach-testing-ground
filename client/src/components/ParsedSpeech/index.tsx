import { useMemo } from "react";
import { makeSquare, Square } from "chessops";
import { tokenizeExplanation } from "wintrchess/coach";

import Highlight from "./Highlight";

interface Props {
    speech: string;
    onSquareHighlight?: (square: Square) => void;
}

function ParsedSpeech({ speech, onSquareHighlight }: Props) {
    const tokens = useMemo(() => tokenizeExplanation(speech), [speech]);

    return <div>
        {tokens.map(token => {
            if (token.type == "text") return <span>
                {token.text}
            </span>;

            if (token.type == "square") return <Highlight
                onClick={() => onSquareHighlight?.(token.square)}
            >
                {makeSquare(token.square)}
            </Highlight>;

            if (token.type == "piece") return <Highlight
                onClick={() => onSquareHighlight?.(token.square)}
            >
                {token.role}
                {token.full && ` on ${makeSquare(token.square)}`}
            </Highlight>;
        })}
    </div>;
}

export default ParsedSpeech;