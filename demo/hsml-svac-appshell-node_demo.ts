import { html, htmls } from "../lib/hsml-svac-html";
import { AppShellState, AppShell, Sidebar } from "./hsml-svac-appshell-components_demo";

html<AppShellState>(AppShell, AppShell.state, (html: string) => console.log(html), true);

AppShell.state.content = Sidebar;
const h = htmls<AppShellState>(AppShell, AppShell.state, true);
console.log(h);
