import { HsmlFragment, HsmlFnc } from "./hsml";

export interface Component<State extends { [k: string]: any }> {
    type: string;
    state: State;
    view: View<State>;
}

export type View<State extends { [k: string]: any }> = (state: State, action: Action, mount: Mount) => HsmlFragment;

export type Action = (action: string, data?: any) => void;

export type Mount = <State extends { [k: string]: any }>(component: Component<State>, state?: State) => HsmlFnc | HsmlFragment;
