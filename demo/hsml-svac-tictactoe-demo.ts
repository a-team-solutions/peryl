import { HElements, HElement } from "../src/hsml";
import { HCtrl, HComponent } from "../src/hsml-svac-ctrl";
import { HMount, HAction } from "../src/hsml-svac";

const NBSP = "\u00A0";
const CIRC = "\u25EF";
const CROS = "\u2A2F";

interface TicTacToeState {
    board: string[][];
    turn: number;
}

const enum TicTacToeActions {
    mark = "mark"
}

const TicTacToe: HComponent<TicTacToeState> = {

    type: "TicTacToe",

    state: {
        board: [
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP]
        ],
        turn: 0
    },

    view: (state: TicTacToeState, action: HAction, mount: HMount): HElements => [
        ["h1", ["Tic-Tac-Toe Demo"]],
        ["p", [
            "Player: ", state.turn ? CROS : CIRC
        ]],
        ["div", state.board.map<HElement>((row, y) =>
            ["div", row.map<HElement>((col, x) =>
                ["button",
                    {
                        styles: {
                            fontFamily: "monospace",
                            fontSize: "300%",
                            display: "inline-block",
                            width: "2em", height: "2em"
                        },
                        on: ["click", TicTacToeActions.mark, { x, y, turn: state.turn }]
                    },
                    [
                        col === NBSP ? NBSP : col
                    ]
                ])
            ])
        ]
    ],

    actions: (ctrl: HCtrl<TicTacToeState>, action: string | number, data?: any, event?: Event): void => {
        console.log("action", action, data, event);
        switch (action) {
            case TicTacToeActions.mark:
                ctrl.state.board[data.y][data.x] = data.turn ? CROS : CIRC;
                ctrl.state.turn = data.turn ? 0 : 1;
                ctrl.update();
                break;
            case "_mount":
            case "_umount":
                break;
            default:
                console.warn("action unhandled:", action, data, event);
        }
    }
};

const app = new HCtrl<TicTacToeState>(TicTacToe)
    .mount(document.getElementById("app"));

(self as any).app = app;
