import { ctrlHtml, ctrlHtmls } from "../src/hsml-ctrl";
import { AppShellState, appShellState, appShellView, sidebar } from "./hsml-ctrl-appshell-components_demo";

ctrlHtml<AppShellState>(appShellState, appShellView, (html: string) => console.log(html), true);

appShellState.content = sidebar;
const h = ctrlHtmls<AppShellState>(appShellState, appShellView, true);
console.log(h);
