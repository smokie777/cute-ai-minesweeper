import { flatten1Depth, pickRandomFromArray } from '../utils';
import { Node, NodeType } from './Node';

export type GraphType = {
  nodes: NodeType[][],
  populateMines: (numMines:number, initialX:number, initialY:number) => void;
  revealAllMines: () => void;
  pickFirstMove: () => NodeType;
  getSomeFlaggableNodes: () => NodeType[];
  getSomeClickableNodes: () => NodeType[];
}

export const Graph = (width: number, height: number) => {
  // populate graph node references
  const nodes:NodeType[][] = Array(height) // this is a nested array to represent the board
    .fill(null)
    .map(i => Array(width).fill(null).map(i => Node()));
  const nodeFlagCache:NodeType[] = [];
  const nodeClickCache:NodeType[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      nodes[y][x].x = x;
      nodes[y][x].y = y;    
      nodes[y][x].l = x > 0 ? nodes[y][x - 1] : null;
      nodes[y][x].u = y > 0 ? nodes[y - 1][x] : null;
      nodes[y][x].r = x < width - 1 ? nodes[y][x + 1] : null;
      nodes[y][x].d = y < height - 1 ? nodes[y + 1][x] : null;
      nodes[y][x].ul = y > 0 && x > 0 ? nodes[y - 1][x - 1] : null;
      nodes[y][x].ur = y > 0 && x < width - 1 ? nodes[y - 1][x + 1] : null;
      nodes[y][x].dl = y < height - 1 && x > 0 ? nodes[y + 1][x - 1] : null;
      nodes[y][x].dr = y < height - 1 && x < width - 1 ? nodes[y + 1][x + 1] : null;
    }
  }

  return {
    // properties
    nodes,
    // methods
    populateMines: (numMines:number, initialX:number, initialY:number) => {
      // commented out for testing
      // nodes.forEach(arr => {
      //   arr.forEach(i => {
      //     i.hasMine = false;
      //   });
      // });
      // place mines
      const nodesThatCantHaveMines = [
        ...(nodes[initialY][initialX]).getAllSurroundingNodes(),
        nodes[initialY][initialX]
      ];
      const coordinatesThatCanHaveMines = flatten1Depth(nodes)
        .map(i => ({
          x: i.x,
          y: i.y
        }))
        .filter(i => !nodesThatCantHaveMines.find(j => j.x === i.x && j.y === i.y));
      for (let i = 0; i < numMines; i++) {
        const mineCoordinates = pickRandomFromArray(coordinatesThatCanHaveMines);
        nodes[mineCoordinates.y][mineCoordinates.x].hasMine = true;
        coordinatesThatCanHaveMines.splice(
          coordinatesThatCanHaveMines.findIndex(
            i => i.x === mineCoordinates.x && i.y === mineCoordinates.y
          ),
          1
        )
      }
      // populate numbers
      nodes.forEach(arr => {
        arr.forEach(node => {
          if (!node.hasMine) {
            node.number = node.getAllSurroundingNodes().filter(i => i.hasMine).length
          }
        });
      });
    },
    revealAllMines: () => {
      nodes.forEach(arr => {
        arr.forEach(i => {
          if (i.hasMine) {
            i.isRevealed = true;
          }
        });
      });
    },
    pickFirstMove: () => {
      const pool:NodeType[] = [];
      for (let y = 2; y < nodes.length - 2; y++) {
        for (let x = 2; x < nodes[y].length - 2; x++) {
          pool.push(nodes[y][x]);
        }
      }
      return pickRandomFromArray(pool);
    },
    getSomeFlaggableNodes: () => {
      for (let y = 0; y < nodes.length; y++) {
        for (let x = 0; x < nodes[y].length; x++) {
          const node = nodes[y][x];
          if (!nodeFlagCache.includes(node) && node.isRevealed && node.number) {
            const surroundingNodes = node.getAllSurroundingNodes().filter(i => !i.isRevealed);
            if (surroundingNodes.length === node.number) {
              nodeFlagCache.push(node);
              const surroundingNonFlaggedNodes = surroundingNodes.filter(i => !i.isFlagged);
              return surroundingNonFlaggedNodes;
            }
          }
        }
      }
      return [];
    },
    getSomeClickableNodes: () => {
      for (let y = 0; y < nodes.length; y++) {
        for (let x = 0; x < nodes[y].length; x++) {
          const node = nodes[y][x];
          if (!nodeClickCache.includes(node) && node.isRevealed && node.number) {
            const surroundingNodes = node.getAllSurroundingNodes().filter(i => !i.isRevealed);
            const surroundingFlaggedNodes = surroundingNodes.filter(i => i.isFlagged);
            const surroundingNonFlaggedNodes = surroundingNodes.filter(i => !i.isFlagged);
            if (
              surroundingFlaggedNodes.length === node.number
              && surroundingNonFlaggedNodes.length
            ) {
              nodeClickCache.push(node);
              return surroundingNonFlaggedNodes;
            }
          }
        }
      }
      return [];
    }
  };
};
