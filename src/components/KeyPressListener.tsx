import { useEffect } from 'react';

export const KeyPressListener = ({
  setIsPlacingFlag
}:{
  setIsPlacingFlag: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  useEffect(() => {
    const onKeyDownCb = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        setIsPlacingFlag(true);
      }
    };
    const onKeyUpCb = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        setIsPlacingFlag(false);
      }
    };

    window.addEventListener('keydown', onKeyDownCb);
    window.addEventListener('keyup', onKeyUpCb);

    return () => {
      // Cleanup the event listeners on unmount
      window.removeEventListener('keydown', onKeyDownCb);
      window.removeEventListener('keyup', onKeyUpCb);
    };
  }, [setIsPlacingFlag]);

  return null;
};
