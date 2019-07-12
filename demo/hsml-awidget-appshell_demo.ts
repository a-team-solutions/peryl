import { AWidget, Action, Manage, Class } from "../src/hsml-awidget";
import { Hsmls, Hsml } from "../src/hsml";
import { Hash } from "../src/hash";

export interface SidebarModel {
    title: string;
}

export enum SidebarActions {
    title = "title",
}

export class Sidebar extends AWidget<SidebarModel> {

    model = {
        title: "Sidebar"
    };

    view(model: SidebarModel, action: Action, manage: Manage): Hsmls {
        const menu = [
            { url: "#", label: "Home", icon: "i.fas.fa-fw.fa-info" },
            { url: "#Content", label: "Content", icon: "i.fas.fa-fw.fa-users" },
            { url: "#Sidebar", label: "Sidebar", icon: "i.fas.fa-fw.fa-bell" }
        ];
        const nbsp = "\u00a0 ";
        return [
            ["div.w3-container", [
                ["h2", [model.title, " ", this.id]],
                ["div.w3-bar-block", {},
                    menu.map<Hsml>(m => (
                        ["a.w3-bar-item.w3-button.w3-padding",
                            {
                                href: m.url,
                                // classes: [["w3-light-grey", m.url === activeMenuItem]]
                            },
                            [
                                [m.icon], nbsp, m.label
                            ]
                        ])
                    )
                ]
            ]]
        ];
    }

    actions(action: string, data: any, widget: AWidget<SidebarModel>): void {
        console.log("action:", action, data);
        switch (action) {
            case SidebarActions.title:
                widget.update({ title: data as string });
                break;
            default:
                widget.appAction(action, data);
        }
    }
}

export interface ContentModel {
    title: string;
}

export enum ContentActions {
    title = "title",
}

export class Content extends AWidget<ContentModel> {

    model = {
        title: "Content"
    };

    view(model: ContentModel, action: Action, manage: Manage): Hsmls {
        return [
            ["h1", [model.title, ": ", this.id]],
            ["p", ["text text text"]]
        ];
    }

    actions(action: string, data: any, widget: AWidget<ContentModel>): void {
        console.log("action:", action, data);
        switch (action) {
            case ContentActions.title:
                widget.update({ title: data as string });
                break;
            default:
                widget.appAction(action, data);
        }
    }
}

export interface AppShellModel {
    title: string;
    subtitle: string;
    menu: boolean;
    sidebar: Class<AWidget<any>>;
    content: Class<AWidget<any>>;
    snackbar: string;
}

export enum AppShellActions {
    title = "title",
    subtitle = "subtitle",
    menu = "menu",
    sidebar = "sidebar",
    content = "content",
    snackbar = "snackbar"
}

export class AppShell extends AWidget<AppShellModel> {

    model = {
        title: "Title",
        subtitle: "Subtitle",
        menu: false,
        sidebar: Sidebar,
        content: Content,
        snackbar: ""
    };

