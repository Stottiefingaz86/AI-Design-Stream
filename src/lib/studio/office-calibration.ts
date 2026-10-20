/** Pixel calibration for the rendered loft plates (3200x1800). Generated from the loft-office Blender scene */
export type Pt = [number, number];
export interface SeatCalib { feet: Pt; deskFront: Pt; deskTop: Pt; monitor: Pt; head: Pt; unit?: Pt }
/** A front prop rendered as its own plate so people can walk in front of / behind it. */
export interface PropCalib { depth: number; x: number; y: number; w: number; h: number; src: string }
export interface OfficeCalibration {
  resolution: Pt;
  floor: { c00: Pt; c10: Pt; c11: Pt; c01: Pt };
  unit: { origin: Pt; col: Pt; row: Pt; up: Pt };
  seats: Record<string, SeatCalib>;
  ceo: { seat: Pt; deskTop: Pt; label: Pt };
  board: { tl: Pt; tr: Pt; br: Pt; bl: Pt };
  props?: Record<string, PropCalib>;
  review?: { tl: Pt; tr: Pt; br: Pt; bl: Pt };
  logo?: { tl: Pt; tr: Pt; br: Pt; bl: Pt };
}
export const OFFICE_CALIBRATION: OfficeCalibration = {
  "resolution": [
    3200,
    1800
  ],
  "floor": {
    "c00": [
      1476.58,
      420.2
    ],
    "c10": [
      2546.24,
      1037.76
    ],
    "c11": [
      1723.42,
      1512.81
    ],
    "c01": [
      653.76,
      895.25
    ]
  },
  "unit": {
    "origin": [
      1476.58,
      420.2
    ],
    "col": [
      1558.86,
      467.71
    ],
    "row": [
      1394.3,
      467.71
    ],
    "up": [
      1476.58,
      325.19
    ]
  },
  "seats": {
    "lead": {
      "feet": [
        1624.68,
        614.97
      ],
      "deskFront": [
        1513.6,
        679.1
      ],
      "deskTop": [
        1550.63,
        589.32
      ],
      "monitor": [
        1536.64,
        564.14
      ],
      "head": [
        1612.34,
        493.83
      ],
      "unit": [
        2.95,
        1.15
      ]
    },
    "librarian": {
      "feet": [
        1846.84,
        743.23
      ],
      "deskFront": [
        1735.76,
        807.37
      ],
      "deskTop": [
        1772.79,
        717.58
      ],
      "monitor": [
        1758.8,
        692.4
      ],
      "head": [
        1834.5,
        622.1
      ],
      "unit": [
        5.65,
        1.15
      ]
    },
    "designer": {
      "feet": [
        2069.0,
        871.5
      ],
      "deskFront": [
        1957.92,
        935.63
      ],
      "deskTop": [
        1994.95,
        845.84
      ],
      "monitor": [
        1980.96,
        820.67
      ],
      "head": [
        2056.66,
        750.36
      ],
      "unit": [
        8.35,
        1.15
      ]
    },
    "qa": {
      "feet": [
        2291.16,
        999.76
      ],
      "deskFront": [
        2180.08,
        1063.89
      ],
      "deskTop": [
        2217.11,
        974.11
      ],
      "monitor": [
        2203.12,
        948.93
      ],
      "head": [
        2278.82,
        878.62
      ],
      "unit": [
        11.05,
        1.15
      ]
    },
    "ui_engineer": {
      "feet": [
        1460.12,
        804.99
      ],
      "deskFront": [
        1349.04,
        869.12
      ],
      "deskTop": [
        1386.07,
        779.34
      ],
      "monitor": [
        1372.08,
        754.16
      ],
      "head": [
        1447.78,
        683.85
      ],
      "unit": [
        3.95,
        4.15
      ]
    },
    "tokens": {
      "feet": [
        1682.28,
        933.25
      ],
      "deskFront": [
        1571.2,
        997.39
      ],
      "deskTop": [
        1608.23,
        907.6
      ],
      "monitor": [
        1594.24,
        882.42
      ],
      "head": [
        1669.94,
        812.11
      ],
      "unit": [
        6.65,
        4.15
      ]
    },
    "engineer": {
      "feet": [
        1904.44,
        1061.52
      ],
      "deskFront": [
        1793.36,
        1125.65
      ],
      "deskTop": [
        1830.39,
        1035.86
      ],
      "monitor": [
        1816.4,
        1010.69
      ],
      "head": [
        1892.1,
        940.38
      ],
      "unit": [
        9.35,
        4.15
      ]
    }
  },
  "ceo": {
    "seat": [
      1242.08,
      1211.16
    ],
    "deskTop": [
      1316.13,
      1081.94
    ],
    "label": [
      1188.59,
      1242.04
    ]
  },
  "board": {
    "tl": [
      1287.33,
      339.44
    ],
    "tr": [
      1369.61,
      291.94
    ],
    "br": [
      1369.61,
      386.95
    ],
    "bl": [
      1287.33,
      434.45
    ]
  },
  "props": {
    "lead": {
      "depth": 681.48,
      "x": 1247,
      "y": 491,
      "w": 508,
      "h": 340,
      "src": "/studio/office/prop-lead.webp"
    },
    "librarian": {
      "depth": 809.74,
      "x": 1469,
      "y": 619,
      "w": 509,
      "h": 340,
      "src": "/studio/office/prop-librarian.webp"
    },
    "designer": {
      "depth": 938.0,
      "x": 1692,
      "y": 748,
      "w": 508,
      "h": 340,
      "src": "/studio/office/prop-designer.webp"
    },
    "qa": {
      "depth": 1066.27,
      "x": 1914,
      "y": 876,
      "w": 508,
      "h": 340,
      "src": "/studio/office/prop-qa.webp"
    },
    "ui_engineer": {
      "depth": 871.5,
      "x": 1083,
      "y": 681,
      "w": 508,
      "h": 340,
      "src": "/studio/office/prop-ui_engineer.webp"
    },
    "tokens": {
      "depth": 999.76,
      "x": 1305,
      "y": 809,
      "w": 508,
      "h": 340,
      "src": "/studio/office/prop-tokens.webp"
    },
    "engineer": {
      "depth": 1128.02,
      "x": 1527,
      "y": 938,
      "w": 508,
      "h": 340,
      "src": "/studio/office/prop-engineer.webp"
    },
    "ceo": {
      "depth": 1237.28,
      "x": 952,
      "y": 937,
      "w": 601,
      "h": 440,
      "src": "/studio/office/prop-ceo.webp"
    },
    "cart": {
      "depth": 1396.43,
      "x": 1450,
      "y": 1104,
      "w": 559,
      "h": 442,
      "src": "/studio/office/prop-cart.webp"
    },
    "sofa": {
      "depth": 852.5,
      "x": 627,
      "y": 620,
      "w": 503,
      "h": 357,
      "src": "/studio/office/prop-sofa.webp"
    },
    "plant_c": {
      "depth": 1474.81,
      "x": 1487,
      "y": 1252,
      "w": 374,
      "h": 335,
      "src": "/studio/office/prop-plant_c.webp"
    },
    "plant_d": {
      "depth": 909.5,
      "x": 483,
      "y": 727,
      "w": 404,
      "h": 300,
      "src": "/studio/office/prop-plant_d.webp"
    },
    "redbull": {
      "depth": 662.48,
      "x": 863,
      "y": 388,
      "w": 472,
      "h": 437,
      "src": "/studio/office/prop-redbull.webp"
    }
  }
};

export const PLATE_ROOM = "/studio/office/plate-room.webp?v=neighbours-back";
/** legacy single front plate (unused when `props` are present) */
export const PLATE_FRONT = "/studio/office/plate-front.webp";
