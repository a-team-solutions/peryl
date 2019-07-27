import { Hsmls, Hsml } from "../src/hsml";
import { Widget, WidgetCtrl } from "../src/hsml-sva-ctrl";
import { Mount, Action } from "../src/hsml-sva";

const NBSP = "\u00A0";
const CIRC = "\u25EF";
const CROS = "\u2A2F";

interface TicTacToeState {
    board: string[][];
    turn: number;
}

enum TicTacToeActions {
    mark = "mark"
}

const TicTacToe: Widget<TicTacToeState> = {

    type: "TicTacToe",

    state: {
        board: [
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP]
        ],
        turn: 0
    },

    view: (state: TicTacToeState, action: Action, mount: Mount): Hsmls => ([
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
    ]),

    actions: (action: string, data: any, widget: WidgetCtrl<TicTacToeState>): void => {
        console.log("action", action, data);
        switch (action) {
            case TicTacToeActions.mark:
                widget.state.board[data.y][data.x] = data.turn ? CROS : CIRC;
                widget.state.turn = data.turn ? 0 : 1;
                widget.update();
                break;
            case "_mount":
            case "_umount":
                break;
            default:
                console.warn("action unhandled:", action, data);
        }
    }

};


const app = new WidgetCtrl<TicTacToeState>(TicTacToe)
    .mount(document.getElementById("app"));

(self as any).app = app;
