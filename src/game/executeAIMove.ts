import { layout, aiMoveTimeMs } from '../constants';
import { fetch_post_vtuber_speak } from '../fetch_functions';
import { AIMoveType } from '../types';
import { GraphType } from './Graph';
import { NodeType } from './Node';

const moveCursorToNode = (node:NodeType) => {
  const baseTop = 31;
  const baseLeft = 22;
  const cursorEl = document.getElementById('cursor');
  if (cursorEl) {
    cursorEl.style.left = `${baseLeft + node.x * (layout.squareSize + 2) + ~~(Math.random() * 15)}px`;
    cursorEl.style.top = `${baseTop + node.y * (layout.squareSize + 2) + ~~(Math.random() * 15)}px`;
  }
};

export const executeAIMove = (AIMove:AIMoveType, graph:GraphType) => {
  moveCursorToNode(AIMove.node);

  setTimeout(() => {
    if (AIMove.action === 'click') {
      const numNodesRevealed = graph.nodeOnReveal(AIMove.node);
      if (!AIMove.shouldSkipReact) {
        if (numNodesRevealed > 10) {
          fetch_post_vtuber_speak(`You revealed ${numNodesRevealed} squares in one click in Minesweeper. Give a lukewarm response.`);
        } else if (numNodesRevealed > 20) {
          fetch_post_vtuber_speak(`You revealed ${numNodesRevealed} squares in one click in Minesweeper. Give a slightly excited response!`);
        } else if (numNodesRevealed > 30) {
          fetch_post_vtuber_speak(`You revealed ${numNodesRevealed} squares in one click in Minesweeper. Holy shit!`);
        }
      }
    } else if (AIMove.action === 'flag') {
      AIMove.node.isFlagged = !AIMove.node.isFlagged;
    }
  }, aiMoveTimeMs);
};
