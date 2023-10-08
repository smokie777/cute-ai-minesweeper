import { css } from '@emotion/css';
import { colors } from './colors';

const topBarCss = css`
  background: ${colors.pinkDark};
  height: 80px;
  display: flex;
  justify-content: space-between;
  font-size: 50px;
  align-items: center;
  padding: 0 20px;

  .reset_button {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;

    img {
      height: 85%;
      width: 85%;
    }
  }

  .top_bar_number_display {
    width: 25%;

    &:last-child {
      display: flex;
      justify-content: flex-end;
    }
  }
`;

const formatTopBarNumDisplay = (num:number) => num < 0 ? '000' : num > 999 ? '999' : `${Array(3 - num.toString().length).fill('0').join('')}${num.toString()}`;

export const TopBar = ({
  mineCount,
  onResetClick,
  timer,
}:{
  mineCount:number;
  onResetClick:() => void;
  timer:number;
}) => (
  <div className={topBarCss}>
    <div
      className='top_bar_number_display'
      style={{ color: mineCount < 0 ? colors.orange : 'inherit' }}
    >
      {formatTopBarNumDisplay(mineCount)}
    </div>
    <div className='reset_button' onClick={onResetClick}>
      <img 
        className='flag'
        alt='flag'
        src='assets/butterfly.png'
        width='80px'
        height='80px'
      />
    </div>
    <div className='top_bar_number_display'>{formatTopBarNumDisplay(timer)}</div>
  </div>
);
