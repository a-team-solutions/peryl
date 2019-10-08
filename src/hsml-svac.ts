import { HsmlFragment, HsmlFnc } from "./hsml";

export interface View<State extends { [k: string]: any }> {
    (state: State, action: Action, mount: Mount): HsmlFragment;
    type: string;
    state: State;
}

export type Action = (type: string, data?: any) => void;

export type Mount = <State extends { [k: string]: any }>(
    view: View<State>,
    state?: State,
    action?: Action) => HsmlFnc | HsmlFragment;
