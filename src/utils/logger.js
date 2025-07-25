// Logger utility for production environment
const isProduction = import.meta.env.PROD;

export const logger = {
  log: (...args) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (!isProduction) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (!isProduction) {
      console.info(...args);
    }
  }
}; 