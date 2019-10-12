import { Action, Mount } from "../src/hsml-svac";
import { HsmlFragment, HsmlElement, join } from "../src/hsml";
import { Ctrl, Component } from "../src/hsml-svac-ctrl";

const nbsp = "\u00a0 ";

export interface SidebarState {
    title: string;
    menu: {
        url: string;
        label: string;
        icon: string;
    }[];
}

export const enum SidebarActions {
    title = "title",
}

export const Sidebar: Component<SidebarState> = {

    type: "Sidebar",

    state: {
        title: "Sidebar",
        menu: [
            { url: "#", label: "Home", icon: "i.fas.fa-fw.fa-info" },
            { url: "#content", label: "Content", icon: "i.fas.fa-fw.fa-users" },
            { url: "#form", label: "Form", icon: "i.fas.fa-fw.fa-bell" }
        ]
    },

    view: (state: SidebarState, action: Action, mount: Mount): HsmlFragment => [
        ["div.w3-container", [
            ["h2", [state.title]],
            ["div.w3-bar-block", {},
                state.menu.map<HsmlElement>(m => (
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
    ],

    actions: (action: string, data: any, ctrl: Ctrl<SidebarState>): void => {
        // console.log("action:", action, data);
        switch (action) {
            case SidebarActions.title:
                ctrl.update({ title: data as string });
                break;
            default:
                ctrl.appAction(action, data);
        }
    }
};


export interface ContentState {
    title: string;
    text: string;
}

export const enum ContentActions {
    title = "title"
}

export const Content: Component<ContentState> = {

    type: "Content",

    state: {
        title: "Content",
        text: "text text text"
    },

    view: (state: ContentState, action: Action, mount: Mount): HsmlFragment => [
        ["h1", [state.title]],
        ["p", [state.text]]
    ],

    actions: (action: string, data: any, ctrl: Ctrl<ContentState>): void => {
        // console.log("action:", action, data);
        switch (action) {
            case ContentActions.title:
                ctrl.update({ title: data as string });
                break;
            default:
                ctrl.appAction(action, data);
        }
    }
};


export interface FormData {
    name: string;
    age: number;
    married: boolean;
    gender: string;
    sport: string;
}

export interface FormState {
    title: string;
    data: FormData;
    genders: {
        label: string;
        value: string;
    }[];
    sports: string[];
}

export const enum FormActions {
    title = "title",
    formData = "form-data",
    formSubmit = "form-submit"
}

export const Form: Component<FormState> = {

    type: "Form",

    state: {
        title: "Form",
        data: {
            name: "Ema",
            age: 33,
            married: false,
            gender: "female",
            sport: "gymnastics"
        },
        genders: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" }
        ],
        sports: ["football", "gymnastics"]
    },

    view: (state: FormState, action: Action, mount: Mount): HsmlFragment => [
        ["h1", [state.title]],
        ["form.w3-container", [
            ["p", [
                ["label", ["Name",
                    ["input.w3-input", {
                        type: "text",
                        name: "name",
                        value: state.data.name,
                        on: ["change", FormActions.formData]
                    }]
                ]]
            ]],
            ["p", [
                ["label", ["Age",
                    ["input.w3-input", {
                        type: "number",
                        name: "age",
                        value: state.data.age,
                        on: ["change", FormActions.formData]
                    }]
                ]]
            ]],
            ["p", [
                ["label", [
                    ["input.w3-check", {
                        type: "checkbox",
                        name: "married",
                        checked: state.data.married,
                        on: ["change", FormActions.formData]
                    }],
                    " Married"
                ]]
            ]],
            ["p",
                join(
                    state.genders.map<HsmlElement>(g => (
                        ["label", [
                            ["input.w3-radio", {
                                type: "radio",
                                name: "gender",
                                value: g.value,
                                checked: state.data.gender === g.value,
                                on: ["change", FormActions.formData]
                            }],
                            " ", g.label
                        ]]
                    )),
                    ["br"]
                )
            ],
            ["p", [
                ["select.w3-select", {
                    name: "sport",
                    on: ["change", FormActions.formData]
                }, [
                    ["option",
                        { value: "", disabled: true, selected: true },
                        ["Sport"]
                    ],
                    ...state.sports.map<HsmlElement>(s => (
                        ["option",
                            { value: s, selected: s === state.data.sport },
                            [s]
                        ])
                    )
                ]]
            ]],
            ["button.w3-btn.w3-blue",
                { type: "submit", on: ["click", FormActions.formSubmit] },
                ["Submit"]
            ]
        ]]
    ],

    actions: (action: string, data: any, ctrl: Ctrl<FormState>): void => {
        // console.log("action:", action, data);
        switch (action) {
            case FormActions.title:
                ctrl.update({ title: data as string });
                break;
            case FormActions.formData:
                formDataCollect(data, ctrl.state.data);
                // TODO: formDataValidate(ctrl.state.data);
                console.log(ctrl.state.data);
                break;
            case FormActions.formSubmit:
                data.preventDefault();
                console.dir(JSON.stringify(ctrl.state.data, null, 4));
                ctrl.appAction(action, ctrl.state.data);
                break;
            default:
                ctrl.appAction(action, data);
        }
    }
};

function formDataCollect(e: Event, data: any): void {
    e.preventDefault();
    const el = (e.target as HTMLElement);
    const nn = el.nodeName;
    switch (nn) {
        case "INPUT":
            const iel = (el as HTMLInputElement);
            switch (iel.type) {
                case "text":
                case "radio":
                    data[iel.name] = iel.value;
                    break;
                case "number":
                    data[iel.name] = Number(iel.value);
                    break;
                case "checkbox":
                    data[iel.name] = iel.checked;
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


export interface AppShellState {
    title: string;
    subtitle: string;
    menu: boolean;
    sidebar: Component<any>;
    content: Component<any>;
    snackbar: string;
}

export const enum AppShellActions {
    title = "title",
    subtitle = "subtitle",
    menu = "menu",
    sidebar = "sidebar",
    content = "content",
    snackbar = "snackbar"
}

export const AppShell: Component<AppShellState> = {

    type: "AppShell",

    state: {
        title: "Title",
        subtitle: "Subtitle",
        menu: false,
        sidebar: Sidebar,
        content: Content,
        snackbar: ""
    },

    view: (state: AppShellState, action: Action, mount: Mount): HsmlFragment => [
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
                        state.title
                    ]]
                ]],
                ["span.w3-hide-small", [state.subtitle ? " - " : ""]],
                ["span", [state.subtitle ? state.subtitle : ""]],
            ]],
            ["a.w3-bar-item.w3-right.w3-hover-light-grey",
                {
                    href: "https://gitlab.com/peter-rybar/peryl",
                    title: "GitLab repository",
                    target: "_blank",
                    rel: "noopener"
                },
                [["i.fab.fa-gitlab"]]
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
            mount<SidebarState>(state.sidebar)
        ],
        // overlay
        ["div#overlay.w3-overlay.w3-hide-large.w3-animate-opacity~overlay",
            {
                styles: {
                    cursor: "pointer",
                    display: state.menu ? "block" : "none"
                },
                title: "close side menu",
                on: ["click", AppShellActions.menu]
            }
        ],
        // main
        ["div.w3-main", { style: "margin-left:300px;margin-top:43px;" }, [
            ["div.w3-container~content",
                mount<any>(state.content)
            ]
        ]],
        // snackbar
        ["div#snackbar~snackbar", { classes: [["show", !!state.snackbar]] },
            [state.snackbar]
        ]
    ],

    actions: (action: string, data: any, ctrl: Ctrl<AppShellState>): void => {
        // console.log("action:", action, data);
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
                ctrl.state.content = data;
                ctrl.update();
                break;
            case AppShellActions.snackbar:
                ctrl.update({ snackbar: data as string });
                setTimeout(ctrl.update, 3e3, { snackbar: undefined });
                break;
            default:
                ctrl.appAction(action, data);
        }
    }
};
