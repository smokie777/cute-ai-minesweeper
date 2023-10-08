import { NodeType } from './Node';
import { AIMoveType } from './genAIMove';

const moveCursorToNode = (node:NodeType) => {
  const baseTop = 31;
  const baseLeft = 22;
  const cursorEl = document.getElementById('cursor');
  if (cursorEl) {
    cursorEl.style.left = `${baseLeft + node.x * (80 + 2) + ~~(Math.random() * 15)}px`;
    cursorEl.style.top = `${baseTop + node.y * (80 + 2) + ~~(Math.random() * 15)}px`;
  }
};

export const executeAIMove = (AIMove:AIMoveType) => {
  moveCursorToNode(AIMove.node);

  setTimeout(() => {
    if (AIMove.action === 'click') {
      AIMove.node.onReveal();
    } else if (AIMove.action === 'flag') {
      AIMove.node.isFlagged = !AIMove.node.isFlagged;
    }
  }, 750);
};
