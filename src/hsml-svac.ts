import { HsmlFragmet, HsmlFnc } from "./hsml";

export interface View<State extends { [k: string]: any }> {
    (state: State, action: Action, mount: Mount): HsmlFragmet;
    type: string;
    state: State;
}

export type Action = (action: string, data?: any) => void;

export type Mount = <State extends { [k: string]: any }>(view: View<State>, state?: State) => HsmlFnc | HsmlFragmet;
