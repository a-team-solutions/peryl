import { html, htmls } from "../src/hsml-sva";
import { AppShellModel, AppShell, Sidebar } from "./hsml-svac-appshell-components_demo";

html<AppShellModel>(AppShell, AppShell.model, (html: string) => console.log(html), true);

AppShell.model.content = Sidebar;
const h = htmls<AppShellModel>(AppShell, AppShell.model, true);
console.log(h);
