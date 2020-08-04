export const getElement = async (
  selector: string,
  rejectTime = 5000,
  context: Document | Element = document
): Promise<Element> => {
  return new Promise((resolve /* , reject */) => {
    let element = context.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    const observerConfig = { childList: true, subtree: true, attributes: true };

    const mutationObserver = new MutationObserver((mutations, observer) => {
      element = context.querySelector(selector);
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });

    if (rejectTime > 0) {
      setTimeout(() => {
        if (element === null) {
          resolve(element);
          mutationObserver.disconnect();
        }
      }, rejectTime);
    }

    mutationObserver.observe(context, observerConfig);
  });
};

export const awaiter = async <T, S = null, U = null>(
  condition: () => T,
  timeout = 3000,
  interval = 4,
  truthyValue: S = null,
  falsyValue: U = null
): Promise<T | S | U> => {
  return new Promise((resolve /* , reject */) => {
    const startTime = Date.now();
    const check = (): void => {
      const result = condition();
      if (result) {
        if (truthyValue === null) {
          resolve(result);
        } else {
          resolve(truthyValue);
        }
      } else if (Date.now() - startTime > timeout) {
        resolve(falsyValue);
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
};

export const domLoaded = (): Promise<void> =>
  new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), {
      once: true,
    });
  });

export const sleep = (msec: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, msec));

interface AnyEventInit extends EventInit {
  [key: string]: unknown;
}

export const fireEvent = (
  element: Element,
  eventName: string,
  EventClass: new (type: string, eventInitDict?: AnyEventInit) => Event = Event
): void => {
  const event = new EventClass(eventName, { bubbles: true });
  element.dispatchEvent(event);
};

export const caseInsensitiveCompare = (left: string, right: string): boolean =>
  left.localeCompare(right, 'en', { sensitivity: 'base' }) === 0;

export const escapeRegex = (string: string): string => {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
};

export const normalizeDiactric = (string: string): string =>
  string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const ri = (
  strings: TemplateStringsArray,
  ...args: Array<string | RegExp>
): RegExp => {
  const rawStrings = strings.raw;
  let result = rawStrings[0];
  for (let i = 1; i < rawStrings.length; i += 1) {
    let arg = args[i - 1];
    if (typeof arg === 'object' && 'source' in arg) {
      arg = arg.source;
    } else {
      arg = escapeRegex(arg);
    }
    result += arg + rawStrings[i];
  }
  return new RegExp(result, 'i');
};

export const minVersion = (version: string): boolean => {
  const stripZerosRegex = /(\.0+)+$/;
  const botSegments = worker.BotVer.replace(stripZerosRegex, '').split('.');
  const refSegments = version.replace(stripZerosRegex, '').split('.');

  for (
    let i = 0;
    i < Math.min(botSegments.length, refSegments.length);
    i += 1
  ) {
    const diff = Number(botSegments[i]) - Number(refSegments[i]);
    if (diff < 0) {
      return false;
    }
    if (diff > 0) {
      return true;
    }
  }
  return true;
};

export const checkUrl = (): boolean => {
  const url = new URL(worker.BookmakerMainUrl);
  return (
    window.location.host.replace(/^www\./, '') ===
    url.host.replace(/^www\./, '')
  );
};

export const toFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

export const parameterRegex = /[+-]?\d+(?:\.\d+)?/;

export const correctScoreParameter = (
  leftScore: number,
  rightScore: number
): number => {
  const digitsCount = Math.ceil(Math.log10(rightScore + 1));
  return Number(leftScore + rightScore / 10 ** digitsCount);
};

type RGB = [number, number, number];

const getRgbFromColorName = (color: string): RGB => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  const match = ctx.fillStyle.match(
    /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/
  );
  if (match) {
    return [
      parseInt(match[1], 16),
      parseInt(match[2], 16),
      parseInt(match[3], 16),
    ];
  }
  return [255, 255, 255];
};

export const log = (message: string, color = 'white'): void => {
  if (minVersion('0.1.814.4')) {
    worker.Helper.WriteLineRGB(message, ...getRgbFromColorName(color));
  } else {
    worker.Helper.WriteLine(message);
  }
  const dateTime = new Date();
  const timestamp = `[${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}.${dateTime.getMilliseconds()}]`;
  const string = `%c${timestamp}: %c${message}`;
  /* eslint-disable no-console */
  console.groupCollapsed(
    string,
    'font-weight: bold; color: blue',
    `color: ${color}; background: #252525; padding: 0 5px`
  );
  console.trace();
  console.groupEnd();
  /* eslint-enable no-console */
};

export const stakeInfoString = (): string => {
  return (
    `Событие: ${worker.EventTeams}\n` +
    `Ставка: ${worker.BetName}\n` +
    `Сумма: ${worker.StakeInfo.Summ}\n` +
    `Коэффициент: ${worker.StakeInfo.Coef}`
  );
};

export const getPhoneCountry = (): string => {
  const russianPhoneRegex = /(?:\+?7)?9(?!40)\d{9}/;
  const ukrainianPhoneRegex = /\+?380\d{9}/;
  const kazakhstanianPhoneRegex = /(?:\+?7)?7\d{9}/;
  const belarusianPhoneRegex = /\+?375\d{9}/;
  const azerbaijanianPhoneRegex = /\+?994\d{9}/;
  const abkhazianPhoneRegex = /(?:\+?7)?940\d{7}/;
  const albanianPhoneRegex = /\+?355\d{9}/;
  const moldavianPhoneRegex = /\+?373\d{8}/;
  if (belarusianPhoneRegex.test(worker.Login)) {
    return 'Беларусь';
  }
  if (russianPhoneRegex.test(worker.Login)) {
    return 'Россия';
  }
  if (ukrainianPhoneRegex.test(worker.Login)) {
    return 'Украина';
  }
  if (kazakhstanianPhoneRegex.test(worker.Login)) {
    return 'Казахстан';
  }
  if (moldavianPhoneRegex.test(worker.Login)) {
    return 'Молдавия';
  }
  if (abkhazianPhoneRegex.test(worker.Login)) {
    return 'Абхазия';
  }
  if (azerbaijanianPhoneRegex.test(worker.Login)) {
    return 'Азейбарджан';
  }
  if (albanianPhoneRegex.test(worker.Login)) {
    return 'Албания';
  }
  return null;
};
