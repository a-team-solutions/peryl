import { AWidget, Action, Manage, Class } from "../src/hsml-awidget";
import { Hsmls, Hsml } from "../src/hsml";
import { Hash } from "../src/hash";

export interface SidebarState {
    title: string;
}

export enum SidebarActions {
    title = "title",
}

export class Sidebar extends AWidget<SidebarState> {

    state = {
        title: "Sidebar"
    };

    view(state: AppShellState, action: Action, manage: Manage): Hsmls {
        const menu = [
            { url: "#", label: "Home", icon: "i.fas.fa-fw.fa-info" },
            { url: "#Content", label: "Content", icon: "i.fas.fa-fw.fa-users" },
            { url: "#Sidebar", label: "Sidebar", icon: "i.fas.fa-fw.fa-bell" }
        ];
        const nbsp = "\u00a0 ";
        return [
            ["div", [
                ["h2", [state.title, " ", this.id]],
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

    onAction(action: string, data: any, widget: AWidget<SidebarState>): void {
        console.log("action:", action, data);
        switch (action) {
            case SidebarActions.title:
                widget.update({ title: data as string });
                break;
            default:
                widget.actionGlobal(action, data);
        }
    }
}

export interface ContentState {
    title: string;
}

export enum ContentActions {
    title = "title",
}

export class Content extends AWidget<ContentState> {

    state = {
        title: "Content"
    };

    view(state: AppShellState, action: Action, manage: Manage): Hsmls {
        return [
            ["h1", [state.title, ": ", this.id]]
        ];
    }

    onAction(action: string, data: any, widget: AWidget<ContentState>): void {
        console.log("action:", action, data);
        switch (action) {
            case ContentActions.title:
                widget.update({ title: data as string });
                break;
            default:
                widget.actionGlobal(action, data);
        }
    }
}

export interface AppShellState {
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

export class AppShell extends AWidget<AppShellState> {

    state = {
        title: "Title",
        subtitle: "Subtitle",
        menu: false,
        sidebar: Sidebar,
        content: Content,
        snackbar: ""
    };

    view(state: AppShellState, action: Action, manage: Manage): Hsmls {
        return [
            // header
            ["div.w3-bar.w3-top.w3-large.w3-blue.w3-card", { style: "z-index:4" }, [
                ["button.w3-bar-item.w3-button.w3-hide-large.w3-hover-none.w3-hover-text-light-grey",
                    {
                        accesskey: "m",
                        "aria-label": "Menu",
                        on: ["click", AppShellActions.menu, null]
                    },
                    [["i.fas.fa-bars"]],
                ],
                ["span.w3-bar-item", [
                    ["strong.w3-hide-small", [
                        ["a", { href: "#", style: "text-decoration: none;" }, [
                            state.title
                        ]]
                    ]],
                    ["span.w3-hide-small", [state.subtitle ? " - " : ""]],
                    ["span", [state.subtitle ? state.subtitle : ""]],
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
                        href: `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(location.href)}&title=${encodeURIComponent(state.title)}&source=${encodeURIComponent(location.href)}`,
                        title: "Share on LinkedIn",
                        style: "padding-right: 3px; padding-left: 3px;",
                        target: "_blank",
                        rel: "noopener"
                    },
                    [["i.fab.fa-linkedin-in"]]
                ],
                ["a.w3-bar-item.w3-right.w3-hover-light-grey",
                    {
                        href: `https://twitter.com/intent/tweet?source=${encodeURIComponent(location.href)}&text=${encodeURIComponent(state.title)}:%20${encodeURIComponent(location.href)}`,
                        title: "Tweet",
                        style: "padding-right: 3px; padding-left: 3px;",
                        target: "_blank",
                        rel: "noopener"
                    },
                    [["i.fab.fa-twitter"]]
                ],
                ["a.w3-bar-item.w3-right.w3-hover-light-grey",
                    {
                        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}&quote=${encodeURIComponent(state.title)}`,
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
                        display: state.menu ? "block" : "none"
                    }
                },
                manage<any>(state.sidebar)
            ],
            // overlay
            ["div#overlay.w3-overlay.w3-hide-large.w3-animate-opacity~overlay",
                {
                    styles: {
                        cursor: "pointer",
                        display: state.menu ? "block" : "none"
                    },
                    title: "close side menu",
                    on: ["click", AppShellActions.menu, null]
                }
            ],
            // main
            ["div.w3-main", { style: "margin-left:300px;margin-top:43px;" }, [
                ["div.w3-container~content",
                    manage<any>(state.content)
                ]
            ]],
            // snackbar
            ["div#snackbar~snackbar", { classes: [["show", !!state.snackbar]] },
                [state.snackbar]
            ]
        ];
    }

    onAction(action: string, data: any, widget: AWidget<AppShellState>): void {
        console.log("action:", action, data);
        switch (action) {
            case AppShellActions.title:
                widget.update({ title: data as string });
                break;
            case AppShellActions.subtitle:
                widget.update({ subtitle: data as string });
                break;
            case AppShellActions.menu:
                widget.update({ menu: data === null ? !widget.state.menu : data });
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
                widget.actionGlobal(action, data);
        }
    }
}


function onActionGlobal(action: string, data: any, widget: AWidget<AppShellState>) {
    console.log(action, data, widget);
    switch (action) {
        case "xXx":
            widget.update({ title: "xXx" });
            break;
    }
}

const app = new AppShell()
    .onActionGlobal(onActionGlobal)
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
        if (data) {
            app.action(AppShellActions.content, contents[data]);
        } else {
            app.action(AppShellActions.content, Content);
        }
    })
    .listen();

(self as any).app = app;
