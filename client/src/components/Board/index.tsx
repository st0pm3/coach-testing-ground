import { useEffect, useState } from "react";
import { Chessboard, defaultPieces } from "react-chessboard";
import { Center } from "@mantine/core";
import {
    charToRole,
    Chess,
    NormalMove,
    parseSquare,
    Role,
    ROLE_CHARS,
    RoleChar,
    Square,
    squareFile,
    SquareName,
    SquareSet
} from "chessops";
import { makeFen } from "chessops/fen";

import { playBoardSound } from "@/lib/board-sounds";
import styles from "./Board.module.css";

interface Props {
    position: Chess;
    flipped?: boolean;
    playedMove?: NormalMove;
    extraHighlights?: Square[];
    onMovePlayed?: (move: NormalMove) => void;
    onHighlightsCleared?: () => void;
}

type ColourChar = "w" | "b";
type Promotion = NormalMove & { colour: ColourChar };

function getRoleChars(colour?: ColourChar, promotable = true) {
    const colourRoleChars = (colour: ColourChar) => ROLE_CHARS
        .filter(char => !promotable || (char != "k" && char != "p"))
        .map(char => `${colour}${char.toUpperCase()}`);

    return colour
        ? colourRoleChars(colour)
        : colourRoleChars("w").concat(colourRoleChars("b"));
}

function Board({
    position,
    flipped,
    playedMove,
    extraHighlights,
    onMovePlayed,
    onHighlightsCleared
}: Props) {
    const [ held, setHeld ] = useState<Square>();
    const [ highlighted, setHighlighted ] = useState<string[]>([]);

    const [ promotionMove, setPromotionMove ] = useState<Promotion>();

    useEffect(() => {
        if (highlighted.length == 0) onHighlightsCleared?.();
    }, [highlighted])

    const getSquareColour = (square: string) => {
        const parsedSquare = parseSquare(square);
        if (!parsedSquare) return;

        if (highlighted.includes(square))
            return "#eb6150cc";
        
        if (extraHighlights?.includes(parsedSquare))
            return "#5093eba4";

        if (
            playedMove?.from == parsedSquare
            || playedMove?.to == parsedSquare
        ) return "#ffff3354";
    };

    const playMove = (move: NormalMove) => {
        playBoardSound(position, move);
        onMovePlayed?.(move);
    };

    const handlePromotion = (piece: Role) => {
        if (!promotionMove) return;

        playMove({ ...promotionMove, promotion: piece });
        setPromotionMove(undefined);
    };

    const board = <Chessboard options={{
        position: makeFen(position.toSetup()),
        boardOrientation: flipped ? "black" : "white",
        dragActivationDistance: 0,
        draggingPieceGhostStyle: { opacity: 0 },
        onSquareRightClick: ({ square }) => {
            setHighlighted(prev => prev.includes(square)
                ? prev.filter(sq => sq != square)
                : [...prev, square]
            );
        },
        onSquareClick: () => {
            setHighlighted([]);
            setPromotionMove(undefined);
        },
        onPieceDrag: ({ square }) => {
            setHighlighted([]);
            setHeld(parseSquare(square as SquareName));
            setPromotionMove(undefined);
        },
        onPieceDrop: ({ piece, sourceSquare, targetSquare }) => {
            setHeld(undefined);

            const from = parseSquare(sourceSquare);
            const to = targetSquare != null 
                ? parseSquare(targetSquare)
                : undefined;
            if (from == undefined || to == undefined) return false;

            const dests = position.dests(from);
            if (!dests.has(to)) return false;

            const move: NormalMove = { from, to };

            const backrankDests = dests.intersect(SquareSet.backranks());
            if (piece.pieceType.endsWith("P") && backrankDests.has(to)) {
                setPromotionMove({
                    ...move,
                    colour: piece.pieceType.charAt(0) == "w" ? "w" : "b"
                });
                
                return false;
            }

            playMove(move);
            return true;
        },
        squareRenderer: ({ square, children }) => {
            const parsedSquare = parseSquare(square as SquareName);

            const isDestination = held != undefined
                && position.dests(held).has(parsedSquare);
            const hasPiece = !!position.board.get(parsedSquare);

            return <Center style={{
                backgroundColor: getSquareColour(square),
                width: "100%",
                height: "100%",
                alignItems: "start"
            }}>
                {isDestination && <div className={hasPiece
                    ? styles.captureDestCircle
                    : styles.destCircle
                }/>}

                {children}
            </Center>
        },
        dropSquareStyle: { boxShadow: "0 0 0px 5px #fff inset" }
    }}/>;

    return <div className={styles.wrapper}>
        {board}

        {promotionMove && <div
            className={styles.promotionDialog}
            style={{
                top: promotionMove.colour == "w" ? 0 : "50%",
                left: `${squareFile(promotionMove.to) * 12.5}%`
            }}
        >
            {(promotionMove.colour == "w"
                ? getRoleChars(promotionMove.colour)
                : getRoleChars(promotionMove.colour).reverse()
            ).map(char => <div
                className={styles.promotionPiece}
                onClick={() => handlePromotion(
                    charToRole(char.charAt(1).toLowerCase() as RoleChar)
                )}
            >
                {defaultPieces[char]({ svgStyle: { width: "100%" } })}
            </div>)}
        </div>}
    </div>
}

export default Board;