import { html, htmls } from "../src/hsml-svac";
import { AppShellState, appShell, sidebar } from "./hsml-svac-appshell-components_demo";

html<AppShellState>(appShell, appShell.state, (html: string) => console.log(html), true);

appShell.state.content = sidebar;
const h = htmls<AppShellState>(appShell, appShell.state, true);
console.log(h);
