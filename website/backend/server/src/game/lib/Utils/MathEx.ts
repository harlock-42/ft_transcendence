export class MathEx
{
  static lerp (v0: number, v1: number, t: number): number
  {
    return (1 - t) * v0 + t * v1;
  }

  static round (value: number, precision: number)
  {
    const y = +value + (precision === undefined ? 0.5 : precision / 2);
    return y - (y % (precision === undefined ? 1 : +precision));
  }

  static random (min: number, max: number)
  {
    return Math.random() * (max - min) + min;
  }

  static clamp = (val: number, min = 0, max = 1): number =>
    Math.max(min, Math.min(max, val));

  static map_range (value, low1, high1, low2, high2)
  {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }
}
