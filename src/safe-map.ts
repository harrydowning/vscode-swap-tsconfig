type Factory<T> = () => T;

export class SafeMap<K, V> extends Map<K, V> {
  #valueFactory: Factory<V>;

  constructor(valueFactory: Factory<V>, entries?: [K, V][]) {
    super(entries);
    this.#valueFactory = valueFactory;
  }

  get(key: K) {
    const value = super.get(key) || this.#valueFactory();
    this.set(key, value);
    return value;
  }
}
