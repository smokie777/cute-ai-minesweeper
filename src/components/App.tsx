import { css } from '@emotion/css';
import { minesweeper_layouts } from '../constants';
import { Graph } from '../game/Graph';
import { Square } from './Square';
import { useEffect, useRef, useState } from 'react';
import { flatten1Depth } from '../utils';
import { colors } from './colors';
import { NodeType } from '../game/Node';
import { KeyPressListener } from './KeyPressListener';
import { TopBar } from './TopBar';
import { Cursor } from './Cursor';
import { AIMoveType, genAIMove } from '../game/genAIMove';
import { executeAIMove } from '../game/executeAIMove';

const appCss = css`
  background: ${colors.grayLight};
  height: 100vh;
  padding-top: 40px;
  display: flex;
  align-items: center;
  flex-direction: column;

  .board_background {
    background: ${colors.pinkDark};
    width: fit-content;
    height: fit-content;
    
    .board {
      position: relative;
      display: grid;
      gap: 2px;
      grid-template-columns: ${Array(minesweeper_layouts.beginner.width).fill('1fr').join(' ')};
      width: fit-content;
    }
  }
`;

export const App = () => {
  const [rerender, setRerender] = useState(false);
  const [isPlacingFlag, setIsPlacingFlag] = useState(false);
  const [timer, setTimer] = useState(0);
  const [mineCount, setMineCount] = useState(minesweeper_layouts.beginner.numMines);  
  
  const graphRef = useRef(Graph(
    minesweeper_layouts.beginner.width,
    minesweeper_layouts.beginner.height
  ));
  const gameOverNodeRef = useRef<NodeType|null>(null);
  const timerIntervalRef = useRef<NodeJS.Timer|number>();
  const aiActionIntervalRef = useRef<NodeJS.Timer|number>();
  const isFirstMoveRef = useRef(true);
  const aiActionQueueRef = useRef<AIMoveType[]>([]);
  
  const areMinesPlaced = flatten1Depth(graphRef.current.nodes).findIndex(i => i.hasMine) !== -1;

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    aiActionIntervalRef.current = setInterval(() => {
      aiActionQueueRef.current = aiActionQueueRef.current.filter(i => !i.node.isRevealed);
      if (isFirstMoveRef.current) {
        const aiAction = genAIMove(graphRef.current, isFirstMoveRef.current);
        graphRef.current.populateMines(
          minesweeper_layouts.beginner.numMines,
          aiAction.node.x,
          aiAction.node.y
        );
        isFirstMoveRef.current = false;
        executeAIMove(aiAction);
      } else if (aiActionQueueRef.current.length) {
        const aiAction = aiActionQueueRef.current.shift();
        if (aiAction) {
          executeAIMove(aiAction);
          setTimeout(() => {
            if (aiAction.action === 'flag') {
              // technically, the ai will never unflag, so we always -1.
              setMineCount(prevMineCount => prevMineCount - 1);
            } else if (aiAction.action === 'click') {
              if (aiAction.node.hasMine) {
                gameOverNodeRef.current = aiAction.node;
                graphRef.current.revealAllMines();
                clearInterval(aiActionIntervalRef.current);
              } else {
                setRerender(!rerender);
              }
            }
          }, 750);
        }
      } else {
        const someFlaggableNodes = graphRef.current.getSomeFlaggableNodes();
        if (someFlaggableNodes.length) {
          someFlaggableNodes.forEach(node => {
            aiActionQueueRef.current.push({
              node,
              action: 'flag'
            });
          });
        } else {
          const someClickableNodes = graphRef.current.getSomeClickableNodes();
          if (someClickableNodes.length) {
            someClickableNodes.forEach(node => {
              aiActionQueueRef.current.push({
                node,
                action: 'click'
              });
            });
          }
        }
      }
    }, 1000);
    clearInterval(aiActionIntervalRef.current);
    return () => {
      clearInterval(timerIntervalRef.current);
      clearInterval(aiActionIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={appCss}>
      <KeyPressListener setIsPlacingFlag={setIsPlacingFlag} />
      <div className='board_background'>
        <TopBar
          mineCount={mineCount}
          onResetClick={() => {
            graphRef.current = (Graph(
              minesweeper_layouts.beginner.width,
              minesweeper_layouts.beginner.height
            ));
            gameOverNodeRef.current = null;
            clearInterval(aiActionIntervalRef.current)
            isFirstMoveRef.current = true;
            setTimer(0);
            setMineCount(minesweeper_layouts.beginner.numMines);
            aiActionQueueRef.current = [];
          }}
          timer={timer}
        />
        <div className='board'>
          <Cursor />
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
                  if (
                    node.isRevealed
                    || gameOverNodeRef.current
                    || (node.isFlagged && !isPlacingFlag)
                  ) {
                    return;
                  } else if (isPlacingFlag) {
                    node.isFlagged = !node.isFlagged;
                    setMineCount(prevMineCount => prevMineCount + (node.isFlagged ? -1 : 1));
                    return;
                  } else if (!areMinesPlaced) {
                    graphRef.current.populateMines(
                      minesweeper_layouts.beginner.numMines,
                      node.x,
                      node.y
                    );
                    isFirstMoveRef.current = false;
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
