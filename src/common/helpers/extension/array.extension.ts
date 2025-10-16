function associateBy<T, K extends keyof any>(
  array: T[],
  keySelector: (item: T) => K
): Record<K, T> {
  return associateByTo(array, keySelector, {} as Record<K, T>);
}

function associateByTo<T, K extends keyof any>(
  array: T[],
  keySelector: (item: T) => K,
  destination: Record<K, T>
) {
  return array.reduce((acc, item) => {
    const key = keySelector(item);
    acc[key] = item;
    return acc;
  }, destination);
}

function associateWith<T, V>(
  array: T[],
  valueSelector: (item: T) => V
): Record<string, V> {
  return associateWithTo(array, valueSelector, {} as Record<string, V>);
}

function associateWithTo<T, V>(
  array: T[],
  valueSelector: (item: T) => V,
  destination: Record<string, V>
) {
  return array.reduce((acc, item) => {
    acc[item as unknown as string] = valueSelector(item);
    return acc;
  }, destination);
}

function associate<T, K extends keyof any, V>(
  array: T[],
  transform: (item: T) => [K, V]
): Record<K, V> {
  return associateTo(array, transform, {} as Record<K, V>);
}

function associateTo<T, K extends keyof any, V>(
  array: T[],
  transform: (item: T) => [K, V],
  destination: Record<K, V>
): Record<K, V> {
  return array.reduce((acc, item) => {
    const [key, value] = transform(item);
    acc[key] = value;
    return acc;
  }, destination);
}

/**
 * Returns a distinct list of objects by specified fields.
 * @param items - Array of objects to filter
 * @param fields - Fields to use for uniqueness
 * @returns Array of distinct objects
 */
function distinctByFields<T>(items: T[], fields: (keyof T)[]): T[] {
  const map = new Map<string, T>();

  items.forEach(item => {
    const key = fields.map(field => item[field]).join('|');
    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

function mapNotNull<T, R>(array: T[], transform: (item: T) => R | null | undefined): R[] {
  return array.reduce<R[]>((acc, item) => {
    const result = transform(item);
    if (result !== null && result !== undefined) {
      acc.push(result);
    }
    return acc;
  }, []);
}

function filterThenMap<T, R>(array: T[], predicate: (item: T) => boolean, transform: (item: T) => R): R[] {
  return array.reduce<R[]>((acc, item) => {
    if (predicate(item)) {
      acc.push(transform(item));
    }
    return acc;
  }, []);
}

function mapThenFilter<T, R>(array: T[], transform: (item: T) => R, predicate: (item: R) => boolean,): R[] {
  return array.reduce<R[]>((acc, item) => {
    const transformed = transform(item);
    if (predicate(transformed)) {
      acc.push(transformed);
    }
    return acc;
  }, []);
}

export {
  associate,
  associateBy,
  associateByTo,
  associateTo,
  associateWith,
  associateWithTo,
  distinctByFields,
  filterThenMap,
  mapNotNull,
  mapThenFilter,
};
