import { Hsmls, Hsml } from "../lib/hsml";
import { Ctrl, View } from "../lib/hsml-svac-ctrl";
import { Mount, Action } from "../lib/hsml-svac";

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

const TicTacToe: View<TicTacToeState> =
    (state: TicTacToeState, action: Action, mount: Mount): Hsmls => [
        ["h1", ["Tic-Tac-Toe Demo"]],
        ["p", [
            "Player: ", state.turn ? CROS : CIRC
        ]],
        ["div", state.board.map<Hsml>((row, y) =>
            ["div", row.map<Hsml>((col, x) =>
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
    ];
TicTacToe.type = "TicTacToe";
TicTacToe.state = {
    board: [
        [NBSP, NBSP, NBSP],
        [NBSP, NBSP, NBSP],
        [NBSP, NBSP, NBSP]
    ],
    turn: 0
};
TicTacToe.actions =
    (action: string, data: any, ctrl: Ctrl<TicTacToeState>): void => {
        console.log("action", action, data);
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
                console.warn("action unhandled:", action, data);
        }
    };

const app = new Ctrl<TicTacToeState>(TicTacToe)
    .mount(document.getElementById("app"));

(self as any).app = app;
