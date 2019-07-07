import { html, htmls } from "../src/hsml-mva-html";
import { AppShellModel, AppShell, Sidebar } from "./hsml-mva-appshell-components_demo";

html<AppShellModel>(AppShell, AppShell.model, (html: string) => console.log(html), true);

AppShell.model.content = Sidebar;
const h = htmls<AppShellModel>(AppShell, AppShell.model, true);
console.log(h);
