import { HElements, HFnc } from "./hsml";

export interface HComponent<State> {
    type: string;
    state: State;
    view: HView<State>;
}

export type HAction = (action: string | number, data?: any, event?: Event) => void;

export type HView<State> = (
    state: State,
    action: HAction,
    mount: HMount) => HElements;


export type HMount = <State>(
    component: HComponent<State>,
    state?: State,
    action?: HAction) => HFnc | HElements;
