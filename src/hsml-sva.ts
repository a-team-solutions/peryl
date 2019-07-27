import { Hsmls, HsmlFnc } from "./hsml";

export interface Widget<State> {
    type: string;
    state: State;
    view: View<State>;
}

export type View<State> = (state: State, action: Action, mount: Mount) => Hsmls;

export type Action = (action: string, data?: any) => void;

export type Mount = <State>(widget: Widget<State>, state?: State) => HsmlFnc | Hsmls;
