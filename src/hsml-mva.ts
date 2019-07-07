import { Hsmls, HsmlFnc } from "./hsml";

export interface Widget<Model> {
    type: string;
    model: Model;
    view: View<Model>;
}

export type View<Model> = (model: Model, action: Action, manage: Manage) => Hsmls;

export type Action = (action: string, data?: any) => void;

export type Manage = <Model>(widget: Widget<Model>, model?: Model) => HsmlFnc | Hsmls;
