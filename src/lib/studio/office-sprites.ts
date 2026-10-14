/** Character sprite sheets rendered from the cast models (iso camera matching the loft plates).
 *  Generated from the Blender cast renders — do not edit by hand. */
export interface SpriteClip {
  src: string;
  frames: number;
  cols: number;
  fw: number;
  fh: number;
  /** ground anchor inside a frame, px */
  ax: number;
  ay: number;
  loop: boolean;
}
export interface SpriteManifest {
  /** camera-plane pixels per metre the sheets were rendered at */
  pxPerM: number;
  fps: number;
  chars: Record<string, Record<string, SpriteClip>>;
}
export const OFFICE_SPRITES: SpriteManifest = {
 "pxPerM": 128.0,
 "fps": 10,
 "chars": {
  "lead": {
   "sit_dl": {
    "src": "/studio/office/chars/lead/sit_dl.webp",
    "frames": 60,
    "cols": 35,
    "fw": 115,
    "fh": 204,
    "ax": 75.0,
    "ay": 165.5,
    "loop": true
   },
   "cheer_dl": {
    "src": "/studio/office/chars/lead/cheer_dl.webp",
    "frames": 26,
    "cols": 26,
    "fw": 110,
    "fh": 202,
    "ax": 71.0,
    "ay": 167.5,
    "loop": false
   },
   "walk_dl": {
    "src": "/studio/office/chars/lead/walk_dl.webp",
    "frames": 41,
    "cols": 39,
    "fw": 105,
    "fh": 214,
    "ax": 57.0,
    "ay": 191.5,
    "loop": true
   },
   "walk_dr": {
    "src": "/studio/office/chars/lead/walk_dr.webp",
    "frames": 41,
    "cols": 41,
    "fw": 97,
    "fh": 206,
    "ax": 63.0,
    "ay": 187.5,
    "loop": true
   },
   "walk_ul": {
    "src": "/studio/office/chars/lead/walk_ul.webp",
    "frames": 41,
    "cols": 41,
    "fw": 97,
    "fh": 217,
    "ax": 34.0,
    "ay": 197.5,
    "loop": true
   },
   "walk_ur": {
    "src": "/studio/office/chars/lead/walk_ur.webp",
    "frames": 41,
    "cols": 39,
    "fw": 105,
    "fh": 206,
    "ax": 48.0,
    "ay": 193.5,
    "loop": true
   },
   "idle_dl": {
    "src": "/studio/office/chars/lead/idle_dl.webp",
    "frames": 40,
    "cols": 40,
    "fw": 84,
    "fh": 189,
    "ax": 48.0,
    "ay": 165.5,
    "loop": true
   },
   "idle_dr": {
    "src": "/studio/office/chars/lead/idle_dr.webp",
    "frames": 40,
    "cols": 40,
    "fw": 82,
    "fh": 162,
    "ax": 54.0,
    "ay": 158.5,
    "loop": true
   },
   "chat_dl": {
    "src": "/studio/office/chars/lead/chat_dl.webp",
    "frames": 51,
    "cols": 42,
    "fw": 96,
    "fh": 209,
    "ax": 62.0,
    "ay": 196.5,
    "loop": true
   },
   "chat_dr": {
    "src": "/studio/office/chars/lead/chat_dr.webp",
    "frames": 51,
    "cols": 29,
    "fw": 140,
    "fh": 212,
    "ax": 78.0,
    "ay": 198.5,
    "loop": true
   },
   "type_dl": {
    "src": "/studio/office/chars/lead/type_dl.webp",
    "frames": 39,
    "cols": 39,
    "fw": 103,
    "fh": 193,
    "ax": 56.0,
    "ay": 168.5,
    "loop": true
   }
  },
  "librarian": {
   "sit_dl": {
    "src": "/studio/office/chars/librarian/sit_dl.webp",
    "frames": 60,
    "cols": 36,
    "fw": 112,
    "fh": 186,
    "ax": 78.0,
    "ay": 146.5,
    "loop": true
   },
   "cheer_dl": {
    "src": "/studio/office/chars/librarian/cheer_dl.webp",
    "frames": 26,
    "cols": 26,
    "fw": 110,
    "fh": 222,
    "ax": 76.0,
    "ay": 180.5,
    "loop": false
   },
   "walk_dl": {
    "src": "/studio/office/chars/librarian/walk_dl.webp",
    "frames": 41,
    "cols": 33,
    "fw": 124,
    "fh": 215,
    "ax": 69.0,
    "ay": 189.5,
    "loop": true
   },
   "walk_dr": {
    "src": "/studio/office/chars/librarian/walk_dr.webp",
    "frames": 41,
    "cols": 34,
    "fw": 118,
    "fh": 213,
    "ax": 71.0,
    "ay": 190.5,
    "loop": true
   },
   "walk_ul": {
    "src": "/studio/office/chars/librarian/walk_ul.webp",
    "frames": 41,
    "cols": 35,
    "fw": 117,
    "fh": 213,
    "ax": 47.0,
    "ay": 192.5,
    "loop": true
   },
   "walk_ur": {
    "src": "/studio/office/chars/librarian/walk_ur.webp",
    "frames": 41,
    "cols": 33,
    "fw": 124,
    "fh": 210,
    "ax": 55.0,
    "ay": 193.5,
    "loop": true
   },
   "idle_dl": {
    "src": "/studio/office/chars/librarian/idle_dl.webp",
    "frames": 40,
    "cols": 36,
    "fw": 112,
    "fh": 186,
    "ax": 78.0,
    "ay": 146.5,
    "loop": true
   },
   "idle_dr": {
    "src": "/studio/office/chars/librarian/idle_dr.webp",
    "frames": 40,
    "cols": 40,
    "fw": 99,
    "fh": 166,
    "ax": 69.0,
    "ay": 162.5,
    "loop": true
   },
   "chat_dl": {
    "src": "/studio/office/chars/librarian/chat_dl.webp",
    "frames": 51,
    "cols": 39,
    "fw": 105,
    "fh": 211,
    "ax": 73.0,
    "ay": 195.5,
    "loop": true
   },
   "chat_dr": {
    "src": "/studio/office/chars/librarian/chat_dr.webp",
    "frames": 51,
    "cols": 23,
    "fw": 172,
    "fh": 217,
    "ax": 91.0,
    "ay": 198.5,
    "loop": true
   },
   "type_dl": {
    "src": "/studio/office/chars/librarian/type_dl.webp",
    "frames": 39,
    "cols": 37,
    "fw": 110,
    "fh": 197,
    "ax": 65.0,
    "ay": 164.5,
    "loop": true
   }
  },
  "designer": {
   "sit_dl": {
    "src": "/studio/office/chars/designer/sit_dl.webp",
    "frames": 60,
    "cols": 35,
    "fw": 116,
    "fh": 212,
    "ax": 79.0,
    "ay": 166.5,
    "loop": true
   },
   "cheer_dl": {
    "src": "/studio/office/chars/designer/cheer_dl.webp",
    "frames": 26,
    "cols": 26,
    "fw": 111,
    "fh": 224,
    "ax": 76.0,
    "ay": 180.5,
    "loop": false
   },
   "walk_dl": {
    "src": "/studio/office/chars/designer/walk_dl.webp",
    "frames": 41,
    "cols": 34,
    "fw": 119,
    "fh": 225,
    "ax": 62.0,
    "ay": 194.5,
    "loop": true
   },
   "walk_dr": {
    "src": "/studio/office/chars/designer/walk_dr.webp",
    "frames": 41,
    "cols": 35,
    "fw": 114,
    "fh": 211,
    "ax": 70.0,
    "ay": 187.5,
    "loop": true
   },
   "walk_ul": {
    "src": "/studio/office/chars/designer/walk_ul.webp",
    "frames": 41,
    "cols": 35,
    "fw": 114,
    "fh": 223,
    "ax": 44.0,
    "ay": 197.5,
    "loop": true
   },
   "walk_ur": {
    "src": "/studio/office/chars/designer/walk_ur.webp",
    "frames": 41,
    "cols": 34,
    "fw": 119,
    "fh": 212,
    "ax": 57.0,
    "ay": 192.5,
    "loop": true
   },
   "idle_dl": {
    "src": "/studio/office/chars/designer/idle_dl.webp",
    "frames": 40,
    "cols": 40,
    "fw": 90,
    "fh": 197,
    "ax": 56.0,
    "ay": 166.5,
    "loop": true
   },
   "idle_dr": {
    "src": "/studio/office/chars/designer/idle_dr.webp",
    "frames": 40,
    "cols": 40,
    "fw": 92,
    "fh": 161,
    "ax": 58.0,
    "ay": 157.5,
    "loop": true
   },
   "chat_dl": {
    "src": "/studio/office/chars/designer/chat_dl.webp",
    "frames": 51,
    "cols": 36,
    "fw": 113,
    "fh": 221,
    "ax": 76.0,
    "ay": 200.5,
    "loop": true
   },
   "chat_dr": {
    "src": "/studio/office/chars/designer/chat_dr.webp",
    "frames": 51,
    "cols": 25,
    "fw": 159,
    "fh": 212,
    "ax": 83.0,
    "ay": 197.5,
    "loop": true
   },
   "type_dl": {
    "src": "/studio/office/chars/designer/type_dl.webp",
    "frames": 39,
    "cols": 38,
    "fw": 106,
    "fh": 202,
    "ax": 62.0,
    "ay": 169.5,
    "loop": true
   }
  },
  "ui_engineer": {
   "sit_dl": {
    "src": "/studio/office/chars/ui_engineer/sit_dl.webp",
    "frames": 60,
    "cols": 32,
    "fw": 126,
    "fh": 190,
    "ax": 86.0,
    "ay": 152.5,
    "loop": true
   },
   "cheer_dl": {
    "src": "/studio/office/chars/ui_engineer/cheer_dl.webp",
    "frames": 26,
    "cols": 26,
    "fw": 123,
    "fh": 223,
    "ax": 85.0,
    "ay": 184.5,
    "loop": false
   },
   "walk_dl": {
    "src": "/studio/office/chars/ui_engineer/walk_dl.webp",
    "frames": 41,
    "cols": 31,
    "fw": 129,
    "fh": 219,
    "ax": 72.0,
    "ay": 193.5,
    "loop": true
   },
   "walk_dr": {
    "src": "/studio/office/chars/ui_engineer/walk_dr.webp",
    "frames": 41,
    "cols": 33,
    "fw": 123,
    "fh": 212,
    "ax": 76.0,
    "ay": 189.5,
    "loop": true
   },
   "walk_ul": {
    "src": "/studio/office/chars/ui_engineer/walk_ul.webp",
    "frames": 41,
    "cols": 33,
    "fw": 123,
    "fh": 218,
    "ax": 47.0,
    "ay": 197.5,
    "loop": true
   },
   "walk_ur": {
    "src": "/studio/office/chars/ui_engineer/walk_ur.webp",
    "frames": 41,
    "cols": 31,
    "fw": 129,
    "fh": 211,
    "ax": 57.0,
    "ay": 193.5,
    "loop": true
   },
   "idle_dl": {
    "src": "/studio/office/chars/ui_engineer/idle_dl.webp",
    "frames": 40,
    "cols": 32,
    "fw": 126,
    "fh": 190,
    "ax": 86.0,
    "ay": 152.5,
    "loop": true
   },
   "idle_dr": {
    "src": "/studio/office/chars/ui_engineer/idle_dr.webp",
    "frames": 40,
    "cols": 36,
    "fw": 111,
    "fh": 164,
    "ax": 75.0,
    "ay": 160.5,
    "loop": true
   },
   "chat_dl": {
    "src": "/studio/office/chars/ui_engineer/chat_dl.webp",
    "frames": 51,
    "cols": 33,
    "fw": 122,
    "fh": 215,
    "ax": 84.0,
    "ay": 199.5,
    "loop": true
   },
   "chat_dr": {
    "src": "/studio/office/chars/ui_engineer/chat_dr.webp",
    "frames": 51,
    "cols": 23,
    "fw": 177,
    "fh": 217,
    "ax": 94.0,
    "ay": 198.5,
    "loop": true
   },
   "type_dl": {
    "src": "/studio/office/chars/ui_engineer/type_dl.webp",
    "frames": 39,
    "cols": 33,
    "fw": 122,
    "fh": 201,
    "ax": 75.0,
    "ay": 169.5,
    "loop": true
   }
  },
  "tokens": {
   "sit_dl": {
    "src": "/studio/office/chars/tokens/sit_dl.webp",
    "frames": 60,
    "cols": 32,
    "fw": 125,
    "fh": 198,
    "ax": 87.0,
    "ay": 159.5,
    "loop": true
   },
   "cheer_dl": {
    "src": "/studio/office/chars/tokens/cheer_dl.webp",
    "frames": 26,
    "cols": 26,
    "fw": 115,
    "fh": 218,
    "ax": 78.0,
    "ay": 178.5,
    "loop": false
   },
   "walk_dl": {
    "src": "/studio/office/chars/tokens/walk_dl.webp",
    "frames": 41,
    "cols": 35,
    "fw": 117,
    "fh": 227,
    "ax": 65.0,
    "ay": 197.5,
    "loop": true
   },
   "walk_dr": {
    "src": "/studio/office/chars/tokens/walk_dr.webp",
    "frames": 41,
    "cols": 35,
    "fw": 116,
    "fh": 214,
    "ax": 70.0,
    "ay": 188.5,
    "loop": true
   },
   "walk_ul": {
    "src": "/studio/office/chars/tokens/walk_ul.webp",
    "frames": 41,
    "cols": 35,
    "fw": 116,
    "fh": 225,
    "ax": 46.0,
    "ay": 200.5,
    "loop": true
   },
   "walk_ur": {
    "src": "/studio/office/chars/tokens/walk_ur.webp",
    "frames": 41,
    "cols": 35,
    "fw": 117,
    "fh": 212,
    "ax": 52.0,
    "ay": 192.5,
    "loop": true
   },
   "idle_dl": {
    "src": "/studio/office/chars/tokens/idle_dl.webp",
    "frames": 40,
    "cols": 32,
    "fw": 125,
    "fh": 198,
    "ax": 87.0,
    "ay": 159.5,
    "loop": true
   },
   "idle_dr": {
    "src": "/studio/office/chars/tokens/idle_dr.webp",
    "frames": 40,
    "cols": 37,
    "fw": 109,
    "fh": 167,
    "ax": 75.0,
    "ay": 163.5,
    "loop": true
   },
   "chat_dl": {
    "src": "/studio/office/chars/tokens/chat_dl.webp",
    "frames": 51,
    "cols": 38,
    "fw": 107,
    "fh": 222,
    "ax": 72.0,
    "ay": 201.5,
    "loop": true
   },
   "chat_dr": {
    "src": "/studio/office/chars/tokens/chat_dr.webp",
    "frames": 51,
    "cols": 25,
    "fw": 161,
    "fh": 220,
    "ax": 84.0,
    "ay": 199.5,
    "loop": true
   },
   "type_dl": {
    "src": "/studio/office/chars/tokens/type_dl.webp",
    "frames": 39,
    "cols": 37,
    "fw": 110,
    "fh": 207,
    "ax": 64.0,
    "ay": 174.5,
    "loop": true
   }
  },
  "engineer": {
   "sit_dl": {
    "src": "/studio/office/chars/engineer/sit_dl.webp",
    "frames": 60,
    "cols": 35,
    "fw": 114,
    "fh": 205,
    "ax": 80.0,
    "ay": 167.5,
    "loop": true
   },
   "cheer_dl": {
    "src": "/studio/office/chars/engineer/cheer_dl.webp",
    "frames": 26,
    "cols": 26,
    "fw": 107,
    "fh": 213,
    "ax": 76.0,
    "ay": 178.5,
    "loop": false
   },
   "walk_dl": {
    "src": "/studio/office/chars/engineer/walk_dl.webp",
    "frames": 41,
    "cols": 36,
    "fw": 111,
    "fh": 218,
    "ax": 62.0,
    "ay": 193.5,
    "loop": true
   },
   "walk_dr": {
    "src": "/studio/office/chars/engineer/walk_dr.webp",
    "frames": 41,
    "cols": 37,
    "fw": 109,
    "fh": 209,
    "ax": 67.0,
    "ay": 188.5,
    "loop": true
   },
   "walk_ul": {
    "src": "/studio/office/chars/engineer/walk_ul.webp",
    "frames": 41,
    "cols": 37,
    "fw": 109,
    "fh": 219,
    "ax": 42.0,
    "ay": 196.5,
    "loop": true
   },
   "walk_ur": {
    "src": "/studio/office/chars/engineer/walk_ur.webp",
    "frames": 41,
    "cols": 36,
    "fw": 111,
    "fh": 208,
    "ax": 49.0,
    "ay": 191.5,
    "loop": true
   },
   "idle_dl": {
    "src": "/studio/office/chars/engineer/idle_dl.webp",
    "frames": 40,
    "cols": 40,
    "fw": 82,
    "fh": 190,
    "ax": 49.0,
    "ay": 167.5,
    "loop": true
   },
   "idle_dr": {
    "src": "/studio/office/chars/engineer/idle_dr.webp",
    "frames": 40,
    "cols": 40,
    "fw": 84,
    "fh": 164,
    "ax": 54.0,
    "ay": 160.5,
    "loop": true
   },
   "chat_dl": {
    "src": "/studio/office/chars/engineer/chat_dl.webp",
    "frames": 51,
    "cols": 41,
    "fw": 99,
    "fh": 213,
    "ax": 68.0,
    "ay": 197.5,
    "loop": true
   },
   "chat_dr": {
    "src": "/studio/office/chars/engineer/chat_dr.webp",
    "frames": 51,
    "cols": 26,
    "fw": 152,
    "fh": 214,
    "ax": 81.0,
    "ay": 197.5,
    "loop": true
   },
   "type_dl": {
    "src": "/studio/office/chars/engineer/type_dl.webp",
    "frames": 39,
    "cols": 39,
    "fw": 98,
    "fh": 196,
    "ax": 60.0,
    "ay": 170.5,
    "loop": true
   }
  },
  "qa": {
   "sit_dl": {
    "src": "/studio/office/chars/qa/sit_dl.webp",
    "frames": 60,
    "cols": 37,
    "fw": 108,
    "fh": 205,
    "ax": 73.0,
    "ay": 170.5,
    "loop": true
   },
   "cheer_dl": {
    "src": "/studio/office/chars/qa/cheer_dl.webp",
    "frames": 26,
    "cols": 26,
    "fw": 109,
    "fh": 218,
    "ax": 76.0,
    "ay": 175.5,
    "loop": false
   },
   "walk_dl": {
    "src": "/studio/office/chars/qa/walk_dl.webp",
    "frames": 41,
    "cols": 36,
    "fw": 112,
    "fh": 227,
    "ax": 67.0,
    "ay": 196.5,
    "loop": true
   },
   "walk_dr": {
    "src": "/studio/office/chars/qa/walk_dr.webp",
    "frames": 41,
    "cols": 37,
    "fw": 110,
    "fh": 209,
    "ax": 70.0,
    "ay": 185.5,
    "loop": true
   },
   "walk_ul": {
    "src": "/studio/office/chars/qa/walk_ul.webp",
    "frames": 41,
    "cols": 37,
    "fw": 110,
    "fh": 219,
    "ax": 40.0,
    "ay": 199.5,
    "loop": true
   },
   "walk_ur": {
    "src": "/studio/office/chars/qa/walk_ur.webp",
    "frames": 41,
    "cols": 36,
    "fw": 112,
    "fh": 205,
    "ax": 45.0,
    "ay": 190.5,
    "loop": true
   },
   "idle_dl": {
    "src": "/studio/office/chars/qa/idle_dl.webp",
    "frames": 40,
    "cols": 40,
    "fw": 82,
    "fh": 199,
    "ax": 50.0,
    "ay": 170.5,
    "loop": true
   },
   "idle_dr": {
    "src": "/studio/office/chars/qa/idle_dr.webp",
    "frames": 40,
    "cols": 40,
    "fw": 85,
    "fh": 161,
    "ax": 54.0,
    "ay": 157.5,
    "loop": true
   },
   "chat_dl": {
    "src": "/studio/office/chars/qa/chat_dl.webp",
    "frames": 51,
    "cols": 39,
    "fw": 105,
    "fh": 223,
    "ax": 73.0,
    "ay": 201.5,
    "loop": true
   },
   "chat_dr": {
    "src": "/studio/office/chars/qa/chat_dr.webp",
    "frames": 51,
    "cols": 26,
    "fw": 157,
    "fh": 213,
    "ax": 86.0,
    "ay": 198.5,
    "loop": true
   },
   "type_dl": {
    "src": "/studio/office/chars/qa/type_dl.webp",
    "frames": 39,
    "cols": 36,
    "fw": 112,
    "fh": 206,
    "ax": 67.0,
    "ay": 174.5,
    "loop": true
   }
  }
 }
};
