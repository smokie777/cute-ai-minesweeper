import { css } from '@emotion/css'
import { colors, minesweeperColors } from './colors';

export const Square = ({
  hasMine = false,
  isRevealed = false,
  number = 0,
  onClick = () => {}
}) => {
  const squareCss = css`
    height: 80px;
    width: 80px;
    user-select: none;
    font-size: 50px;
    color: ${minesweeperColors[number]};

    .revealed_square_background {
      background: ${colors.pinkBackground};
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        height: 95%;
        width: 95%;
      }
    }

    .unrevealed_square_background {
      height: 80px;
      width: 80px;
      background: linear-gradient(-45deg, ${colors.pinkDark} 50%, ${colors.pinkLight} 50%);
      display: flex;
      justify-content: center;
      align-items: center;

      .square_foreground {
        background: ${colors.pink};
        height: 85%;
        width: 85%;
      }
    }
  `;

  return (
    <div className={squareCss} onClick={onClick}>
      {isRevealed ? (
        <div className='revealed_square_background'>
          {hasMine ? (
            <img 
              className='mine'
              alt='mine'
              src='assets/flower_1.png'
              width='80px'
              height='80px'
            />
          ) : (
            <div className='number'>{number !== 0 && number}</div>
          )}
        </div>
      ) : (
        <div className='unrevealed_square_background'>
          <div className='square_foreground' />
        </div>
      )}
    </div>
  );
};
