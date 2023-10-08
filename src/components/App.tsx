import { css } from '@emotion/css';
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
import { layout, aiMoveTimeMs, aiBufferTimeMs } from '../constants';

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
      grid-template-columns: ${Array(layout.width).fill('1fr').join(' ')};
      width: fit-content;
    }
  }
`;

export const App = () => {
  const [rerender, setRerender] = useState(false);
  const [isPlacingFlag, setIsPlacingFlag] = useState(false);
  const [timer, setTimer] = useState(0);
  const [mineCount, setMineCount] = useState(layout.numMines);  
  
  const graphRef = useRef(Graph(
    layout.width,
    layout.height
  ));
  const gameOverNodeRef = useRef<NodeType|null>(null);
  const timerIntervalRef = useRef<NodeJS.Timer|number>();
  const aiActionIntervalRef = useRef<NodeJS.Timer|number>();
  const isAiActionIntervalPausedRef = useRef(false);
  const isFirstMoveRef = useRef(true);
  const aiActionQueueRef = useRef<AIMoveType[]>([]);
  
  const areMinesPlaced = flatten1Depth(graphRef.current.nodes).findIndex(i => i.hasMine) !== -1;

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    aiActionIntervalRef.current = setInterval(() => {
      // the first move is unique, so it has its on if block
      if (isAiActionIntervalPausedRef.current) {
        return;
      } else if (isFirstMoveRef.current) {
        const aiAction = genAIMove(graphRef.current, isFirstMoveRef.current);
        graphRef.current.populateMines(
          layout.numMines,
          aiAction.node.x,
          aiAction.node.y
        );
        isFirstMoveRef.current = false;
        executeAIMove(aiAction);
      } else if (!aiActionQueueRef.current.length) {
        // if not the first move, and the queue is empty, try to queue up some actions
        const start = performance.now();
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
          } else {
            // TODO: check for advanced minesweeper patterns
            const oneClickableNodeAtRandom = graphRef.current.getOneClickableNodeAtRandom();
            if (oneClickableNodeAtRandom) {
              aiActionQueueRef.current.push({
                node: oneClickableNodeAtRandom,
                action: 'click'
              });
            } else {
              isAiActionIntervalPausedRef.current = true;
            }
          }
        }
        const end = performance.now();
        console.log(`${end - start}ms`);
      }

      // try to execute a queued up action
      if (aiActionQueueRef.current.length) {
        const aiAction = aiActionQueueRef.current.shift();
        if (aiAction) {
          executeAIMove(aiAction);
          // the executed action could trigger a nodeOnReveal explosion,
          // so here we remove all revealed nodes from the queue. 
          aiActionQueueRef.current = aiActionQueueRef.current.filter(i => !i.node.isRevealed);
          setTimeout(() => {
            if (aiAction.action === 'flag') {
              // technically, the ai will never unflag, so we always -1.
              setMineCount(prevMineCount => prevMineCount - 1);
            } else if (aiAction.action === 'click') {
              if (aiAction.node.hasMine) {
                gameOverNodeRef.current = aiAction.node;
                graphRef.current.revealAllMines();
                isAiActionIntervalPausedRef.current = true;
              } else {
                setRerender(!rerender);
              }
            }
          }, aiMoveTimeMs);
        }
      }
    }, aiMoveTimeMs + aiBufferTimeMs);
    // clearInterval(aiActionIntervalRef.current);
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
              layout.width,
              layout.height
            ));
            gameOverNodeRef.current = null;
            isAiActionIntervalPausedRef.current = false;
            isFirstMoveRef.current = true;
            setTimer(0);
            setMineCount(layout.numMines);
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
                      layout.numMines,
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