    view(model: AppShellModel, action: Action, manage: Manage): Hsmls {
        return [
            // header
            ["div.w3-bar.w3-top.w3-large.w3-blue.w3-card", { style: "z-index:4" }, [
                ["button.w3-bar-item.w3-button.w3-hide-large.w3-hover-none.w3-hover-text-light-grey",
                    {
                        accesskey: "m",
                        "aria-label": "Menu",
                        on: ["click", AppShellActions.menu]
                    },
                    [["i.fas.fa-bars"]],
                ],
                ["span.w3-bar-item", [
                    ["strong.w3-hide-small", [
                        ["a", { href: "#", style: "text-decoration: none;" }, [
                            model.title
                        ]]
                    ]],
                    ["span.w3-hide-small", [model.subtitle ? " - " : ""]],
                    ["span", [model.subtitle ? model.subtitle : ""]],
                ]],
                ["a.w3-bar-item.w3-right.w3-hover-light-grey",
                    {
                        href: "https://gitlab.com/peter-rybar/prest-lib",
                        title: "GitLab repository",
                        target: "_blank",
                        rel: "noopener"
                    },
                    [["i.fab.fa-gitlab"]]
                ],
                ["a.w3-bar-item.w3-right.w3-hover-light-grey",
                    {
                        href: `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(location.href)}&title=${encodeURIComponent(model.title)}&source=${encodeURIComponent(location.href)}`,
                        title: "Share on LinkedIn",
                        style: "padding-right: 3px; padding-left: 3px;",
                        target: "_blank",
                        rel: "noopener"
                    },
                    [["i.fab.fa-linkedin-in"]]
                ],
                ["a.w3-bar-item.w3-right.w3-hover-light-grey",
                    {
                        href: `https://twitter.com/intent/tweet?source=${encodeURIComponent(location.href)}&text=${encodeURIComponent(model.title)}:%20${encodeURIComponent(location.href)}`,
                        title: "Tweet",
                        style: "padding-right: 3px; padding-left: 3px;",
                        target: "_blank",
                        rel: "noopener"
                    },
                    [["i.fab.fa-twitter"]]
                ],
                ["a.w3-bar-item.w3-right.w3-hover-light-grey",
                    {
                        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}&quote=${encodeURIComponent(model.title)}`,
                        title: "Share on Facebook",
                        style: "padding-right: 3px; padding-left: 3px;",
                        target: "_blank",
                        rel: "noopener"
                    },
                    [["i.fab.fa-facebook-f"]]
                ]
            ]],
            // sidebar
            ["div#sidebar.w3-sidebar.w3-collapse.w3-card.w3-animate-left~sidebar",
                {
                    styles: {
                        zIndex: "3",
                        width: "300px",
                        display: model.menu ? "block" : "none"
                    }
                },
                manage<any>(model.sidebar)
            ],
            // overlay
            ["div#overlay.w3-overlay.w3-hide-large.w3-animate-opacity~overlay",
                {
                    styles: {
                        cursor: "pointer",
                        display: model.menu ? "block" : "none"
                    },
                    title: "close side menu",
                    on: ["click", AppShellActions.menu]
                }
            ],
            // main
            ["div.w3-main", { style: "margin-left:300px;margin-top:43px;" }, [
                ["div.w3-container~content",
                    manage<any>(model.content)
                ]
            ]],
            // snackbar
            ["div#snackbar~snackbar", { classes: [["show", !!model.snackbar]] },
                [model.snackbar]
            ]
        ];
    }

    actions(action: string, data: any, widget: AWidget<AppShellModel>): void {
        console.log("action:", action, data);
        switch (action) {
            case AppShellActions.title:
                widget.update({ title: data as string });
                break;
            case AppShellActions.subtitle:
                widget.update({ subtitle: data as string });
                break;
            case AppShellActions.menu:
                widget.update({ menu: data === null ? !widget.model.menu : data });
                break;
            case AppShellActions.sidebar:
                widget.update({ sidebar: data as any });
                break;
            case AppShellActions.content:
                widget.update({ content: data as any });
                break;
            case AppShellActions.snackbar:
                widget.update({ snackbar: data as string });
                setTimeout(widget.update, 3e3, { snackbar: undefined });
                break;
            default:
                widget.appAction(action, data);
        }
    }
}


function appActions(action: string, data: any, widget: AWidget<AppShellModel>) {
    console.log("app action", widget.type, action, data);
    switch (action) {
        case "xXx":
            widget.update({ title: "xXx" });
            break;
    }
}

const app = new AppShell()
    .appActions(appActions)
    .mount(document.getElementById("app"));

setTimeout(() => {
    app.action(AppShellActions.snackbar, "Message");
}, 1e3);

const contents: { [k: string]: Class<AWidget<any>> } = {
    Content: Content,
    Sidebar: Sidebar
};

new Hash<string>()
    .coders(
        data => encodeURIComponent(data),
        str => decodeURIComponent(str)
    )
    .onChange(data => {
        console.log("hash: " + JSON.stringify(data));
        app.action(AppShellActions.menu, false);
        app.action(AppShellActions.content, contents[data] || Content);
    })
    .listen();

(self as any).app = app;
