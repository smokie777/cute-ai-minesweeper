export type NodeType = {
  isRevealed: boolean;
  isFlagged: boolean;
  hasMine: boolean;
  number: number;
  l: NodeType | null;
  u: NodeType | null;
  r: NodeType | null;
  d: NodeType | null;
  ul: NodeType | null;
  ur: NodeType | null;
  dl: NodeType | null;
  dr: NodeType | null;
  x: number;
  y: number;
  getAllSurroundingNodes: () => NodeType[];
  onReveal: () => void;
};

export const Node = () => {
  const onReveal = () => {
    // if there is a mine, lose the game
    // if there is a number, reveal only the clicked node
    // if there is no number and no mine, call onReveal recursively on all adjacent nodes.
    if (node.isRevealed) {
      return;
    } else if (node.hasMine || node.number) {
      node.isRevealed = true;
    } else {
      node.isRevealed = true;
      node.getAllSurroundingNodes().forEach(i => {
        i.onReveal();
      });
    }
  };

  const node:NodeType = {
    // node properties
    isRevealed: false,
    isFlagged: false,
    hasMine: false,
    number: 0,
    // directional properties
    l: null,
    u: null,
    r: null,
    d: null,
    ul: null,
    ur: null,
    dl: null,
    dr: null,
    // coordinates on board
    x: 0,
    y: 0,
    // methods
    getAllSurroundingNodes: () => [
      node.l,
      node.u,
      node.r,
      node.d,
      node.ul,
      node.ur,
      node.dl,
      node.dr,
    ].filter(Boolean) as NodeType[],
    onReveal
  };

  return node;
};
