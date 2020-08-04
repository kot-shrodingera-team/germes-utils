import { log } from '.';

class GermesRequest {
  subscribes: {
    [url: string]: ((
      url: string,
      data: string,
      method: string,
      fullUrl: string
    ) => unknown)[];
  };

  constructor() {
    this.subscribes = {};
  }

  subscribe(
    url: string,
    callback: (
      url: string,
      data: string,
      method: string,
      fullUrl: string
    ) => void
  ): void {
    if (!this.subscribes[url]) {
      this.subscribes[url] = [];
    }
    if (worker.Api.Request.AddRequestResponseHandler(url)) {
      this.subscribes[url].push(callback);
    } else {
      log(`Не удалось подписаться на url: "${url}"`, 'red');
    }
  }

  onResponse(url: string, data: string, method: string, fullUrl: string): void {
    if (this.subscribes[url]) {
      this.subscribes[url].forEach((callback) =>
        callback(url, data, method, fullUrl)
      );
    } else {
      log(`Нет подписок для url: "${url}"`, 'red');
    }
  }

  clearAllRequestResponseSubscribes(): void {
    this.subscribes = {};
    worker.Api.Request.ClearAllRequestResponseSubscribes();
  }
}

export default GermesRequest;
