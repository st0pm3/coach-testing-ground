import {
    Outlet,
    Scripts,
    ScrollRestoration,
    Meta,
    Links
} from "react-router";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

import "./index.css";

function App() {
    return <html>
        <head>
            <title>The Best App</title>

            <link rel="icon" href="/favicon.ico"/>

            <Meta/>
            <Links/>
        </head>

        <body>
            <MantineProvider>
                <Outlet/>
            </MantineProvider>

            <ScrollRestoration/>
            <Scripts/>
        </body>
    </html>;
}

export default App;