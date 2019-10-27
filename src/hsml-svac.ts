import { HsmlFragment, HsmlFnc } from "./hsml";

export type MergebleState = { [k: string]: any };

export interface Component<State extends MergebleState> {
    type: string;
    state: State;
    view: View<State>;
}

export type Action = (action: string | number, data?: any, event?: Event) => void;

export type View<State extends MergebleState> = (
    state: State,
    action: Action,
    mount: Mount) => HsmlFragment;


export type Mount = <State extends MergebleState>(
    component: Component<State>,
    state?: State,
    action?: Action) => HsmlFnc | HsmlFragment;
