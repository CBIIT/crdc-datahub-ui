## Overview

This document explains provides developer documentation on how to use and maintain the `Factory<T>` class to generate test and Storybook data quickly and consistently. It covers:

* The core `Factory<T>` API
* How to define base models and factories
* Common usage patterns and code examples
* Adding new factories and best practices

---

## 1. Factory<T> API

The `Factory<T>` class wraps a generator function that produces objects of type `T`, optionally applying partial overrides. Key methods:

```ts
new Factory<T>(generateFn: (overrides?: Partial<T>) => T)
```

* **generateFn**: returns a fresh `T` instance, with any provided overrides.

### 1.1 pick(keys)

```ts
pick<K extends keyof T>(keys: readonly K[]): Factory<Pick<T, K>>
```

* Returns a new `Factory` that builds only the specified keys (plus any overrides).
* Should be followed by a `.build()` call to actually build the object.
* Useful for creating minimal or partial objects in tests.

**Example 1:**

```ts
// Build an object with only _id and email
const user = userFactory
    .pick(["_id", "email"])
    .build({ _id: "user-1", email: "test@example.com" });

console.log(user);
// { "_id": "user-1", "email": "test@example.com" }
```

___

**Example 2:**

```ts
// Build an array of partial objects
const users = userFactory.pick(["_id", "role"]).build(3, (index) => ({
    _id: `item-${index}`,
    role: "Admin",
  }));

console.log(users);
// [
//     { "_id": "item-0", "role": "Admin" },
//     { "_id": "item-1", "role": "Admin" },
//     { "_id": "item-2", "role": "Admin" }
// ]
```

### 1.2 build()

Overloaded to support:

* **`build(overrides?: Partial<T>)`:** single instance
* **`build(count: number, overrides?: Partial<T>)`:** array of instances
* **`build(count: number, sequenceFn?: (i: number) => Partial<T>)`:** array with sequence-based overrides

**Example:**

```ts
factory.build();
factory.build({ _id: "id-1" });
factory.build(5, { role: "Admin" });
factory.build(3, (index) => ({ _id: `user-${index}` }));
```

### 1.3 withTypename()

```ts
withTypename<T>(typeName: string): (T & { __typename: string }) | (T & { __typename: string })[]
```
- Attached to the `build()` call and can only be used after it
- The buildable object has a **non-enumerable** `withTypename` method.
- Calling `withTypename` returns a **new** object (or array) where `__typename` is an **enumerable** property on each item.

**Example:**
```ts
const user = userFactory.pick(["_id"]).build({ _id: "user-1" }).withTypename("User");

console.log(Object.keys(user));
// ["_id", "__typename"]

console.log(user);
// { "_id": "user-1", "__typename": "User" }
```

---

## 2. Base Models & Factories

Define a plain default object, then pass it to a `Factory` in the appropriate folder:

```ts
// src/test-utils/factories/auth/UserFactory.ts

/**
 * Base user object
 */
export const baseUser: User = {
  _id: "",
  firstName: "",
  lastName: "",
  role: "Submitter",
  /* …other default fields… */
};

/**
 * User factory for creating user instances
 */
export const userFactory = new Factory<User>((overrides) => ({
  ...baseUser,
  ...overrides,
}));

```

* **File path:** `src/test-utils/factories/<folder>/<Model>Factory.ts`
* **Exports:**

  * `base<Model>` object with default values (e.g. `baseUser`)
  * `<Model>Factory` instance (e.g. `UserFactory`)

---

## 3. Usage Examples

```ts
import { userFactory } from "@/factories/auth/userFactory";

// Single instance
const singleUser = userFactory.build();

// With overrides
const adminUser = userFactory.build({ role: "Admin" });

// Multiple instances
const tenUsers = userFactory.build(10);

// Sequenced overrides for unique IDs
const users = userFactory.build(5, (index) => ({ _id: `user-${index}` }));

// Partial objects
const partial = userFactory.pick(["_id", "email"]).build();

// Including __typename for GraphQL mocks
const typed = userFactory.build().withTypename("User");

```

