export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;
export const rand = (n: number): number => Math.floor(Math.random() * n);
export const pick = <T,>(arr: readonly T[]): T => arr[rand(arr.length)];
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
