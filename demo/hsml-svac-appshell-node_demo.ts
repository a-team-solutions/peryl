import { svacHtml, svacHtmls } from "../src/hsml-svac";
import { AppShellState, appShellState, appShellView, sidebar } from "./hsml-svac-appshell-components_demo";

svacHtml<AppShellState>(appShellState, appShellView, (html: string) => console.log(html), true);

appShellState.content = sidebar;
const h = svacHtmls<AppShellState>(appShellState, appShellView, true);
console.log(h);
