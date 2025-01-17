'use strict';

// eslint-disable-next-line no-console
const consoleError = console.error;

class RendererErrorHandler {
  logFn = null;
  onError = null;
  showDialog = false;

  constructor({ logFn = null } = {}) {
    this.handleError = this.handleError.bind(this);
    this.handleRejection = this.handleRejection.bind(this);
    this.startCatching = this.startCatching.bind(this);
    this.logFn = logFn;
  }

  handle(error, {
    logFn = this.logFn,
    errorName = '',
    onError = this.onError,
    showDialog = this.showDialog,
  } = {}) {
    try {
      if (onError?.({ error }) !== false) {
        logFn({ error, errorName, showDialog });
      }
    } catch {
      consoleError(error);
    }
  }

  setOptions({ logFn, onError, showDialog }) {
    if (typeof logFn === 'function') {
      this.logFn = logFn;
    }

    if (typeof onError === 'function') {
      this.onError = onError;
    }

    if (typeof showDialog === 'boolean') {
      this.showDialog = showDialog;
    }
  }

  startCatching({ onError, showDialog } = {}) {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.setOptions({ onError, showDialog });

    window.addEventListener('error', (event) => {
      event.preventDefault?.();
      this.handleError(event.error || event);
    });
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault?.();
      this.handleRejection(event.reason || event);
    });
  }

  handleError(error) {
    this.handle(error, { errorName: 'Unhandled' });
  }

  handleRejection(reason) {
    const error = reason instanceof Error
      ? reason
      : new Error(JSON.stringify(reason));
    this.handle(error, { errorName: 'Unhandled rejection' });
  }
}

module.exports = RendererErrorHandler;
