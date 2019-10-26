import { Action, Mount } from "../src/hsml-svac";
import { HsmlFragment, HsmlElement, join } from "../src/hsml";
import { Ctrl, Component } from "../src/hsml-svac-ctrl";
import { FormValidator, StringValidator, NumberValidator, SelectValidator, BooleanValidator, Str, Err } from "../src/validators";

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

    actions: (ctrl: Ctrl<SidebarState>, action: string, data?: any, event?: Event): void => {
        // console.log("action:", action, data, event);
        switch (action) {
            case SidebarActions.title:
                ctrl.update({ title: data as string });
                break;
            default:
                ctrl.appAction(action, data, event);
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

    actions: (ctrl: Ctrl<ContentState>, action: string, data: any, event?: Event): void => {
        // console.log("action:", action, data, event);
        switch (action) {
            case ContentActions.title:
                ctrl.update({ title: data as string });
                break;
            default:
                ctrl.appAction(action, data, event);
        }
    }
};


export interface FormModel {
    name: string;
    age: number;
    married: boolean;
    gender: string;
    sport: string;
}

export interface FormState {
    title: string;
    genders: {
        label: string;
        value: string;
    }[];
    sports: string[];
    obj: FormModel;
    str: Str<FormModel>;
    err: Err<FormModel>;
    valid: boolean;
}

export const enum FormActions {
    title = "title",
    data = "data",
    submit = "submit",
    cancel = "cancel"
}

export const Form: Component<FormState> = {

    type: "Form",

    state: {
        title: "Form",
        genders: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" }
        ],
        sports: ["football", "gymnastics"],
        obj: {
            name: "Ema",
            age: 20,
            married: false,
            gender: "male",
            sport: "gymnastics"
        },
        str: {
            name: "",
            age: "",
            married: "",
            gender: "",
            sport: ""
        },
        err: {
            name: "",
            age: "",
            married: "",
            gender: "",
            sport: ""
        },
        valid: false
    },

    view: (state: FormState, action: Action, mount: Mount): HsmlFragment => [
        ["h1", [state.title]],
        ["form.w3-container", [
            ["p", [
                ["label", ["Name",
                    ["input.w3-input", {
                        type: "text",
                        name: "name",
                        value: state.str["name"],
                        on: ["change", FormActions.data]
                    }]
                ]],
                ["p.w3-text-red", [state.err["name"]]]
            ]],
            ["p", [
                ["label", ["Age",
                    ["input.w3-input", {
                        type: "number",
                        name: "age",
                        value: state.str.age,
                        on: ["change", FormActions.data]
                    }]
                ]],
                ["p.w3-text-red", [state.err["age"]]]
            ]],
            ["p", [
                ["label", [
                    ["input.w3-check", {
                        type: "checkbox",
                        name: "married",
                        checked: state.str.married,
                        on: ["change", FormActions.data]
                    }],
                    " Married"
                ]],
                ["p.w3-text-red", [state.err["married"]]]
            ]],
            ["p",
                [
                    ...join(
                        state.genders.map<HsmlElement>(g => (
                            ["label", [
                                ["input.w3-radio", {
                                    type: "radio",
                                    name: "gender",
                                    value: g.value,
                                    checked: state.str.gender === g.value,
                                    on: ["change", FormActions.data]
                                }],
                                " ", g.label
                            ]]
                        )),
                        ["br"]
                    ),
                    ["p.w3-text-red", [state.err["name"]]]
                ]
            ],
            ["p", [
                ["select.w3-select", {
                    name: "sport",
                    on: ["change", FormActions.data]
                }, [
                    ["option",
                        { value: "", disabled: true, selected: true },
                        ["Sport"]
                    ],
                    ...state.sports.map<HsmlElement>(s => (
                        ["option",
                            { value: s, selected: s === state.str.sport },
                            [s]
                        ])
                    )
                    ]],
                    ["p.w3-text-red", [state.err["name"]]]
            ]],
            ["button.w3-btn.w3-blue",
                {
                    type: "submit",
                    disabled: !state.valid,
                    on: ["click", FormActions.submit]
                },
                ["Submit"]
            ],
            " ",
            ["button.w3-btn",
                {
                    type: "button",
                    on: ["click", FormActions.cancel]
                },
                ["Cancel"]
            ]
        ]]
    ],

    actions: (ctrl: Ctrl<FormState>, action: string, data?: any, event?: Event): void => {
        // console.log("action:", action, data, event);

        const ctx = ctrl as Ctrl<FormState>
            & {
                fv: FormValidator<FormModel>;
            };

        switch (action) {

            case "_init":
                const fv = new FormValidator<FormModel>()
                    .addValidator("name",
                        new StringValidator(
                            { required: true, min: 3, max: 5 },
                            {
                                required: "Required {{min}} {{max}} {{regexp}}",
                                invalid_format: "Invalid format {{regexp}}",
                                not_in_range: "Not in range {{min}}-{{max}}"
                            }))
                    .addValidator("age",
                        new NumberValidator(
                            { required: true, min: 1, max: 100, },
                            {
                                required: "Required {{min}} {{max}} {{locale}} {{format}}",
                                invalid_format: "Invalid format {{num}} {{locale}} {{format}}",
                                not_in_range: "Not in range {{min}}-{{max}}"
                            }))
                    .addValidator("gender",
                        new SelectValidator(
                            { required: true, options: ctrl.state.genders.map(g => g.value) },
                            {
                                required: "Required {{options}}",
                                invalid_option: "Invalod option {{option}} {{options}}"
                            }))
                    .addValidator("married",
                        new BooleanValidator(
                            { required: true },
                            {
                                required: "Required",
                                invalid_value: "Invalid value {{value}}"
                            }))
                    .addValidator("sport",
                        new SelectValidator(
                            { required: true, options: ctrl.state.sports },
                            {
                                required: "Required {{options}}",
                                invalid_option: "Invalod option {{option}} {{options}}"
                            }))
                    .format(ctrl.state.obj);
                ctx.fv = fv;
                ctrl.update(fv.data());
                break;

            case FormActions.title:
                ctrl.update({ title: data as string });
                break;

            case FormActions.data: {
                const formData = ctx.fv
                    .validate({ ...ctrl.state.str, ...data })
                    .data();
                console.log("obj:", JSON.stringify(formData, null, 4));
                ctrl.update({ ...formData });
                break;
            }

            case FormActions.submit:
                event!.preventDefault();
                if (ctx.fv.valid) {
                    console.dir(JSON.stringify(ctrl.state.obj, null, 4));
                    ctrl.extAction(action, ctrl.state.obj);
                }
                break;

            case FormActions.cancel:
                data.preventDefault();
                ctrl.extAction(action);
                break;

            default:
                ctrl.appAction(action, data, event);
        }
    }
};

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

    actions: (ctrl: Ctrl<AppShellState>, action: string, data?: any, event?: Event): void => {
        // console.log("action:", action, data, event);
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
                ctrl.appAction(action, data, event);
        }
    }
};
