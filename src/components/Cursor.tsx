import { css } from '@emotion/css';
import { aiMoveTimeMs, layout } from '../constants';

const cursorCss = css`
  position: absolute;
  transition: all ${aiMoveTimeMs / 1000}s linear;
  z-index: 1;
`;

export const Cursor = () => {
  return (
    <img
      id='cursor'
      className={cursorCss}
      alt='cursor'
      src='assets/cursor.png'
      width={`${layout.squareSize}px`}
      height={`${layout.squareSize}px`}
      style={{ top: '31px', left: '22px' }}
    />
  );
};
