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

import { GraphType } from './Graph';
import { NodeType } from './Node';

export interface AIMoveType {
  node: NodeType,
  action: 'click'|'flag'
}

export const genAIMove = (graph:GraphType, isFirstMove = false): AIMoveType => {
  if (isFirstMove) {
    return {
      node: graph.pickFirstMove(),
      action: 'click'
    };
  }

  return {
    node: graph.nodes[0][0], action: 'click'
  }
};
