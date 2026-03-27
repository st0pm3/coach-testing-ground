import { Suspense, useEffect, useMemo, useState } from "react";
import { Card, Center, Group, Loader } from "@mantine/core";
import { NormalMove, Square } from "chessops";
import { makeFen } from "chessops/fen";
import { BrowserEngine } from "wintrchess/engine";
import {
    buildSystemPrompt,
    buildUserPrompt,
    Coach,
    ExplanationOptions
} from "wintrchess/coach";
import { chessFromFen, withMove } from "wintrchess/utils";
import {
    contextualizeMove,
    defaultPositionNode,
    PositionNode
} from "wintrchess/types";

import { Route } from "./+types";
import Board from "@/components/Board";
import SpeechBubble from "@/components/SpeechBubble";
import ParsedSpeech from "@/components/ParsedSpeech";
import styles from "./Home.module.css";

export async function clientLoader() {
    return await BrowserEngine.create(
        "/engines/stockfish-18-lite-single.js"
    );
}

function Home({ loaderData: engine }: Route.ComponentProps) {
    const [ positionNode, setPositionNode ] = useState(defaultPositionNode);

    const [ prompt, setPrompt ] = useState<string>();
    const [ speech, setSpeech ] = useState<string | null>(
        "Hello! Let's play some Chess!"
    );

    const [ extraHighlights, setExtraHighlights ] = useState<Square[]>([]);

    const coach = useMemo(() => new Coach({
        engine: engine,
        llm: {
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: import.meta.env.VITE_OPENAI_KEY,
            dangerouslyAllowBrowser: true
        }
    }), []);

    useEffect(() => {
        if (positionNode.move?.piece.color == "white")
            getExplanation();
    }, [positionNode]);

    const getExplanation = async () => {
        setSpeech(null);

        const assessment = await coach.createAssessment({
            position: chessFromFen(positionNode.fen),
            move: positionNode.move,
            logs: true
        });

        const explanationOptions = {
            model: "anthropic/claude-sonnet-4.6",
            person: "second",
            rawResponse: true,
            logs: true
        } as const satisfies ExplanationOptions;

        setPrompt(
            buildSystemPrompt(explanationOptions)
            + "\n"
            + buildUserPrompt(assessment)
        );

        const explanation = await coach.createExplanation(
            assessment, explanationOptions
        );

        setSpeech(explanation);
    };

    const onMovePlayed = (move: NormalMove) => {
        const currentPos = chessFromFen(positionNode.fen);
        const nextPos = withMove(currentPos, move);

        const newNode: PositionNode = {
            parent: positionNode,
            children: [],
            move: contextualizeMove(currentPos, move),
            isMainline: true,
            fen: makeFen(nextPos.toSetup())
        };

        positionNode.children.push(newNode);
        setPositionNode(newNode);
    };

    const content = <Group className={styles.wrapper}>
        <Card withBorder className={styles.boardCard}>
            <Board
                position={chessFromFen(positionNode.fen)}
                playedMove={positionNode.move}
                onMovePlayed={onMovePlayed}
                onHighlightsCleared={() => setExtraHighlights([])}
                extraHighlights={extraHighlights}
            />
        </Card>

        <Card withBorder className={styles.analysisCard}>
            <Group align="start" gap={0} w="100%" wrap="nowrap">
                <img
                    className={styles.coachIcon}
                    src="/coaches/petergriffin.png"
                />

                <SpeechBubble className={styles.speechBubble}>
                    {speech ? <ParsedSpeech
                        speech={speech}
                        onSquareHighlight={sq => setExtraHighlights([sq])}
                    /> : <Loader/>}

                    {/* {speech
                        ? speech?.split("\n").map(bit => <span>{bit}</span>)
                        : <Loader/>
                    } */}
                </SpeechBubble>
            </Group>
            
            <div className={styles.promptArea}>
                {prompt?.split("\n").map(bit => <div key={bit}>
                    <span>{bit}</span>
                    <br/>
                </div>)}
            </div>
        </Card>
    </Group>;

    return <Suspense fallback={<Loader/>}>
        <Center p="64px 16px">{content}</Center>
    </Suspense>;
}

export function HydrateFallback() {
    return <Center h="100vh">
        <Loader/>
    </Center>;
}

export default Home;