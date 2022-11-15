import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// global var
const M = 3; // board size

function Square(props) {
    return (<button className="square" onClick={props.onClick}>
        <font color={props.color}>{props.value}</font>
    </button>);
}

class Board extends React.Component {

    renderSquare(i) {
        let color;
        if (this.props.line && this.props.line.includes(i)) {
            color = "red";
        }
        return (<Square key={i}
                        value={this.props.squares[i]}
                        color={color}
                        onClick={() => this.props.onClick(i)}
        />);
    }

    render() {
        let count = 0;
        let builder = [];
        for (let i = 0; i < M; i++) {
            let builderRow = [];
            for (let j = 0; j < M; j++, count++) {
                builderRow.push(this.renderSquare(count))
            }
            builder.push(<div className="board-row" key={count}>{builderRow}</div>);
        }
        return (<div>{builder}</div>);
    }

}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(M * M).fill(null),
                x: 0, y: 0
            }],
            xIsNext: true,
            stepNumber: 0,
            order: true // true:顺序 false:逆序
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'x' : 'o';
        this.setState({
            history: history.concat([{
                squares: squares,
                x: findX(i),
                y: findY(i)
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        })
    }

    jumpTo(index) {
        this.setState({
            stepNumber: index,
            xIsNext: (index % 2) === 0
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const result = calculateWinner(current.squares);
        const winner = result.winner;
        const lines = result.lines;
        const moves = history.map((value, index) => {
            const xy = (`x:${value.x}, y:${value.y}`)
            const desc = index ?
                ':Go to move #' + index :
                ':Go to game start';
            if (value === current) {
                return (
                    <li key={index}>
                        <button
                            onClick={() => this.jumpTo(index)}><strong>{xy + desc}</strong></button>
                    </li>
                );
            } else {
                return (
                    <li key={index}>
                        <button
                            onClick={() => this.jumpTo(index)}>{xy + desc}</button>
                    </li>
                );
            }
        });

        let status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        if (winner) {
            status = 'Winner: ' + winner;
        } else if (this.state.stepNumber === M*M) {
            status = '平局';
        }


        let orderMoves;
        if (this.state.order) {
            orderMoves = moves;
        } else {
            orderMoves = moves.reverse();
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        line={lines}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.orderHistory()}>⬆️⬇️</button>
                    <ol>{orderMoves}</ol>
                </div>
            </div>
        );
    }

    orderHistory() {
        this.setState({
            order: !this.state.order
        })
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game/>);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {winner: squares[a], lines: lines[i]};
        }
    }
    return {winner: null, lines: null};
}

function findX(i) {
    return i % M + 1;
}

function findY(i) {
    return Math.floor(i / M) + 1;
}