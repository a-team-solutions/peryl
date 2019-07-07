import { Hsmls, Hsml } from "../src/hsml";
import { Widget, CWidget } from "../src/hsml-svac";
import { Manage, Action } from "../src/hsml-sva";

const NBSP = "\u00A0";
const CIRC = "\u25EF";
const CROS = "\u2A2F";

interface TicTacToeModel {
    board: string[][];
    turn: number;
}

enum Actions {
    mark = "mark"
}

const TicTacToe: Widget<TicTacToeModel> = {

    type: "TicTacToe",

    model: {
        board: [
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP]
        ],
        turn: 0
    },

    view: (model: TicTacToeModel, action: Action, manage: Manage): Hsmls => ([
        ["h1", ["Tic-Tac-Toe Demo"]],
        ["p", [
            "Player: ", model.turn ? CROS : CIRC
        ]],
        ["div", model.board.map<Hsml>((row, y) =>
            ["div", row.map<Hsml>((col, x) =>
                ["button",
                    {
                        styles: {
                            fontFamily: "monospace",
                            fontSize: "300%",
                            display: "inline-block",
                            width: "2em", height: "2em"
                        },
                        on: ["click", Actions.mark, { x, y, turn: model.turn }]
                    },
                    [
                        col === NBSP ? NBSP : col
                    ]
                ])
            ])
        ]
    ]),

    onAction: (action: string, data: any, widget: CWidget<TicTacToeModel>): void => {
        console.log("action", action, data);
        switch (action) {
            case Actions.mark:
                widget.model.board[data.y][data.x] = data.turn ? CROS : CIRC;
                widget.model.turn = data.turn ? 0 : 1;
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


const app = new CWidget<TicTacToeModel>(TicTacToe)
    .mount(document.getElementById("app"));

(self as any).app = app;
