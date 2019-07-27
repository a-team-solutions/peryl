import { html, htmls } from "../src/hsml-sva-html";
import { AppShellState, AppShell, Sidebar } from "./hsml-sva-appshell-components_demo";

html<AppShellState>(AppShell, AppShell.state, (html: string) => console.log(html), true);

AppShell.state.content = Sidebar;
const h = htmls<AppShellState>(AppShell, AppShell.state, true);
console.log(h);
