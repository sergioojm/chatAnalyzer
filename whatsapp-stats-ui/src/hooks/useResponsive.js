import { useEffect, useState } from 'react';

const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState('desktop');

  const handleResize = () => {
    if (window.innerWidth < breakpoints.mobile) {
      setScreenSize('mobile');
    } else if (window.innerWidth < breakpoints.tablet) {
      setScreenSize('tablet');
    } else {
      setScreenSize('desktop');
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

export default useResponsive;