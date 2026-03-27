import { CSSProperties, ReactNode } from "react";
import { IconTriangleFilled } from "@tabler/icons-react";

import styles from "./SpeechBubble.module.css";

interface Props {
    children?: ReactNode;
    className?: string;
    backgroundColour?: CSSProperties["backgroundColor"];
}

function SpeechBubble({
    children,
    backgroundColour = "whitesmoke",
    className
}: Props) {
    return <div className={styles.wrapper}>
        <IconTriangleFilled
            className={styles.notch}
            color={backgroundColour}
        />

        <div className={`${styles.content} ${className}`} style={{
            backgroundColor: backgroundColour
        }}>
            {children}
        </div>
    </div>;
}

export default SpeechBubble;