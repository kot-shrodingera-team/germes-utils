import { JsFailError } from './errors';

/**
 * Promise, который резолвится, когда появляется нужный элемент в DOM, используется MutationObserver
 * @param selector Селектор, используемый в функции querySelector
 * @param rejectTime Таймаут в мс, если 0, то таймаута нет, по умолчанию 5000
 * @param context Котекст для выполнения метода querySelector и на который вешается MutationObserver, по умолчанию document
 * @returns Если элемент найден, он и возвращается, иначе null
 */
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
      element = context.querySelector<E>(selector);
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

export const elementRemoved = async (
  element: Element,
  rejectTime = 5000,
  context: Document | Element = null
): Promise<boolean> => {
  return new Promise((resolve /* , reject */) => {
    const resultContext = context || element.ownerDocument;
    let removed = false;
    if (!element || !resultContext.contains(element)) {
      removed = true;
      resolve(removed);
      return;
    }
    const observerConfig: MutationObserverInit = {
      childList: true,
      subtree: true,
    };

    const mutationObserver = new MutationObserver((mutations, observer) => {
      if (
        mutations.some((mutation) => {
          return [...mutation.removedNodes].some((removedNode) => {
            return removedNode.contains(element);
          });
        })
      ) {
        removed = true;
        resolve(removed);
        observer.disconnect();
      }
    });

    if (rejectTime > 0) {
      setTimeout(() => {
        if (removed === false) {
          resolve(removed);
          mutationObserver.disconnect();
        }
      }, rejectTime);
    }

    mutationObserver.observe(resultContext, observerConfig);
  });
};

/**
 * Promise, который повторяет колбэк и резолвится, когда значение колбэка truthy
 * @param condition Колбэк, который выполняется
 * @param timeout Таймаут повторения колбэков в мс, по умолчанию 5000
 * @param interval Интервал повторения колбэков, по умолчанию 50
 * @param truthyValue Возвращаемое значение, если колбэк вернул truthy результат, если этот параметр null, то возвращаемое значение равно результату колбэка, по умолчанию null
 * @param falsyValue Возвращаемое значение, если колбэк не вернул truthy результат за заданное время, по умолчанию null
 * @returns Если результат колбэка стал truthy за заданное время, и аргумент truthyValue равен null, то он (результат колбэка) и возвращается.
 * Если же результат колбэка так и не стал truthy за заданное время, то возвращается falsyValue
 */
export const awaiter = async <T, S = null, U = null>(
  condition: () => T,
  timeout = 5000,
  interval = 50,
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

/**
 * Promise, который резолвится когда DOM загружен (complete или interactive)
 */
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

/**
 * Promise, который резолвится когда DOM полностью загружен (complete)
 */
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

/**
 * Promise, который резолвится через время, то есть ожидание
 * @param msec Время ожидания в мс
 */
export const sleep = (msec: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, msec));

// interface AnyEventInit extends EventInit {
//   [key: string]: unknown;
// }

/**
 * Инициализация события для элемента DOM
 * @param element Элемент DOM, который является target для события
 * @param eventName Имя события
 * @param EventClass Класс события, по умолчанию Event
 */
export const fireEvent = (
  element: Element,
  eventName: string,
  EventClass: new (type: string, eventInitDict?: EventInit) => Event = Event
): void => {
  const event = new EventClass(eventName, { bubbles: true });
  element.dispatchEvent(event);
};

/**
 * Регистронезависимое сравнение двух строк, не учитывая акценты и другие диакртические знаки
 * @param left Левая строка
 * @param right Правая строка
 * @returns Если строки равны, возвращается true, иначе false
 */
export const caseInsensitiveCompare = (left: string, right: string): boolean =>
  left.localeCompare(right, 'en', { sensitivity: 'base' }) === 0;

/**
 * Слэш-экранирование символов, имеющих особое значение в регулярных выражениях .*+-?^${}()|[]\
 * @param string Исходная строка
 * @returns Строка с экранированными символами
 */
