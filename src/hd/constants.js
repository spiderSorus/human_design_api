// Small, focused constants module.

// Gate 41 starts at 0° 0' 0" of the Human Design wheel.
// Calibrated offset in tropical degrees.
const HD_OFFSET_TROPICAL = 302.0;

// Gate Order starting from Gate 41
const GATES_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

// Channels Definition (Pairs of Gates)
const CHANNELS = [
  [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52], [10, 20], [10, 34],
  [10, 57], [11, 56], [12, 22], [13, 33], [16, 48], [17, 62], [18, 58], [19, 49], [20, 34],
  [20, 57], [21, 45], [23, 43], [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46],
  [30, 41], [32, 54], [34, 57], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64]
];

module.exports = {
  HD_OFFSET_TROPICAL,
  GATES_SEQUENCE,
  CHANNELS
};

