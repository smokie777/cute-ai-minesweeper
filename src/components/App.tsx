import { css } from '@emotion/css'
import { minesweeper_layouts } from '../constants';
import { Graph } from '../game/Graph';
import { Square } from './Square';
import { useRef, useState } from 'react';
import { flatten1Depth } from '../utils';
import { colors } from './colors';
import { NodeType } from '../game/Node';
import { KeyPressListener } from './KeyPressListener';

export const App = () => {
  const gameOverNodeRef = useRef<NodeType|null>(null);
  const [rerender, setRerender] = useState(false);
  const [isPlacingFlag, setIsPlacingFlag] = useState(false);
  const graphRef = useRef(Graph(
    minesweeper_layouts.beginner.width,
    minesweeper_layouts.beginner.height
  ));
  const areMinesPlaced = flatten1Depth(graphRef.current.nodes).findIndex(i => i.hasMine) !== -1;

  const appCss = css`
    background: ${colors.grayLight};
    height: 100vh;

    .board_background {
      background: ${colors.pinkDark};
      width: fit-content;
      
      .board {
        display: grid;
        gap: 2px;
        grid-template-columns: ${Array(minesweeper_layouts.beginner.width).fill('1fr').join(' ')};
        width: fit-content;
      }
    }
  `;

  return (
    <div className={appCss}>
      <KeyPressListener setIsPlacingFlag={setIsPlacingFlag} />
      <div className='board_background'>
        <div className='board'>
          {graphRef.current.nodes.map(y => (
            y.map(node => (
              <Square
                key={`x${node.x}y${node.y}`}
                hasMine={node.hasMine}
                number={node.number}
                isRevealed={node.isRevealed}
                isFlagged={node.isFlagged}
                isGameOverNode={node === gameOverNodeRef.current}
                onClick={() => {
                  if (node.isRevealed || gameOverNodeRef.current) {
                    return;
                  } else if (!areMinesPlaced) {
                    graphRef.current.populateMines(
                      minesweeper_layouts.beginner.numMines,
                      node.x,
                      node.y
                    );
                  } else if (isPlacingFlag) {
                    node.isFlagged = true;
                    setRerender(!rerender);
                    return;
                  }
                  node.onReveal();
                  if (node.hasMine) {
                    gameOverNodeRef.current = node;
                    graphRef.current.revealAllMines();
                  }
                  setRerender(!rerender);
                }}
              />
            ))
          ))}
        </div>
      </div>
    </div>
  );
};