export const escapeRegex = (string: string): string => {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Удаление диактрических знаков из строка
 * @param string Исходная строка
 * @returns Строка без диактрических знаков
 */
export const normalizeDiactric = (string: string): string =>
  string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* eslint-disable prettier/prettier */
/**
 * Тэговая функция шаблонных литералов, генерирующая регистронезависимое регулярное выражение по следующему алгоритму:  
 * Массив строковых значения остаётся как есть, в raw формате  
 * Подстановки обрабатываются в зависимости от типа  
 * Если это регулярное выражение, тогда подставляется свойство source  
 * Иначе (если строка), подставляется эта же строка, но с экранированными символами  
 * Пример
 * ```
 * parameterRegex = /(\d(?:\.\d+))+/
 * teamName = 'Kraft.VK (Milan)'
 * handicapRegex = ri`Handicap (${teamName}) \[${parameterRegex}\]`
 * handicapRegex.source === /Handicap (Kraft\.VK \(Milan\)) \[(\d(?:\.\d+))+\]/i.source //true
 * ```
 * @param strings
 * @param args
 * @returns Сгенерированное регулярное выражение
 */
/* eslint-enable prettier/prettier */
export const ri = (
  strings: TemplateStringsArray,
  ...args: Array<string | RegExp>
): RegExp => {
  const rawStrings = strings.raw;
  let result = rawStrings[0];
  for (let i = 1; i < rawStrings.length; i += 1) {
    let arg = args[i - 1];
    if (arg instanceof RegExp) {
      arg = arg.source;
    } else {
      arg = escapeRegex(arg);
    }
    result += arg + rawStrings[i];
  }
  return new RegExp(result, 'i');
};

/**
 * Проверка версии бота
 * @param version Версия бота, относительно которой проверяем
 * @returns Если версия равна или новее той, относительно которой проверяем, возвращается true, иначе false
 */
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

/**
 * Проверка соответствия текущего открытого хоста указанному хосту бк в настройках бота,
 * www. вначале хостов не учитываются, проверяется только то, что текущий хост оканчивается хостом в настройках, потому что по факту могут быть добавлены поддомены
 * @returns Если хост соответствует, возвращается true, иначе false
 */
export const checkBookerHost = (): boolean => {
  const bookmakerHost = new URL(worker.BookmakerMainUrl).host.replace(
    /^www\./,
    ''
  );
  return window.location.host.replace(/^www\./, '').endsWith(bookmakerHost);
};

/**
 * Формирование FormData из объекта
 * @param data Исходный объект
 * @returns Итоговый экземпляр FormData
 */
export const toFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

export const parameterRegex = /[+-]?\d+(?:\.\d+)?/;

/**
 * Формирование параметра точного счёта
 * @param leftScore Левый счёт
 * @param rightScore Правый счёт
 * @returns Итоговый параметр
 */
export const correctScoreParameter = (
  leftScore: number,
  rightScore: number
): number => {
  const digitsCount = Math.ceil(Math.log10(rightScore + 1));
  return Number(leftScore + rightScore / 10 ** digitsCount);
};

type RGB = [number, number, number];

/**
 * Формирование RGB значений из текстового названия цвета
 * @param color CSS-цвет в текстовом формате
 * @returns Массив из трёх RGB значений
 */
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

/**
 * Вывод в
 * @param time
 * @returns
 */
export const timeString = (time: Date): string => {
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const miliseconds = String(time.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${miliseconds}`;
};

/**
 * Вывод сообщения в лог бк в боте и в консоль браузера
 * @param message Текст сообщения
 * @param color Цвет текста, по умолчанию белый
 * @param dev Выводить сообщение только при включённом Dev режиме бота, по умолчанию false
 */
export const log = (message: string, color = 'white', dev = false): void => {
  if (dev && !worker.Dev) {
    return;
  }
  if (minVersion('0.1.814.4')) {
    worker.Helper.WriteLineRGB(message, ...getRgbFromColorName(color));
  } else {
    worker.Helper.WriteLine(message);
  }
  const timestamp = timeString(new Date());
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

/**
 * Формарование строки с информацией о ставке (событие, роспись, сумма, коэффициент)
 * @returns Итоговая строка
 */
export const stakeInfoString = (): string =>
  `Событие: ${worker.TeamOne} vs ${worker.TeamTwo}\n` +
  `Ставка: ${worker.BetName}\n` +
  `Сумма: ${worker.StakeInfo.Summ}\n` +
  `Коэффициент: ${worker.StakeInfo.Coef}`;

// https://en.wikipedia.org/wiki/List_of_mobile_telephone_prefixes_by_country
/**
 * Формирование данных номере телефона в поле логина
 * @returns Если логин определяется как номер телефона, то возвращается объект со следующими полями:
 * - country - Страна в тектовом формате на русском языке
 * - alphaCode - Alpha-2 код страны в соответствии со стандартом ISO 3166-1
 * - callingCode - Телефонный код страны
 * - nsn - Значимая часть номера телефона (National Significant Number)
 *
 * Если логин не определяется нором как номер телефона, возвращается null
 */
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

/**
 * Удаление eventListener'ов с объекта
 * @param eventType Тип события
 * @param context Целевой объект, по умолчанию window
 */
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

/**
 * "Нативный" ввод, используя методы нажатия клавиш клавиатуры
 * @param inputElement Целевой элемент
 * @param text Текст для ввода
 * @param type Тип события нажатия на клавишу (KeyDown или KeyPress), по умолчанию KeyDown
 */
export const nativeInput = (
  inputElement: HTMLInputElement,
  text: string,
  type: 'KeyDown' | 'KeyPress' = 'KeyDown'
): void => {
  const keyFunction =
    type === 'KeyDown'
      ? worker.Api.DomEventsHelper.KeyDown
      : worker.Api.DomEventsHelper.KeyPress;
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

/**
 * Округление числа
 * @param value Исходное число
 * @param precision Точность, максмальное количество знаков после запятой
 * @returns Округлённое число
 */
export const round = (value: number, precision = 2): number =>
  Number(value.toFixed(precision));

/**
 * Значение поля из параметров Worker в настройках бк в боте
 * @param key Название поля
 * @returns Если есть данное поле, возвращается его значение, иначе null
 */
export const getWorkerParameter = <T>(
  key: string,
  type: 'string' | 'number' | 'boolean' = 'boolean'
): T => {
  try {
    const BookmakerAdditionalOptions = (() => {
      if (worker.BookmakerAdditionalOptions) {
        return JSON.parse(worker.BookmakerAdditionalOptions);
      }
      if (worker.WorkerParameters) {
        return JSON.parse(worker.WorkerParameters);
      }
      return {};
    })();
    const forkData =
      worker.BetId && worker.BetId.startsWith('{')
        ? JSON.parse(worker.BetId)
        : null;
    const forkParameters = forkData && forkData.BookmakerAdditionalOptions;
    const parameters = { ...BookmakerAdditionalOptions, ...forkParameters };
    if (!(key in parameters)) {
      return undefined;
    }
    const value = parameters[key];
    if (typeof value !== type) {
      log(`Тип параметра ${key} не равен ${type}. Обратитесь в ТП`, 'crimson');
      return undefined;
    }
    return value;
  } catch (e) {
    log(e.message, 'red');
    return undefined;
  }
};

/**
 * Повторение попытки открытия ставки
 * @param openingAction Функция открытия ставки
 * @param getStakeCount Функция определения количества ставок в купоне
 * @param maxTryCount Максимальное количество попыток, по умолчанию 5
 * @param betAddedCheckTimeout Таймаут проверки попадания ставки в купон, по умолчанию 1000
 * @param betAddedCheckInterval Интервал между проверками попадания ставки в купон, по умолчанию 50
 */
export const repeatingOpenBet = async (
  openingAction: () => Promise<unknown>,
  getStakeCount: () => number,
  maxTryCount = 5,
  betAddedCheckTimeout = 1000,
  betAddedCheckInterval = 50
): Promise<void> => {
  for (let i = 1; i <= maxTryCount; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await openingAction();
    // eslint-disable-next-line no-await-in-loop
    const betAdded = await awaiter(
      () => getStakeCount() === 1,
      betAddedCheckTimeout,
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

export const getRemainingTimeout = (maximum?: number): number => {
  const result =
    window.germesData.betProcessingTimeout -
    (new Date().getTime() - window.germesData.doStakeTime.getTime());
  if (
    maximum !== undefined &&
    window.germesData.betProcessingTimeout > maximum
  ) {
    return maximum;
  }
  return result;
};

export const trim = (string: string, short = false): string => {
  if (short) {
    return string.trim();
  }
  return string
    .replace(/(^[^\S\n]+|[^\S\n]+$)/gm, '') // удаление пробельных символов (кроме переносов) из начал и концов строк
    .replace(/[^\S\n]+/g, ' ') // "сжимание" последовательностей пробельных символов (кроме переносов) до одного пробела
    .replace(/\n+/g, '\n') // "сжимание" последовтельностей переносов до одного переноса
    .replace(/^\n+|\n+$/g, ''); // удаление переносов строк вначале и в конце строки
};

export const text = (element: Element, short = false): string => {
  if (!element) {
    return undefined;
  }
  if (element.constructor.name === 'HTMLInputElement') {
    return trim((<HTMLInputElement>element).value, short);
  }
  return trim(element.textContent, short);
};

export type MultiAwaiterData<T> = Record<
  string,
  Promise<T> | (() => Promise<T>)
>;

export const multiAwaiter = async <T>(
  promises: MultiAwaiterData<T>
): Promise<{ result: T; key: string }> => {
  let resultKey = null;
  let wasFirstResult = false;
  const flaggedAsyncFunctions = Object.keys(promises).map((key) => async () => {
    const result =
      typeof promises[key] === 'function'
        ? await (promises[key] as () => Promise<T>)()
        : await (promises[key] as Promise<T>);
    if (wasFirstResult === true) {
      return undefined;
    }
    wasFirstResult = true;
    if (result === null) {
      resultKey = null;
      return null;
    }
    resultKey = key;
    return result;
  });
  const result = await Promise.race(
    flaggedAsyncFunctions.map((func) => func())
  );
  return {
    result,
    key: resultKey,
  };
};

export const sendTGBotMessage = (
  token: string,
  chatId: number,
  message: string
): Promise<Response> => {
  const timestamp = timeString(new Date());
  const fullMessage =
    `[${timestamp}]\n` +
    `[${worker.ApiKey}/${window.germesData.bookmakerName}]\n` +
    `${message.replace(/"/g, '\\"')}`;
  // eslint-disable-next-line no-useless-escape
  return fetch(`https:\/\/api.telegram.org/bot${token}/sendMessage`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: `{"chat_id": "${chatId}","text": "${fullMessage}","disable_notification": false}`,
  });
};

interface RecaptchaClient {
  id: string;
  version: string;
  pageurl: string;
  sitekey: string;
  callback: string;
  function: (token: string) => unknown;
}

export const findRecaptchaClients = (
  context: Window = window
): RecaptchaClient[] => {
  type CaptchaWindow = typeof window & {
    ___grecaptcha_cfg: {
      clients: unknown;
    };
  };
  const $context = <CaptchaWindow>(context || window);
  // eslint-disable-next-line no-underscore-dangle
  if (typeof $context.___grecaptcha_cfg !== 'undefined') {
    // eslint-disable-next-line no-underscore-dangle
    return Object.entries($context.___grecaptcha_cfg.clients).map(
      ([cid, client]) => {
        const data = <RecaptchaClient>{
          id: cid,
          version: Number(cid) >= 10000 ? 'V3' : 'V2',
          pageurl: undefined,
          sitekey: undefined,
          callback: undefined,
          function: undefined,
        };
        const objects = Object.entries(client).filter(
          ([, value]) => value && typeof value === 'object'
        );

        objects.forEach(([toplevelKey, toplevel]) => {
          const found = Object.entries(toplevel).find(
            ([, value]) =>
              value &&
              typeof value === 'object' &&
              'sitekey' in value &&
              'size' in value
          );

          if (
            typeof toplevel === 'object' &&
            toplevel instanceof $context.HTMLElement &&
            toplevel.tagName === 'DIV'
          ) {
            data.pageurl = toplevel.baseURI;
          }

          if (found) {
            const [sublevelKey, sublevel] = found;

            data.sitekey = sublevel.sitekey;
            const callbackKey =
              data.version === 'V2' ? 'callback' : 'promise-callback';
            const callback = sublevel[callbackKey];
            if (!callback) {
              data.callback = null;
              data.function = null;
            } else {
              data.function = callback;
              const keys = [cid, toplevelKey, sublevelKey, callbackKey]
                .map((key) => `['${key}']`)
                .join('');
              data.callback = `___grecaptcha_cfg.clients${keys}`;
            }
          }
        });
        return data;
      }
    );
  }
  return [];
};

export const resolveRecaptcha = async (context: Window): Promise<void> => {
  const $context = context || window;
  if (!worker.RuCaptchaApiKey) {
    throw new Error('Не указан ключ RuCaptcha. Невозможно решить капчу');
  }
  const recaptchaClients = findRecaptchaClients($context);
  if (recaptchaClients.length === 0) {
    throw new Error('Не найден клиент капчи');
  }
  const recaptchaClient = recaptchaClients[0];
  const rucapthcaInUrl = `https://rucaptcha.com/in.php?key=${
    worker.RuCaptchaApiKey
  }&method=userrecaptcha&googlekey=${
    recaptchaClient.sitekey
  }&pageurl=${encodeURIComponent(
    recaptchaClient.pageurl
  )}&header_acao=1&json=1`;
  const rucapthcaInResponse = await (await fetch(rucapthcaInUrl)).json();
  if (!('status' in rucapthcaInResponse)) {
    throw new Error('no status in rucapthcaInResponse');
  }
  if (rucapthcaInResponse.status !== 1) {
    throw new Error('rucapthcaInResponse status is not 1');
  }
  if (!('request' in rucapthcaInResponse)) {
    throw new Error('no request in rucapthcaInResponse');
  }
  const rucaptchaRequestId = rucapthcaInResponse.request;
  const rucapthcaResUrl = `https://rucaptcha.com/res.php?key=${worker.RuCaptchaApiKey}&action=get&id=${rucaptchaRequestId}&header_acao=1&json=1`;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const rucapthcaResResponse = await (await fetch(rucapthcaResUrl)).json();
    if (!('status' in rucapthcaResResponse)) {
      throw new Error('no status in rucapthcaResResponse');
    }
    if (rucapthcaResResponse.status === 0) {
      log('Капча ещё не решена', 'steelblue');
      // eslint-disable-next-line no-await-in-loop
      await sleep(5000);
    } else {
      log('Капча решена', 'green');
      if (rucapthcaResResponse.status !== 1) {
        throw new Error('rucapthcaResResponse status is not 1');
      }
      if (!('request' in rucapthcaResResponse)) {
        throw new Error('no request in rucapthcaResResponse');
      }
      const token = rucapthcaResResponse.request;
      recaptchaClient.function(token);
      return;
    }
  }
};

export const checkCurrency = (siteCurrency: string): void => {
  if (siteCurrency === 'Unknown') {
    return;
  }
  const botCurrency = worker.Currency;
  if (siteCurrency !== botCurrency) {
    throw new JsFailError(
      `Не совпадают валюты в боте (${botCurrency}) и на сайте (${siteCurrency})`
    );
  }
};

export const comparePrimitiveArrays = (
  leftArray: unknown[],
  rightArray: unknown[]
): boolean => {
  return (
    Array.isArray(leftArray) &&
    Array.isArray(rightArray) &&
    leftArray.length === rightArray.length &&
    leftArray.every((value, index) => value === rightArray[index])
  );
};
