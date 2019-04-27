import { Component, Action, Manage, View, ICtrl, OnAction } from "../src/hsml-ctrl";
import { Hsmls, Hsml } from "../src/hsml";

export interface SidebarState {
    title: string;
}

export enum SidebarActions {
    title = "title",
}

export const sidebarState: SidebarState = {
    title: "Sidebar"
};

export const sidebarView: View<SidebarState> = (state: SidebarState, action: Action, manage: Manage): Hsmls => {
    const menu = [
        { url: "#", label: "Home", icon: "i.fas.fa-fw.fa-info" },
        { url: "#Content", label: "Content", icon: "i.fas.fa-fw.fa-users" },
        { url: "#Form", label: "Form", icon: "i.fas.fa-fw.fa-bell" }
    ];
    const nbsp = "\u00a0 ";
    return [
        ["div", [
            ["h2", [state.title]],
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
};

export const sidebarOnAction: OnAction<SidebarState> = (action: string, data: any, ctrl: ICtrl<SidebarState>): void => {
    console.log("action:", action, data);
    switch (action) {
        case SidebarActions.title:
            ctrl.update({ title: data as string });
            break;
        default:
            ctrl.actionGlobal(action, data);
    }
};

export const sidebar: Component<SidebarState> = [sidebarState, sidebarView, sidebarOnAction, "sidebar"];


export interface ContentState {
    title: string;
}

export enum ContentActions {
    title = "title",
}

export const contentState = {
    title: "Content"
};

export const contentView: View<ContentState> = (state: ContentState, action: Action, manage: Manage): Hsmls => {
    return [
        ["h1", [state.title]],
        ["p", ["text text text"]]
    ];
};

export const contentOnAction = (action: string, data: any, ctrl: ICtrl<ContentState>): void => {
    console.log("action:", action, data);
    switch (action) {
        case ContentActions.title:
            ctrl.update({ title: data as string });
            break;
        default:
            ctrl.actionGlobal(action, data);
    }
};

export const content: Component<ContentState> = [contentState, contentView, contentOnAction, "content"];


export interface FormState {
    title: string;
    data: { [name: string]: any };
}

export enum FormActions {
    title = "title",
    formData = "form-data",
    formSubmit = "form-submit"
}

export const formState = {
    title: "Form",
    data: {}
};

export const formView: View<FormState> = (state: FormState, action: Action, manage: Manage): Hsmls => {
    return [
        ["h1", [state.title]],
        ["form.w3-container", [
            ["p", [
                ["label", ["Name",
                    ["input.w3-input", {
                        type: "text", name: "name",
                        on: ["change", FormActions.formData]
                    }]
                ]]
            ]],
            ["p", [
                ["label", ["Age",
                    ["input.w3-input", {
                        type: "number", name: "age",
                        on: ["change", FormActions.formData]
                    }]
                ]]
            ]],
            ["p", [
                ["label", [
                    ["input.w3-check", {
                        type: "checkbox", name: "single", checked: true,
                        on: ["change", FormActions.formData]
                    }],
                    " Single"
                ]]
            ]],
            ["p", [
                ["label", [
                    ["input.w3-radio", {
                        type: "radio", name: "gender", value: "male", checked: true,
                        on: ["change", FormActions.formData]
                    }],
                    " Male"
                ]],
                ["br"],
                ["label", [
                    ["input.w3-radio", {
                        type: "radio", name: "gender", value: "female", checked: false,
                        on: ["change", FormActions.formData]
                    }],
                    " Female"
                ]]
            ]],
            ["p", [
                ["select.w3-select", {
                    name: "option",
                    on: ["change", FormActions.formData]
                }, [
                    ["option",
                        { value: "", disabled: true, selected: true },
                        ["Children"]
                    ],
                    ["option", { value: "1" }, ["1 child"]],
                    ["option", { value: "2" }, ["2 children"]],
                    ["option", { value: "3" }, ["3 children"]]
                ]]
            ]],
            ["button.w3-btn.w3-blue",
                { type: "submit", on: ["click", FormActions.formSubmit] },
                ["Submit"]
            ]
        ]]
    ];
};

function formDataCollect(e: Event, data: { [name: string]: string }): void {
    e.preventDefault();
    const el = (e.target as HTMLElement);
    const nn = el.nodeName;
    switch (nn) {
        case "INPUT":
            const iel = (el as HTMLInputElement);
            switch (iel.type) {
                case "text":
                case "number":
                case "radio":
                    data[iel.name] = iel.value;
                    break;
                case "checkbox":
                    data[iel.name] = "" + iel.checked;
                    break;
            }
            break;
        case "SELECT":
            const sel = (el as HTMLSelectElement);
            data[sel.name] = sel.value;
            break;
        default:
            console.warn("unknowen form element", nn);
            return undefined;
    }
}

export const formOnAction = (action: string, data: any, ctrl: ICtrl<FormState>): void => {
    console.log("action:", action, data);
    switch (action) {
        case FormActions.title:
            ctrl.update({ title: data as string });
            break;
        case FormActions.formData:
            formDataCollect(data, ctrl.state.data);
            // TODO: formDataValidate(ctrl.state.data);
            break;
        case FormActions.formSubmit:
            data.preventDefault();
            console.dir(JSON.stringify(ctrl.state.data, null, 4));
            ctrl.actionGlobal(action, ctrl.state.data);
            break;
        default:
            ctrl.actionGlobal(action, data);
    }
    // console.log(ctrl.state.data);
};

export const form: Component<FormState> = [formState, formView, formOnAction, "form"];


export interface AppShellState {
    title: string;
    subtitle: string;
    menu: boolean;
    sidebar: Component<any>;
    content: Component<any>;
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

export const appShellState: AppShellState = {
    title: "Title",
    subtitle: "Subtitle",
    menu: false,
    sidebar: sidebar,
    content: content,
    snackbar: ""
};

export const appShellView: View<AppShellState> = (state: AppShellState, action: Action, manage: Manage): Hsmls => {
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
            // ["a.w3-bar-item.w3-right.w3-hover-light-grey",
            //     {
            //         href: `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(location.href)}&title=${encodeURIComponent(state.title)}&source=${encodeURIComponent(location.href)}`,
            //         title: "Share on LinkedIn",
            //         style: "padding-right: 3px; padding-left: 3px;",
            //         target: "_blank",
            //         rel: "noopener"
            //     },
            //     [["i.fab.fa-linkedin-in"]]
            // ],
            // ["a.w3-bar-item.w3-right.w3-hover-light-grey",
            //     {
            //         href: `https://twitter.com/intent/tweet?source=${encodeURIComponent(location.href)}&text=${encodeURIComponent(state.title)}:%20${encodeURIComponent(location.href)}`,
            //         title: "Tweet",
            //         style: "padding-right: 3px; padding-left: 3px;",
            //         target: "_blank",
            //         rel: "noopener"
            //     },
            //     [["i.fab.fa-twitter"]]
            // ],
            // ["a.w3-bar-item.w3-right.w3-hover-light-grey",
            //     {
            //         href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}&quote=${encodeURIComponent(state.title)}`,
            //         title: "Share on Facebook",
            //         style: "padding-right: 3px; padding-left: 3px;",
            //         target: "_blank",
            //         rel: "noopener"
            //     },
            //     [["i.fab.fa-facebook-f"]]
            // ]
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
            manage<any>(...state.sidebar)
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
                manage<any>(...state.content)
            ]
        ]],
        // snackbar
        ["div#snackbar~snackbar", { classes: [["show", !!state.snackbar]] },
            [state.snackbar]
        ]
    ];
};

export const appShellOnAction: OnAction<AppShellState> = (action: string, data: any, ctrl: ICtrl<AppShellState>): void => {
    console.log("action:", action, data);
    switch (action) {
        case AppShellActions.title:
            ctrl.update({ title: data as string });
            break;
        case AppShellActions.subtitle:
            ctrl.update({ subtitle: data as string });
            break;
        case AppShellActions.menu:
            ctrl.update({ menu: data === null ? !ctrl.state.menu : data });
            break;
        case AppShellActions.sidebar:
            ctrl.update({ sidebar: data as any });
            break;
        case AppShellActions.content:
            ctrl.update({ content: data as any });
            break;
        case AppShellActions.snackbar:
            ctrl.update({ snackbar: data as string });
            setTimeout(ctrl.update, 3e3, { snackbar: undefined });
            break;
        default:
            ctrl.actionGlobal(action, data);
    }
};

export const appShell: Component<AppShellState> = [appShellState, appShellView, appShellOnAction, "appShell"];
