function throttle(func, delay) {
    let timer = null;
    let lastExecTime = 0;
    return function(...args) {
      const now = Date.now();
      const remainingTime = delay - (now - lastExecTime);
      if (remainingTime <= 0) {
        lastExecTime = now;
        clearTimeout(timer);
        func.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          lastExecTime = Date.now();
          timer = null;
          func.apply(this, args);
        }, remainingTime);
      }
    }
  }
  function debounce(func, delay) {
    let timer = null;
    return function(...args) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, delay);
    }
  }
  
  module.exports={
    throttle,
    debounce
  }
  