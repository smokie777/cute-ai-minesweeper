import { NodeType } from './game/Node';

export interface AIMoveType {
  node: NodeType;
  action: 'click'|'flag';
  shouldSkipReact: boolean;  
}
