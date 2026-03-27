import { ReactNode } from "react";

import styles from "./ParsedSpeech.module.css";

interface Props {
    children?: ReactNode;
    onClick?: () => void;
}

function Highlight({ children, onClick }: Props) {
    return <span className={styles.highlight} onClick={onClick}>
        {children}
    </span>;
}

export default Highlight;