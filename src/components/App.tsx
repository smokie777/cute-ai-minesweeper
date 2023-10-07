import { css } from '@emotion/css'
import { minesweeper_layouts } from '../constants';
import { Graph } from '../game/Graph';
import { Square } from './Square';
import { useRef, useState } from 'react';
import { flatten1Depth } from '../utils';
import { colors } from './colors';

export const App = () => {
  const [rerender, setRerender] = useState(false);
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
      <div className='board_background'>
        <div className='board'>
          {graphRef.current.nodes.map(y => (
            y.map(node => (
              <Square
                key={`x${node.x}y${node.y}`}
                hasMine={node.hasMine}
                number={node.number}
                isRevealed={node.isRevealed}
                onClick={() => {
                  if (!areMinesPlaced) {
                    graphRef.current.populateMines(
                      minesweeper_layouts.beginner.numMines,
                      node.x,
                      node.y
                    );
                  }
                  graphRef.current.nodes[node.y][node.x].isRevealed = true;
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
