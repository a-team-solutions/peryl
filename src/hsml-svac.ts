import { HElements, HFnc } from "./hsml";

export interface HComponent<STATE> {
    type: string;
    state: STATE;
    view: HView<STATE>;
}

export type HAction = (action: string | number, data?: any, event?: Event) => void;

export type HView<STATE> = (
    state: STATE,
    action: HAction,
    mount: HMount) => HElements;


export type HMount = <STATE>(
    component: HComponent<STATE>,
    state?: STATE,
    action?: HAction) => HFnc | HElements;
