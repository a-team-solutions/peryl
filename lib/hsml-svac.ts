import { Hsmls, HsmlFnc } from "./hsml";

export interface View<State> {
    (state: State, action: Action, mount: Mount): Hsmls;
    type: string;
    state: State;
}

export type Action = (action: string, data?: any) => void;

export type Mount = <State>(view: View<State>, state?: State) => HsmlFnc | Hsmls;
