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
import { executeAIMove } from '../game/executeAIMove';
import { layout, aiMoveTimeMs, aiBufferTimeMs } from '../constants';
import { fetch_post_vtuber_speak } from '../fetch_functions';
import { AIMoveType } from '../types';
import { throttle } from 'lodash';

const throttled_fetch_post_vtuber_speak = throttle(
  fetch_post_vtuber_speak,
  5000
);

/*
AI LOGIC PLAN

1st move is always click random tile, preferably one that isn't on the outer edges
then:
1. check for flag placements and place them
2. iterate through all revealed numbers, and reveal all non-revealed adjancent tiles if applicable
3. if pattern: solve pattern (this could get really complicated!)
4. finally: it's a 50-50. so, click a random tile. (preferably one that has a revealed number adjancent.)

observations:
- every AI action consists of moving the cursor to a specific tile, and "clicking it" or "flagging it"
- interval should end/clear when game ends
*/

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
  const winNodeRef = useRef<NodeType|null>(null);
  const nextActionTimeoutRef = useRef<NodeJS.Timer|number>();
  const aiActionIntervalRef = useRef<NodeJS.Timer|number>();
  const isFirstMoveRef = useRef(true);
  const aiActionQueueRef = useRef<AIMoveType[]>([]);
  
  const areMinesPlaced = flatten1Depth(graphRef.current.nodes).findIndex(i => i.hasMine) !== -1;

  useEffect(() => {
    aiActionIntervalRef.current = setInterval(() => {
      if (!(gameOverNodeRef.current || winNodeRef.current)) {
        setTimer(prevTimer => prevTimer + 1);
        return; // ENABLE THIS LINE IF YOU WANT TO PLAY AS A HUMAN BEAN
      }
      // the first move is unique, so it has its on if block
      if (gameOverNodeRef.current || winNodeRef.current) {
        return;
      } else if (isFirstMoveRef.current) {
        const aiAction:AIMoveType = {
          node: graphRef.current.pickFirstMove(),
          action: 'click',
          shouldSkipReact: true
        };
        aiActionQueueRef.current.push(aiAction);
        graphRef.current.populateMines(
          layout.numMines,
          aiAction.node.x,
          aiAction.node.y
        );
        isFirstMoveRef.current = false;
      } else if (!aiActionQueueRef.current.length) {
        // if not the first move, and the queue is empty, try to queue up some actions
        const start = performance.now();
        const someFlaggableNodes = graphRef.current.getSomeFlaggableNodes();
        if (someFlaggableNodes.length) {
          someFlaggableNodes.forEach(node => {
            aiActionQueueRef.current.push({
              node,
              action: 'flag',
              shouldSkipReact: false
            });
          });
        } else {
          const someClickableNodes = graphRef.current.getSomeClickableNodes();
          if (someClickableNodes.length) {
            someClickableNodes.forEach(node => {
              aiActionQueueRef.current.push({
                node,
                action: 'click',
                shouldSkipReact: false
              });
            });
          } else {
            // TODO: check for advanced minesweeper patterns
            const oneClickableNodeAtRandom = graphRef.current.getOneClickableNodeAtRandom();
            if (oneClickableNodeAtRandom) {
              throttled_fetch_post_vtuber_speak('You don\'t know where to go next in Minesweeper! Give a short response venting your frustration.');
              aiActionQueueRef.current.push({
                node: oneClickableNodeAtRandom,
                action: 'click',
                shouldSkipReact: false
              });
            }
          }
        }
        const end = performance.now();
        // console.log(`${end - start}ms`);
      }

      // try to execute a queued up action
      if (aiActionQueueRef.current.length) {
        const aiAction = aiActionQueueRef.current.shift();
        if (aiAction) {
          executeAIMove(aiAction, graphRef.current);
          // the executed action could trigger a nodeOnReveal explosion,
          // so here we remove all revealed nodes from the queue. 
          aiActionQueueRef.current = aiActionQueueRef.current.filter(i => !i.node.isRevealed);
          nextActionTimeoutRef.current = setTimeout(() => {
            if (aiAction.action === 'flag') {
              // technically, the ai will never unflag, so we always -1.
              setMineCount(prevMineCount => prevMineCount - 1);
            } else if (aiAction.action === 'click') {
              if (aiAction.node.hasMine) {
                fetch_post_vtuber_speak('You just lost the game of Minesweeper you were playing! Go on a rant about how much the game sucks!');
                gameOverNodeRef.current = aiAction.node;
                graphRef.current.revealAllMines();
              } else if (graphRef.current.checkIsWin(layout.numMines)) {
                fetch_post_vtuber_speak('You just won the game of Minesweeper you were playing! Give us your best reaction!');
                winNodeRef.current = aiAction.node;
                graphRef.current.revealAllMines();
              }
            }
            setRerender(prevRerender => !prevRerender);
          }, aiMoveTimeMs);
        }
      }
    }, aiMoveTimeMs + aiBufferTimeMs);

    return () => {
      clearInterval(aiActionIntervalRef.current);
      clearTimeout(nextActionTimeoutRef.current);
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
            winNodeRef.current = null;
            isFirstMoveRef.current = true;
            setTimer(0);
            setMineCount(layout.numMines);
            aiActionQueueRef.current = [];
            setRerender(!rerender);
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
                isWinNode={node === winNodeRef.current}
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
                  graphRef.current.nodeOnReveal(node);
                  if (node.hasMine) {
                    gameOverNodeRef.current = node;
                    graphRef.current.revealAllMines();
                  }
                  // todo: add ability for player to win
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
