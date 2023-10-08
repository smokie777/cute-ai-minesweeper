import { css } from '@emotion/css';

const cursorCss = css`
  position: absolute;
  transition: all 0.75s linear;
  z-index: 1;
`;

export const Cursor = () => {
  return (
    <img
      id='cursor'
      className={cursorCss}
      alt='cursor'
      src='assets/cursor.png'
      width='80px'
      height='80px'
      style={{ top: '31px', left: '22px' }}
    />
  );
};
