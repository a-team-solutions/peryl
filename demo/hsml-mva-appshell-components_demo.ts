import { Action, Manage } from "../src/hsml-mva";
import { Hsmls, Hsml, join } from "../src/hsml";
import { Widget, CWidget } from "../src/hsml-mva-cwidget";

export interface SidebarModel {
    title: string;
}

export enum SidebarActions {
    title = "title",
}

export const Sidebar: Widget<SidebarModel> = {

    type: "Sidebar",

    model: {
        title: "Sidebar"
    },

    view: (model: SidebarModel, action: Action, manage: Manage): Hsmls => {
        const menu = [
            { url: "#", label: "Home", icon: "i.fas.fa-fw.fa-info" },
            { url: "#content", label: "Content", icon: "i.fas.fa-fw.fa-users" },
            { url: "#form", label: "Form", icon: "i.fas.fa-fw.fa-bell" }
        ];
        const nbsp = "\u00a0 ";
        return [
            ["div.w3-container", [
                ["h2", [model.title]],
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
    },

    actions: (action: string, data: any, widget: CWidget<SidebarModel>): void => {
        // console.log("action:", action, data);
        switch (action) {
            case SidebarActions.title:
                widget.update({ title: data as string });
                break;
            default:
                widget.appAction(action, data);
        }
    }

};


export interface ContentModel {
    title: string;
    text: string;
}

export enum ContentActions {
    title = "title"
}

export const Content: Widget<ContentModel> = {

    type: "Content",

    model: {
        title: "Content",
        text: "text text text"
    },

    view: (model: ContentModel, action: Action, manage: Manage): Hsmls => {
        return [
            ["h1", [model.title]],
            ["p", [model.text]]
        ];
    },

    actions: (action: string, data: any, widget: CWidget<ContentModel>): void => {
        // console.log("action:", action, data);
        switch (action) {
            case ContentActions.title:
                widget.update({ title: data as string });
                break;
            default:
                widget.appAction(action, data);
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

export interface FormModel {
    title: string;
    data: FormData;
}

export enum FormActions {
    title = "title",
    formData = "form-data",
    formSubmit = "form-submit"
}

export const Form: Widget<FormModel> = {

    type: "Form",

    model: {
        title: "Form",
        data: {
            name: "Ema",
            age: 33,
            married: false,
            gender: "female",
            sport: "gymnastics"
        }
    },

    view: (model: FormModel, action: Action, manage: Manage): Hsmls => {
        const genders = [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" }
        ];
        const sports = ["football", "gymnastics"];
        return [
            ["h1", [model.title]],
            ["form.w3-container", [
                ["p", [
                    ["label", ["Name",
                        ["input.w3-input", {
                            type: "text",
                            name: "name",
                            value: model.data.name,
                            on: ["change", FormActions.formData]
                        }]
                    ]]
                ]],
                ["p", [
                    ["label", ["Age",
                        ["input.w3-input", {
                            type: "number",
                            name: "age",
                            value: model.data.age,
                            on: ["change", FormActions.formData]
                        }]
                    ]]
                ]],
                ["p", [
                    ["label", [
                        ["input.w3-check", {
                            type: "checkbox",
                            name: "married",
                            checked: model.data.married,
                            on: ["change", FormActions.formData]
                        }],
                        " Married"
                    ]]
                ]],
                ["p",
                    join(
                        genders.map<Hsml>(g => (
                            ["label", [
                                ["input.w3-radio", {
                                    type: "radio",
                                    name: "gender",
                                    value: g.value,
                                    checked: model.data.gender === g.value,
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
                        ...sports.map<Hsml>(s => (
                            ["option",
                                { value: s, selected: s === model.data.sport },
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
        ];
    },

    actions: (action: string, data: any, widget: CWidget<FormModel>): void => {
        // console.log("action:", action, data);
        switch (action) {
            case FormActions.title:
                widget.update({ title: data as string });
                break;
            case FormActions.formData:
                formDataCollect(data, widget.model.data);
                // TODO: formDataValidate(widget.model.data);
                console.log(widget.model.data);
                break;
            case FormActions.formSubmit:
                data.preventDefault();
                console.dir(JSON.stringify(widget.model.data, null, 4));
                widget.appAction(action, widget.model.data);
                break;
            default:
                widget.appAction(action, data);
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


export interface AppShellModel {
    title: string;
    subtitle: string;
    menu: boolean;
    sidebar: Widget<any>;
    content: Widget<any>;
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

export const AppShell: Widget<AppShellModel> = {

    type: "AppShell",

    model: {
        title: "Title",
        subtitle: "Subtitle",
        menu: false,
        sidebar: Sidebar,
        content: Content,
        snackbar: ""
    },

    view: (model: AppShellModel, action: Action, manage: Manage): Hsmls => {
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
                manage<SidebarModel>(model.sidebar)
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
    },

    actions: (action: string, data: any, widget: CWidget<AppShellModel>): void => {
        // console.log("action:", action, data);
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
                widget.model.content = data;
                widget.update();
                break;
            case AppShellActions.snackbar:
                widget.update({ snackbar: data as string });
                setTimeout(widget.update, 3e3, { snackbar: undefined });
                break;
            default:
                widget.appAction(action, data);
        }
    }

};
