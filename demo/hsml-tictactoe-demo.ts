import { Hsmls, Hsml } from "../src/hsml";
import { XWidget, Action, Widget } from "../src/hsml-xwidget";
import { xWidget } from "../src/hsml-xwidget-web";

const NBSP = "\u00A0";
const CIRC = "\u25EF";
const CROS = "\u2A2F";

interface TicTacToeState {
    board: string[][];
    turn: number;
}

enum Actions {
    mark = "mark"
}

class TicTacToe implements Widget<TicTacToeState> {

    state = {
        board: [
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP]
        ],
        turn: 0
    };

    view = (state: TicTacToeState, action: Action): Hsmls => ([
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
                        on: ["click", Actions.mark, { x, y, turn: state.turn }]
                    },
                    [
                        col === NBSP ? NBSP : col
                    ]
                ])
            ])
        ]
    ])

    onAction = (action: string, data: any, xWidget: XWidget<TicTacToeState>): void => {
        console.log("action", action, data);
        switch (action) {
            case Actions.mark:
                xWidget.state.board[data.y][data.x] = data.turn ? CROS : CIRC;
                xWidget.state.turn = data.turn ? 0 : 1;
                xWidget.update();
                break;
            case "_mount":
            case "_umount":
                break;
            default:
                console.warn("action unhandled:", action, data, this);
        }
    }

}


const app = xWidget<TicTacToeState>(TicTacToe)
    .mount(document.getElementById("app"));

(self as any).app = app;
