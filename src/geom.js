// Геометрия пиксельных картинок страницы, в пикселях спрайта. Общая для art/page/* и src/*:
// по ней рисуется спрайт и ставятся поверх него canvas экрана и кнопки узлов.
export const DEVICE = { w: 82, h: 130, screen: { x: 9, y: 11, w: 64, h: 48 } };

export const BOARD = { w: 82, h: 130 };

// Узлы на плате со снятой крышкой. Расположение по docs/img/fabbit-board.png монорепы.
export const NODES = {
  analog: { x: 23, y: 15, w: 52, h: 31 },
  fpga: { x: 10, y: 51, w: 62, h: 29 },
  mcu: { x: 4, y: 96, w: 13, h: 13 },
  battery: { x: 20, y: 85, w: 55, h: 38 },
};
