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
  getAllSurroundingNodes: () => (NodeType | null)[];
};

export const Node = () => {
  const node = {
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
    ] 

  };

  return node;
};
