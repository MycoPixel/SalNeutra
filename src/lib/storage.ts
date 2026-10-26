/** localStorage con tolerancia a fallos (modo privado, almacenamiento bloqueado) */
export function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento: se ignora */
  }
}

export function lsDel(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* sin almacenamiento: se ignora */
  }
}
