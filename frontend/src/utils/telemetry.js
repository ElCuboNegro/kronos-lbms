const LOG_KEY = 'kronos_telemetry_logs';
const MAX_LOGS = 100;

export const Telemetry = {
  log: (level, message, details = null) => {
    try {
      const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      const newLog = {
        timestamp: new Date().toISOString(),
        level,
        message: message ? message.toString() : 'Unknown error',
        details: details ? JSON.stringify(details, Object.getOwnPropertyNames(details)) : null
      };

      logs.unshift(newLog); // Añadir al inicio
      if (logs.length > MAX_LOGS) logs.pop(); // Mantener solo los últimos

      localStorage.setItem(LOG_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save telemetry log', e);
    }
  },

  getLogs: () => {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    } catch {
      return [];
    }
  },

  clearLogs: () => {
    localStorage.removeItem(LOG_KEY);
  },

  init: () => {
    window.addEventListener('error', (event) => {
      Telemetry.log('ERROR', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      Telemetry.log('UNHANDLED_PROMISE', event.reason?.message || 'Promise rejected', {
        stack: event.reason?.stack
      });
    });

    // Interceptar fetch errors genéricos globalmente
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        if (!response.ok && response.status >= 500) {
           Telemetry.log('HTTP_500+', `Fetch error ${response.status} on ${args[0]}`, { url: args[0], status: response.status });
        }
        return response;
      } catch (err) {
        Telemetry.log('FETCH_CRASH', err.message, { url: args[0], stack: err.stack });
        throw err;
      }
    };
  }
};
