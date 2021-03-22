import { JsFailError } from './errors';

export const getElement = async <E extends Element = Element>(
  selector: string,
  rejectTime = 5000,
  context: Document | Element = document
): Promise<E> => {
  return new Promise((resolve /* , reject */) => {
    let element = context.querySelector<E>(selector);
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
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      resolve();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => resolve(), {
      once: true,
    });
  });

export const domFullLoaded = (): Promise<void> =>
  new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }
    window.addEventListener('load', () => resolve(), {
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
  return window.location.host.endsWith(url.host.replace(/^www\./, ''));
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

export const log = (message: string, color = 'white', dev = false): void => {
  if (dev && !worker.Dev) {
    return;
  }
  if (minVersion('0.1.814.4')) {
    worker.Helper.WriteLineRGB(message, ...getRgbFromColorName(color));
  } else {
    worker.Helper.WriteLine(message);
  }
  const dateTime = new Date();
  const hours = String(dateTime.getHours()).padStart(2, '0');
  const minutes = String(dateTime.getMinutes()).padStart(2, '0');
  const seconds = String(dateTime.getSeconds()).padStart(2, '0');
  const milliseconds = String(dateTime.getMilliseconds()).padStart(3, '0');
  const timestamp = `[${hours}:${minutes}:${seconds}.${milliseconds}]`;
  const string = `%c${timestamp}: %c${message}`;
  const consoleObject = window.consoleCopy ? window.consoleCopy : console;
  if (consoleObject.groupCollapsed && consoleObject.groupEnd) {
    consoleObject.groupCollapsed(
      string,
      'font-weight: bold; color: blue',
      `color: ${color}; background: #252525; padding: 0 5px`
    );
    if (consoleObject.trace) {
      consoleObject.trace();
    }
    consoleObject.groupEnd();
  } else {
    consoleObject.log(
      string,
      'font-weight: bold; color: blue',
      `color: ${color}; background: #252525; padding: 0 5px`
    );
    if (consoleObject.trace) {
      consoleObject.trace();
    }
  }
};

export const stakeInfoString = (): string => {
  return (
    `Событие: ${worker.TeamOne} vs ${worker.TeamTwo}\n` +
    `Ставка: ${worker.BetName}\n` +
    `Сумма: ${worker.StakeInfo.Summ}\n` +
    `Коэффициент: ${worker.StakeInfo.Coef}`
  );
};

export const getPhoneLoginData = (): {
  country: string;
  alphaCode: string;
  callingCode: string;
  nsn: number;
} => {
  // cc - Calling Code
  // nsn - National Significant Number
  const regexes = [
    {
      country: 'Россия',
      alphaCode: 'RU',
      callingCode: '+7',
      regex: /^(?:\+?7)?(?<nsn>9(?!40)\d{9})$/,
    },
    {
      country: 'Украина',
      alphaCode: 'UA',
      callingCode: '+380',
      regex: /^\+?380(?<nsn>\d{9})$/,
    },
    {
      country: 'Казахстан',
      alphaCode: 'KZ',
      callingCode: '+7',
      regex: /^(?:\+?7)?(?<nsn>7\d{9})$/,
    },
    {
      country: 'Беларусь',
      alphaCode: 'BY',
      callingCode: '+375',
      regex: /^\+?375(?<nsn>\d{9})$/,
    },
    {
      country: 'Азейбарджан',
      alphaCode: 'AZ',
      callingCode: '+994',
      regex: /^\+?994(?<nsn>\d{9})$/,
    },
    {
      country: 'Абхазия',
      alphaCode: 'GE-AB',
      callingCode: '+7',
      regex: /^(?:\+?7)?(?<nsn>940\d{7})$/,
    },
    {
      country: 'Грузия',
      alphaCode: 'GE',
      callingCode: '+995',
      regex: /^\+?995(?<nsn>\d{9})$/,
    },
    {
      country: 'Албания',
      alphaCode: 'AL',
      callingCode: '+355',
      regex: /^\+?355(?<nsn>\d{9})$/,
    },
    {
      country: 'Молдова',
      alphaCode: 'MD',
      callingCode: '+373',
      regex: /^\+?373(?<nsn>\d{8})$/,
    },
    {
      country: 'Армения',
      alphaCode: 'AM',
      callingCode: '+374',
      regex: /^\+?374(?<nsn>\d{6})$/,
    },
    {
      country: 'Таджикистан',
      alphaCode: 'TJ',
      callingCode: '+992',
      regex: /^\+?992(?<nsn>\d{9})$/,
    },
    {
      country: 'Туркменистан',
      alphaCode: 'TM',
      callingCode: '+993',
      regex: /^\+?993(?<nsn>\d{9})$/,
    },
    {
      country: 'Узбекистан',
      alphaCode: 'UZ',
      callingCode: '+998',
      regex: /^\+?998(?<nsn>\d{9})$/,
    },
    {
      country: undefined,
      alphaCode: undefined,
      callingCode: undefined,
      regex: /^\+\d{11,13}$/,
    },
  ];
  // eslint-disable-next-line no-restricted-syntax
  for (const { country, alphaCode, callingCode, regex } of regexes) {
    const match = worker.Login.match(regex);
    if (match) {
      return {
        country,
        alphaCode,
        callingCode,
        nsn: Number(match.groups.nsn),
      };
    }
  }
  return null;
};

export const killEventListener = (
  eventType: string,
  context: Window | Document | Element = window
): void => {
  context.addEventListener(
    eventType,
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    },
    {
      capture: true,
      passive: false,
    }
  );
};

export const nativeInput = (
  inputElement: HTMLInputElement,
  text: string,
  type: 'KeyDown' | 'KeyPress' = 'KeyDown'
): void => {
  const keyFunction =
    type === 'KeyDown'
      ? Api.DomEventsHelper.KeyDown
      : Api.DomEventsHelper.KeyPress;
  while (inputElement.value) {
    const oldValue = inputElement.value;
    keyFunction(8);
    const newValue = inputElement.value;
    if (!newValue) {
      break;
    } else if (oldValue === newValue) {
      log(
        `Ошибка нативного ввода: Не удалось очистить поле ввода. Значение не изменилось (${newValue})`
      );
      return;
    }
  }
  [...text].forEach((char) => {
    if (inputElement !== window.document.activeElement) {
      inputElement.focus();
    }
    const charCode = (() => {
      switch (char) {
        case '.':
          return 190;
        case ',':
          return 188;
        default:
          return char.charCodeAt(0);
      }
    })();
    keyFunction(charCode);
  });
};

export const timeString = (time: Date): string => {
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const miliseconds = String(time.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${miliseconds}`;
};

export const round = (value: number, precision = 2): number =>
  Number(value.toFixed(precision));

export const getWorkerParameter = (key: string): unknown => {
  if (!minVersion('0.1.818.0')) {
    return null;
  }
  try {
    const workerParameters = JSON.parse(worker.WorkerParameters);
    if (!(key in workerParameters)) {
      return null;
    }
    return workerParameters[key];
  } catch (e) {
    return null;
  }
};

export const repeatingOpenBet = async (
  openingAction: () => Promise<unknown>,
  getStakeCount: () => number,
  maxTryCount = 5,
  betAddedCheckTimout = 1000,
  betAddedCheckInterval = 50
): Promise<void> => {
  for (let i = 1; i <= maxTryCount; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await openingAction();
    // eslint-disable-next-line no-await-in-loop
    const betAdded = await awaiter(
      () => getStakeCount() === 1,
      betAddedCheckTimout,
      betAddedCheckInterval
    );

    if (!betAdded) {
      if (i === maxTryCount) {
        throw new JsFailError('Ставка так и не попала в купон');
      }
      log(`Ставка не попала в купон (попытка ${i})`, 'steelblue');
    } else {
      log('Ставка попала в купон', 'steelblue');
      break;
    }
  }
};
