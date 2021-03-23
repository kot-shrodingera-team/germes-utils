import { fireEvent } from '.';

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value'
).set;

/**
 * Ввод данных в React-элемент
 * @param element целевой элемент
 * @param value Вводимое значение
 */
export const setReactInputValue = (
  element: Element,
  value: string | number
): void => {
  if (element) {
    nativeInputValueSetter.call(element, value);
    fireEvent(element, 'input');
  }
  // const lastValue = element.value;
  // element.value = value;
  // const tracker = element._valueTracker;
  // if (tracker) {
  //   tracker.setValue(lastValue);
  // }
  // element.dispatchEvent(inputEvent);
};

/**
 * Получение reactInternalInstance элемента
 * @param element целевой элемент
 * @returns reactInternalInstance
 */
export const getReactInstance = (element: Element): unknown => {
  if (element) {
    return ((element as unknown) as Record<string, unknown>)[
      Object.keys(element).find((key) =>
        key.startsWith('__reactInternalInstance')
      )
    ];
  }
  return null;
};

/**
 * Получение reactEventHandlers элемента
 * @param element целевой элемент
 * @returns reactEventHandlers
 */
export const getReactEventHandlers = (element: Element): unknown => {
  if (element) {
    return ((element as unknown) as Record<string, unknown>)[
      Object.keys(element).find((key) => key.startsWith('__reactEventHandlers'))
    ];
  }
  return null;
};
