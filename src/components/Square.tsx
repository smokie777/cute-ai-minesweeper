import { css } from '@emotion/css'
import { colors, minesweeperColors } from './colors';

export const Square = ({
  hasMine = false,
  isRevealed = false,
  isGameOverNode = false,
  isFlagged = false,
  number = 0,
  onClick = () => {}
}) => {
  const squareCss = css`
    height: 80px;
    width: 80px;
    user-select: none;
    font-size: 50px;
    color: ${minesweeperColors[number]};
    position: relative;

    .flag_container {
      height: 80px;
      width: 80px;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;

      .flag {
        height: 75%;
        width: 75%;
      }
    }

    .revealed_square_background {
      background: ${isGameOverNode ? colors.orange : colors.pinkBackground};
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
      {isFlagged && (
        <div className='flag_container'>
          <img 
            className='flag'
            alt='flag'
            src='assets/butterfly.png'
            width='80px'
            height='80px'
          />
        </div>
      )}
    </div>
  );
};
