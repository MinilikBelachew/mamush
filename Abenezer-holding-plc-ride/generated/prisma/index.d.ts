/**
 * Client
 **/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Passenger
 *
 */
export type Passenger = $Result.DefaultSelection<Prisma.$PassengerPayload>;
/**
 * Model Driver
 *
 */
export type Driver = $Result.DefaultSelection<Prisma.$DriverPayload>;
/**
 * Model Assignment
 *
 */
export type Assignment = $Result.DefaultSelection<Prisma.$AssignmentPayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Passengers
 * const passengers = await prisma.passenger.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Passengers
   * const passengers = await prisma.passenger.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(
    optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>
  );
  $on<V extends U>(
    eventType: V,
    callback: (
      event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent
    ) => void
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel }
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList>
    ) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    'extends',
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.passenger`: Exposes CRUD operations for the **Passenger** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Passengers
   * const passengers = await prisma.passenger.findMany()
   * ```
   */
  get passenger(): Prisma.PassengerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.driver`: Exposes CRUD operations for the **Driver** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Drivers
   * const drivers = await prisma.driver.findMany()
   * ```
   */
  get driver(): Prisma.DriverDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.assignment`: Exposes CRUD operations for the **Assignment** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Assignments
   * const assignments = await prisma.assignment.findMany()
   * ```
   */
  get assignment(): Prisma.AssignmentDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> =
    T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<
    T extends (...args: any) => $Utils.JsPromise<any>,
  > = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<
    __Either<O, K>
  >;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = O extends unknown ? _Either<O, K, strict> : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O
    ? O[K]
    : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown
    ? AtStrict<O, K>
    : never;
  export type At<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>,
  > = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<
            UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
          >
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<
    T,
    K extends Enumerable<keyof T> | keyof T,
  > = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
    ? never
    : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    Passenger: 'Passenger';
    Driver: 'Driver';
    Assignment: 'Assignment';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb<ClientOptions = {}>
    extends $Utils.Fn<
      { extArgs: $Extensions.InternalArgs },
      $Utils.Record<string, any>
    > {
    returns: Prisma.TypeMap<
      this['params']['extArgs'],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps: 'passenger' | 'driver' | 'assignment';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Passenger: {
        payload: Prisma.$PassengerPayload<ExtArgs>;
        fields: Prisma.PassengerFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PassengerFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PassengerFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>;
          };
          findFirst: {
            args: Prisma.PassengerFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PassengerFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>;
          };
          findMany: {
            args: Prisma.PassengerFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>[];
          };
          create: {
            args: Prisma.PassengerCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>;
          };
          createMany: {
            args: Prisma.PassengerCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PassengerCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>[];
          };
          delete: {
            args: Prisma.PassengerDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>;
          };
          update: {
            args: Prisma.PassengerUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>;
          };
          deleteMany: {
            args: Prisma.PassengerDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PassengerUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.PassengerUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>[];
          };
          upsert: {
            args: Prisma.PassengerUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>;
          };
          aggregate: {
            args: Prisma.PassengerAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePassenger>;
          };
          groupBy: {
            args: Prisma.PassengerGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PassengerGroupByOutputType>[];
          };
          count: {
            args: Prisma.PassengerCountArgs<ExtArgs>;
            result: $Utils.Optional<PassengerCountAggregateOutputType> | number;
          };
        };
      };
      Driver: {
        payload: Prisma.$DriverPayload<ExtArgs>;
        fields: Prisma.DriverFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.DriverFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.DriverFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>;
          };
          findFirst: {
            args: Prisma.DriverFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.DriverFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>;
          };
          findMany: {
            args: Prisma.DriverFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[];
          };
          create: {
            args: Prisma.DriverCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>;
          };
          createMany: {
            args: Prisma.DriverCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.DriverCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[];
          };
          delete: {
            args: Prisma.DriverDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>;
          };
          update: {
            args: Prisma.DriverUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>;
          };
          deleteMany: {
            args: Prisma.DriverDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.DriverUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.DriverUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[];
          };
          upsert: {
            args: Prisma.DriverUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>;
          };
          aggregate: {
            args: Prisma.DriverAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateDriver>;
          };
          groupBy: {
            args: Prisma.DriverGroupByArgs<ExtArgs>;
            result: $Utils.Optional<DriverGroupByOutputType>[];
          };
          count: {
            args: Prisma.DriverCountArgs<ExtArgs>;
            result: $Utils.Optional<DriverCountAggregateOutputType> | number;
          };
        };
      };
      Assignment: {
        payload: Prisma.$AssignmentPayload<ExtArgs>;
        fields: Prisma.AssignmentFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.AssignmentFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.AssignmentFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>;
          };
          findFirst: {
            args: Prisma.AssignmentFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.AssignmentFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>;
          };
          findMany: {
            args: Prisma.AssignmentFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>[];
          };
          create: {
            args: Prisma.AssignmentCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>;
          };
          createMany: {
            args: Prisma.AssignmentCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.AssignmentCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>[];
          };
          delete: {
            args: Prisma.AssignmentDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>;
          };
          update: {
            args: Prisma.AssignmentUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>;
          };
          deleteMany: {
            args: Prisma.AssignmentDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.AssignmentUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.AssignmentUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>[];
          };
          upsert: {
            args: Prisma.AssignmentUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AssignmentPayload>;
          };
          aggregate: {
            args: Prisma.AssignmentAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateAssignment>;
          };
          groupBy: {
            args: Prisma.AssignmentGroupByArgs<ExtArgs>;
            result: $Utils.Optional<AssignmentGroupByOutputType>[];
          };
          count: {
            args: Prisma.AssignmentCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<AssignmentCountAggregateOutputType>
              | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {
    passenger?: PassengerOmit;
    driver?: DriverOmit;
    assignment?: AssignmentOmit;
  };

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type GetLogType<T extends LogLevel | LogDefinition> =
    T extends LogDefinition
      ? T['emit'] extends 'event'
        ? T['level']
        : never
      : never;
  export type GetEvents<T extends any> =
    T extends Array<LogLevel | LogDefinition>
      ?
          | GetLogType<T[0]>
          | GetLogType<T[1]>
          | GetLogType<T[2]>
          | GetLogType<T[3]>
      : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>
  ) => $Utils.JsPromise<T>;

  // tested in getLogLevel.test.ts
  export function getLogLevel(
    log: Array<LogLevel | LogDefinition>
  ): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<
    Prisma.DefaultPrismaClient,
    runtime.ITXClientDenyList
  >;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type PassengerCountOutputType
   */

  export type PassengerCountOutputType = {
    assignments: number;
  };

  export type PassengerCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    assignments?: boolean | PassengerCountOutputTypeCountAssignmentsArgs;
  };

  // Custom InputTypes
  /**
   * PassengerCountOutputType without action
   */
  export type PassengerCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PassengerCountOutputType
     */
    select?: PassengerCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * PassengerCountOutputType without action
   */
  export type PassengerCountOutputTypeCountAssignmentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AssignmentWhereInput;
  };

  /**
   * Count Type DriverCountOutputType
   */

  export type DriverCountOutputType = {
    assignments: number;
  };

  export type DriverCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    assignments?: boolean | DriverCountOutputTypeCountAssignmentsArgs;
  };

  // Custom InputTypes
  /**
   * DriverCountOutputType without action
   */
  export type DriverCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DriverCountOutputType
     */
    select?: DriverCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * DriverCountOutputType without action
   */
  export type DriverCountOutputTypeCountAssignmentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AssignmentWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model Passenger
   */

  export type AggregatePassenger = {
    _count: PassengerCountAggregateOutputType | null;
    _avg: PassengerAvgAggregateOutputType | null;
    _sum: PassengerSumAggregateOutputType | null;
    _min: PassengerMinAggregateOutputType | null;
    _max: PassengerMaxAggregateOutputType | null;
  };

  export type PassengerAvgAggregateOutputType = {
    estimatedDurationMin: number | null;
  };

  export type PassengerSumAggregateOutputType = {
    estimatedDurationMin: number | null;
  };

  export type PassengerMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    isDirect: boolean | null;
    estimatedDurationMin: number | null;
    earliestPickupTime: Date | null;
    latestPickupTime: Date | null;
    earliestDropoffTime: Date | null;
    latestDropoffTime: Date | null;
    pickupStreetNumber: string | null;
    pickupStreet: string | null;
    pickupCity: string | null;
    pickupZip: string | null;
    dropoffStreetNumber: string | null;
    dropoffStreet: string | null;
    dropoffCity: string | null;
    dropoffZip: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PassengerMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    isDirect: boolean | null;
    estimatedDurationMin: number | null;
    earliestPickupTime: Date | null;
    latestPickupTime: Date | null;
    earliestDropoffTime: Date | null;
    latestDropoffTime: Date | null;
    pickupStreetNumber: string | null;
    pickupStreet: string | null;
    pickupCity: string | null;
    pickupZip: string | null;
    dropoffStreetNumber: string | null;
    dropoffStreet: string | null;
    dropoffCity: string | null;
    dropoffZip: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PassengerCountAggregateOutputType = {
    id: number;
    name: number;
    isDirect: number;
    estimatedDurationMin: number;
    earliestPickupTime: number;
    latestPickupTime: number;
    earliestDropoffTime: number;
    latestDropoffTime: number;
    pickupStreetNumber: number;
    pickupStreet: number;
    pickupCity: number;
    pickupZip: number;
    dropoffStreetNumber: number;
    dropoffStreet: number;
    dropoffCity: number;
    dropoffZip: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type PassengerAvgAggregateInputType = {
    estimatedDurationMin?: true;
  };

  export type PassengerSumAggregateInputType = {
    estimatedDurationMin?: true;
  };

  export type PassengerMinAggregateInputType = {
    id?: true;
    name?: true;
    isDirect?: true;
    estimatedDurationMin?: true;
    earliestPickupTime?: true;
    latestPickupTime?: true;
    earliestDropoffTime?: true;
    latestDropoffTime?: true;
    pickupStreetNumber?: true;
    pickupStreet?: true;
    pickupCity?: true;
    pickupZip?: true;
    dropoffStreetNumber?: true;
    dropoffStreet?: true;
    dropoffCity?: true;
    dropoffZip?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PassengerMaxAggregateInputType = {
    id?: true;
    name?: true;
    isDirect?: true;
    estimatedDurationMin?: true;
    earliestPickupTime?: true;
    latestPickupTime?: true;
    earliestDropoffTime?: true;
    latestDropoffTime?: true;
    pickupStreetNumber?: true;
    pickupStreet?: true;
    pickupCity?: true;
    pickupZip?: true;
    dropoffStreetNumber?: true;
    dropoffStreet?: true;
    dropoffCity?: true;
    dropoffZip?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PassengerCountAggregateInputType = {
    id?: true;
    name?: true;
    isDirect?: true;
    estimatedDurationMin?: true;
    earliestPickupTime?: true;
    latestPickupTime?: true;
    earliestDropoffTime?: true;
    latestDropoffTime?: true;
    pickupStreetNumber?: true;
    pickupStreet?: true;
    pickupCity?: true;
    pickupZip?: true;
    dropoffStreetNumber?: true;
    dropoffStreet?: true;
    dropoffCity?: true;
    dropoffZip?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type PassengerAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Passenger to aggregate.
     */
    where?: PassengerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Passengers to fetch.
     */
    orderBy?:
      | PassengerOrderByWithRelationInput
      | PassengerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PassengerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Passengers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Passengers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Passengers
     **/
    _count?: true | PassengerCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: PassengerAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: PassengerSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PassengerMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PassengerMaxAggregateInputType;
  };

  export type GetPassengerAggregateType<T extends PassengerAggregateArgs> = {
    [P in keyof T & keyof AggregatePassenger]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePassenger[P]>
      : GetScalarType<T[P], AggregatePassenger[P]>;
  };

  export type PassengerGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PassengerWhereInput;
    orderBy?:
      | PassengerOrderByWithAggregationInput
      | PassengerOrderByWithAggregationInput[];
    by: PassengerScalarFieldEnum[] | PassengerScalarFieldEnum;
    having?: PassengerScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PassengerCountAggregateInputType | true;
    _avg?: PassengerAvgAggregateInputType;
    _sum?: PassengerSumAggregateInputType;
    _min?: PassengerMinAggregateInputType;
    _max?: PassengerMaxAggregateInputType;
  };

  export type PassengerGroupByOutputType = {
    id: string;
    name: string;
    isDirect: boolean;
    estimatedDurationMin: number | null;
    earliestPickupTime: Date | null;
    latestPickupTime: Date | null;
    earliestDropoffTime: Date | null;
    latestDropoffTime: Date | null;
    pickupStreetNumber: string | null;
    pickupStreet: string | null;
    pickupCity: string | null;
    pickupZip: string | null;
    dropoffStreetNumber: string | null;
    dropoffStreet: string | null;
    dropoffCity: string | null;
    dropoffZip: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: PassengerCountAggregateOutputType | null;
    _avg: PassengerAvgAggregateOutputType | null;
    _sum: PassengerSumAggregateOutputType | null;
    _min: PassengerMinAggregateOutputType | null;
    _max: PassengerMaxAggregateOutputType | null;
  };

  type GetPassengerGroupByPayload<T extends PassengerGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<PassengerGroupByOutputType, T['by']> & {
          [P in keyof T & keyof PassengerGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PassengerGroupByOutputType[P]>
            : GetScalarType<T[P], PassengerGroupByOutputType[P]>;
        }
      >
    >;

  export type PassengerSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      isDirect?: boolean;
      estimatedDurationMin?: boolean;
      earliestPickupTime?: boolean;
      latestPickupTime?: boolean;
      earliestDropoffTime?: boolean;
      latestDropoffTime?: boolean;
      pickupStreetNumber?: boolean;
      pickupStreet?: boolean;
      pickupCity?: boolean;
      pickupZip?: boolean;
      dropoffStreetNumber?: boolean;
      dropoffStreet?: boolean;
      dropoffCity?: boolean;
      dropoffZip?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      assignments?: boolean | Passenger$assignmentsArgs<ExtArgs>;
      _count?: boolean | PassengerCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['passenger']
  >;

  export type PassengerSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      isDirect?: boolean;
      estimatedDurationMin?: boolean;
      earliestPickupTime?: boolean;
      latestPickupTime?: boolean;
      earliestDropoffTime?: boolean;
      latestDropoffTime?: boolean;
      pickupStreetNumber?: boolean;
      pickupStreet?: boolean;
      pickupCity?: boolean;
      pickupZip?: boolean;
      dropoffStreetNumber?: boolean;
      dropoffStreet?: boolean;
      dropoffCity?: boolean;
      dropoffZip?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['passenger']
  >;

  export type PassengerSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      isDirect?: boolean;
      estimatedDurationMin?: boolean;
      earliestPickupTime?: boolean;
      latestPickupTime?: boolean;
      earliestDropoffTime?: boolean;
      latestDropoffTime?: boolean;
      pickupStreetNumber?: boolean;
      pickupStreet?: boolean;
      pickupCity?: boolean;
      pickupZip?: boolean;
      dropoffStreetNumber?: boolean;
      dropoffStreet?: boolean;
      dropoffCity?: boolean;
      dropoffZip?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['passenger']
  >;

  export type PassengerSelectScalar = {
    id?: boolean;
    name?: boolean;
    isDirect?: boolean;
    estimatedDurationMin?: boolean;
    earliestPickupTime?: boolean;
    latestPickupTime?: boolean;
    earliestDropoffTime?: boolean;
    latestDropoffTime?: boolean;
    pickupStreetNumber?: boolean;
    pickupStreet?: boolean;
    pickupCity?: boolean;
    pickupZip?: boolean;
    dropoffStreetNumber?: boolean;
    dropoffStreet?: boolean;
    dropoffCity?: boolean;
    dropoffZip?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type PassengerOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'name'
    | 'isDirect'
    | 'estimatedDurationMin'
    | 'earliestPickupTime'
    | 'latestPickupTime'
    | 'earliestDropoffTime'
    | 'latestDropoffTime'
    | 'pickupStreetNumber'
    | 'pickupStreet'
    | 'pickupCity'
    | 'pickupZip'
    | 'dropoffStreetNumber'
    | 'dropoffStreet'
    | 'dropoffCity'
    | 'dropoffZip'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['passenger']
  >;
  export type PassengerInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    assignments?: boolean | Passenger$assignmentsArgs<ExtArgs>;
    _count?: boolean | PassengerCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type PassengerIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type PassengerIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $PassengerPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Passenger';
    objects: {
      assignments: Prisma.$AssignmentPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        isDirect: boolean;
        estimatedDurationMin: number | null;
        earliestPickupTime: Date | null;
        latestPickupTime: Date | null;
        earliestDropoffTime: Date | null;
        latestDropoffTime: Date | null;
        pickupStreetNumber: string | null;
        pickupStreet: string | null;
        pickupCity: string | null;
        pickupZip: string | null;
        dropoffStreetNumber: string | null;
        dropoffStreet: string | null;
        dropoffCity: string | null;
        dropoffZip: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['passenger']
    >;
    composites: {};
  };

  type PassengerGetPayload<
    S extends boolean | null | undefined | PassengerDefaultArgs,
  > = $Result.GetResult<Prisma.$PassengerPayload, S>;

  type PassengerCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    PassengerFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: PassengerCountAggregateInputType | true;
  };

  export interface PassengerDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Passenger'];
      meta: { name: 'Passenger' };
    };
    /**
     * Find zero or one Passenger that matches the filter.
     * @param {PassengerFindUniqueArgs} args - Arguments to find a Passenger
     * @example
     * // Get one Passenger
     * const passenger = await prisma.passenger.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PassengerFindUniqueArgs>(
      args: SelectSubset<T, PassengerFindUniqueArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Passenger that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PassengerFindUniqueOrThrowArgs} args - Arguments to find a Passenger
     * @example
     * // Get one Passenger
     * const passenger = await prisma.passenger.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PassengerFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PassengerFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Passenger that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerFindFirstArgs} args - Arguments to find a Passenger
     * @example
     * // Get one Passenger
     * const passenger = await prisma.passenger.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PassengerFindFirstArgs>(
      args?: SelectSubset<T, PassengerFindFirstArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Passenger that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerFindFirstOrThrowArgs} args - Arguments to find a Passenger
     * @example
     * // Get one Passenger
     * const passenger = await prisma.passenger.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PassengerFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PassengerFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Passengers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Passengers
     * const passengers = await prisma.passenger.findMany()
     *
     * // Get first 10 Passengers
     * const passengers = await prisma.passenger.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const passengerWithIdOnly = await prisma.passenger.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PassengerFindManyArgs>(
      args?: SelectSubset<T, PassengerFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Passenger.
     * @param {PassengerCreateArgs} args - Arguments to create a Passenger.
     * @example
     * // Create one Passenger
     * const Passenger = await prisma.passenger.create({
     *   data: {
     *     // ... data to create a Passenger
     *   }
     * })
     *
     */
    create<T extends PassengerCreateArgs>(
      args: SelectSubset<T, PassengerCreateArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Passengers.
     * @param {PassengerCreateManyArgs} args - Arguments to create many Passengers.
     * @example
     * // Create many Passengers
     * const passenger = await prisma.passenger.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PassengerCreateManyArgs>(
      args?: SelectSubset<T, PassengerCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Passengers and returns the data saved in the database.
     * @param {PassengerCreateManyAndReturnArgs} args - Arguments to create many Passengers.
     * @example
     * // Create many Passengers
     * const passenger = await prisma.passenger.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Passengers and only return the `id`
     * const passengerWithIdOnly = await prisma.passenger.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PassengerCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PassengerCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Passenger.
     * @param {PassengerDeleteArgs} args - Arguments to delete one Passenger.
     * @example
     * // Delete one Passenger
     * const Passenger = await prisma.passenger.delete({
     *   where: {
     *     // ... filter to delete one Passenger
     *   }
     * })
     *
     */
    delete<T extends PassengerDeleteArgs>(
      args: SelectSubset<T, PassengerDeleteArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Passenger.
     * @param {PassengerUpdateArgs} args - Arguments to update one Passenger.
     * @example
     * // Update one Passenger
     * const passenger = await prisma.passenger.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PassengerUpdateArgs>(
      args: SelectSubset<T, PassengerUpdateArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Passengers.
     * @param {PassengerDeleteManyArgs} args - Arguments to filter Passengers to delete.
     * @example
     * // Delete a few Passengers
     * const { count } = await prisma.passenger.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PassengerDeleteManyArgs>(
      args?: SelectSubset<T, PassengerDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Passengers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Passengers
     * const passenger = await prisma.passenger.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PassengerUpdateManyArgs>(
      args: SelectSubset<T, PassengerUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Passengers and returns the data updated in the database.
     * @param {PassengerUpdateManyAndReturnArgs} args - Arguments to update many Passengers.
     * @example
     * // Update many Passengers
     * const passenger = await prisma.passenger.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Passengers and only return the `id`
     * const passengerWithIdOnly = await prisma.passenger.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends PassengerUpdateManyAndReturnArgs>(
      args: SelectSubset<T, PassengerUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Passenger.
     * @param {PassengerUpsertArgs} args - Arguments to update or create a Passenger.
     * @example
     * // Update or create a Passenger
     * const passenger = await prisma.passenger.upsert({
     *   create: {
     *     // ... data to create a Passenger
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Passenger we want to update
     *   }
     * })
     */
    upsert<T extends PassengerUpsertArgs>(
      args: SelectSubset<T, PassengerUpsertArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      $Result.GetResult<
        Prisma.$PassengerPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Passengers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerCountArgs} args - Arguments to filter Passengers to count.
     * @example
     * // Count the number of Passengers
     * const count = await prisma.passenger.count({
     *   where: {
     *     // ... the filter for the Passengers we want to count
     *   }
     * })
     **/
    count<T extends PassengerCountArgs>(
      args?: Subset<T, PassengerCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PassengerCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Passenger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PassengerAggregateArgs>(
      args: Subset<T, PassengerAggregateArgs>
    ): Prisma.PrismaPromise<GetPassengerAggregateType<T>>;

    /**
     * Group by Passenger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PassengerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PassengerGroupByArgs['orderBy'] }
        : { orderBy?: PassengerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PassengerGroupByArgs, OrderByArg> &
        InputErrors
    ): {} extends InputErrors
      ? GetPassengerGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Passenger model
     */
    readonly fields: PassengerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Passenger.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PassengerClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    assignments<T extends Passenger$assignmentsArgs<ExtArgs> = {}>(
      args?: Subset<T, Passenger$assignmentsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$AssignmentPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Passenger model
   */
  interface PassengerFieldRefs {
    readonly id: FieldRef<'Passenger', 'String'>;
    readonly name: FieldRef<'Passenger', 'String'>;
    readonly isDirect: FieldRef<'Passenger', 'Boolean'>;
    readonly estimatedDurationMin: FieldRef<'Passenger', 'Int'>;
    readonly earliestPickupTime: FieldRef<'Passenger', 'DateTime'>;
    readonly latestPickupTime: FieldRef<'Passenger', 'DateTime'>;
    readonly earliestDropoffTime: FieldRef<'Passenger', 'DateTime'>;
    readonly latestDropoffTime: FieldRef<'Passenger', 'DateTime'>;
    readonly pickupStreetNumber: FieldRef<'Passenger', 'String'>;
    readonly pickupStreet: FieldRef<'Passenger', 'String'>;
    readonly pickupCity: FieldRef<'Passenger', 'String'>;
    readonly pickupZip: FieldRef<'Passenger', 'String'>;
    readonly dropoffStreetNumber: FieldRef<'Passenger', 'String'>;
    readonly dropoffStreet: FieldRef<'Passenger', 'String'>;
    readonly dropoffCity: FieldRef<'Passenger', 'String'>;
    readonly dropoffZip: FieldRef<'Passenger', 'String'>;
    readonly createdAt: FieldRef<'Passenger', 'DateTime'>;
    readonly updatedAt: FieldRef<'Passenger', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Passenger findUnique
   */
  export type PassengerFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * Filter, which Passenger to fetch.
     */
    where: PassengerWhereUniqueInput;
  };

  /**
   * Passenger findUniqueOrThrow
   */
  export type PassengerFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * Filter, which Passenger to fetch.
     */
    where: PassengerWhereUniqueInput;
  };

  /**
   * Passenger findFirst
   */
  export type PassengerFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * Filter, which Passenger to fetch.
     */
    where?: PassengerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Passengers to fetch.
     */
    orderBy?:
      | PassengerOrderByWithRelationInput
      | PassengerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Passengers.
     */
    cursor?: PassengerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Passengers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Passengers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Passengers.
     */
    distinct?: PassengerScalarFieldEnum | PassengerScalarFieldEnum[];
  };

  /**
   * Passenger findFirstOrThrow
   */
  export type PassengerFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * Filter, which Passenger to fetch.
     */
    where?: PassengerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Passengers to fetch.
     */
    orderBy?:
      | PassengerOrderByWithRelationInput
      | PassengerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Passengers.
     */
    cursor?: PassengerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Passengers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Passengers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Passengers.
     */
    distinct?: PassengerScalarFieldEnum | PassengerScalarFieldEnum[];
  };

  /**
   * Passenger findMany
   */
  export type PassengerFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * Filter, which Passengers to fetch.
     */
    where?: PassengerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Passengers to fetch.
     */
    orderBy?:
      | PassengerOrderByWithRelationInput
      | PassengerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Passengers.
     */
    cursor?: PassengerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Passengers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Passengers.
     */
    skip?: number;
    distinct?: PassengerScalarFieldEnum | PassengerScalarFieldEnum[];
  };

  /**
   * Passenger create
   */
  export type PassengerCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * The data needed to create a Passenger.
     */
    data: XOR<PassengerCreateInput, PassengerUncheckedCreateInput>;
  };

  /**
   * Passenger createMany
   */
  export type PassengerCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Passengers.
     */
    data: PassengerCreateManyInput | PassengerCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Passenger createManyAndReturn
   */
  export type PassengerCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * The data used to create many Passengers.
     */
    data: PassengerCreateManyInput | PassengerCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Passenger update
   */
  export type PassengerUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * The data needed to update a Passenger.
     */
    data: XOR<PassengerUpdateInput, PassengerUncheckedUpdateInput>;
    /**
     * Choose, which Passenger to update.
     */
    where: PassengerWhereUniqueInput;
  };

  /**
   * Passenger updateMany
   */
  export type PassengerUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Passengers.
     */
    data: XOR<
      PassengerUpdateManyMutationInput,
      PassengerUncheckedUpdateManyInput
    >;
    /**
     * Filter which Passengers to update
     */
    where?: PassengerWhereInput;
    /**
     * Limit how many Passengers to update.
     */
    limit?: number;
  };

  /**
   * Passenger updateManyAndReturn
   */
  export type PassengerUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * The data used to update Passengers.
     */
    data: XOR<
      PassengerUpdateManyMutationInput,
      PassengerUncheckedUpdateManyInput
    >;
    /**
     * Filter which Passengers to update
     */
    where?: PassengerWhereInput;
    /**
     * Limit how many Passengers to update.
     */
    limit?: number;
  };

  /**
   * Passenger upsert
   */
  export type PassengerUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * The filter to search for the Passenger to update in case it exists.
     */
    where: PassengerWhereUniqueInput;
    /**
     * In case the Passenger found by the `where` argument doesn't exist, create a new Passenger with this data.
     */
    create: XOR<PassengerCreateInput, PassengerUncheckedCreateInput>;
    /**
     * In case the Passenger was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PassengerUpdateInput, PassengerUncheckedUpdateInput>;
  };

  /**
   * Passenger delete
   */
  export type PassengerDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
    /**
     * Filter which Passenger to delete.
     */
    where: PassengerWhereUniqueInput;
  };

  /**
   * Passenger deleteMany
   */
  export type PassengerDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Passengers to delete
     */
    where?: PassengerWhereInput;
    /**
     * Limit how many Passengers to delete.
     */
    limit?: number;
  };

  /**
   * Passenger.assignments
   */
  export type Passenger$assignmentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    where?: AssignmentWhereInput;
    orderBy?:
      | AssignmentOrderByWithRelationInput
      | AssignmentOrderByWithRelationInput[];
    cursor?: AssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: AssignmentScalarFieldEnum | AssignmentScalarFieldEnum[];
  };

  /**
   * Passenger without action
   */
  export type PassengerDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null;
  };

  /**
   * Model Driver
   */

  export type AggregateDriver = {
    _count: DriverCountAggregateOutputType | null;
    _avg: DriverAvgAggregateOutputType | null;
    _sum: DriverSumAggregateOutputType | null;
    _min: DriverMinAggregateOutputType | null;
    _max: DriverMaxAggregateOutputType | null;
  };

  export type DriverAvgAggregateOutputType = {
    homeBaseLat: number | null;
    homeBaseLng: number | null;
    lastKnownLat: number | null;
    lastKnownLng: number | null;
  };

  export type DriverSumAggregateOutputType = {
    homeBaseLat: number | null;
    homeBaseLng: number | null;
    lastKnownLat: number | null;
    lastKnownLng: number | null;
  };

  export type DriverMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    phone: string | null;
    licenseNumber: string | null;
    vehicleType: string | null;
    plateNumber: string | null;
    isAvailable: boolean | null;
    homeBaseLat: number | null;
    homeBaseLng: number | null;
    lastKnownLat: number | null;
    lastKnownLng: number | null;
    lastUpdated: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DriverMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    phone: string | null;
    licenseNumber: string | null;
    vehicleType: string | null;
    plateNumber: string | null;
    isAvailable: boolean | null;
    homeBaseLat: number | null;
    homeBaseLng: number | null;
    lastKnownLat: number | null;
    lastKnownLng: number | null;
    lastUpdated: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DriverCountAggregateOutputType = {
    id: number;
    name: number;
    phone: number;
    licenseNumber: number;
    vehicleType: number;
    plateNumber: number;
    isAvailable: number;
    homeBaseLat: number;
    homeBaseLng: number;
    lastKnownLat: number;
    lastKnownLng: number;
    lastUpdated: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type DriverAvgAggregateInputType = {
    homeBaseLat?: true;
    homeBaseLng?: true;
    lastKnownLat?: true;
    lastKnownLng?: true;
  };

  export type DriverSumAggregateInputType = {
    homeBaseLat?: true;
    homeBaseLng?: true;
    lastKnownLat?: true;
    lastKnownLng?: true;
  };

  export type DriverMinAggregateInputType = {
    id?: true;
    name?: true;
    phone?: true;
    licenseNumber?: true;
    vehicleType?: true;
    plateNumber?: true;
    isAvailable?: true;
    homeBaseLat?: true;
    homeBaseLng?: true;
    lastKnownLat?: true;
    lastKnownLng?: true;
    lastUpdated?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DriverMaxAggregateInputType = {
    id?: true;
    name?: true;
    phone?: true;
    licenseNumber?: true;
    vehicleType?: true;
    plateNumber?: true;
    isAvailable?: true;
    homeBaseLat?: true;
    homeBaseLng?: true;
    lastKnownLat?: true;
    lastKnownLng?: true;
    lastUpdated?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DriverCountAggregateInputType = {
    id?: true;
    name?: true;
    phone?: true;
    licenseNumber?: true;
    vehicleType?: true;
    plateNumber?: true;
    isAvailable?: true;
    homeBaseLat?: true;
    homeBaseLng?: true;
    lastKnownLat?: true;
    lastKnownLng?: true;
    lastUpdated?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type DriverAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Driver to aggregate.
     */
    where?: DriverWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: DriverWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Drivers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Drivers
     **/
    _count?: true | DriverCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: DriverAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: DriverSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: DriverMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: DriverMaxAggregateInputType;
  };

  export type GetDriverAggregateType<T extends DriverAggregateArgs> = {
    [P in keyof T & keyof AggregateDriver]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDriver[P]>
      : GetScalarType<T[P], AggregateDriver[P]>;
  };

  export type DriverGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DriverWhereInput;
    orderBy?:
      | DriverOrderByWithAggregationInput
      | DriverOrderByWithAggregationInput[];
    by: DriverScalarFieldEnum[] | DriverScalarFieldEnum;
    having?: DriverScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DriverCountAggregateInputType | true;
    _avg?: DriverAvgAggregateInputType;
    _sum?: DriverSumAggregateInputType;
    _min?: DriverMinAggregateInputType;
    _max?: DriverMaxAggregateInputType;
  };

  export type DriverGroupByOutputType = {
    id: string;
    name: string;
    phone: string;
    licenseNumber: string | null;
    vehicleType: string | null;
    plateNumber: string | null;
    isAvailable: boolean;
    homeBaseLat: number | null;
    homeBaseLng: number | null;
    lastKnownLat: number | null;
    lastKnownLng: number | null;
    lastUpdated: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: DriverCountAggregateOutputType | null;
    _avg: DriverAvgAggregateOutputType | null;
    _sum: DriverSumAggregateOutputType | null;
    _min: DriverMinAggregateOutputType | null;
    _max: DriverMaxAggregateOutputType | null;
  };

  type GetDriverGroupByPayload<T extends DriverGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<DriverGroupByOutputType, T['by']> & {
          [P in keyof T & keyof DriverGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DriverGroupByOutputType[P]>
            : GetScalarType<T[P], DriverGroupByOutputType[P]>;
        }
      >
    >;

  export type DriverSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      phone?: boolean;
      licenseNumber?: boolean;
      vehicleType?: boolean;
      plateNumber?: boolean;
      isAvailable?: boolean;
      homeBaseLat?: boolean;
      homeBaseLng?: boolean;
      lastKnownLat?: boolean;
      lastKnownLng?: boolean;
      lastUpdated?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      assignments?: boolean | Driver$assignmentsArgs<ExtArgs>;
      _count?: boolean | DriverCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['driver']
  >;

  export type DriverSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      phone?: boolean;
      licenseNumber?: boolean;
      vehicleType?: boolean;
      plateNumber?: boolean;
      isAvailable?: boolean;
      homeBaseLat?: boolean;
      homeBaseLng?: boolean;
      lastKnownLat?: boolean;
      lastKnownLng?: boolean;
      lastUpdated?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['driver']
  >;

  export type DriverSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      phone?: boolean;
      licenseNumber?: boolean;
      vehicleType?: boolean;
      plateNumber?: boolean;
      isAvailable?: boolean;
      homeBaseLat?: boolean;
      homeBaseLng?: boolean;
      lastKnownLat?: boolean;
      lastKnownLng?: boolean;
      lastUpdated?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['driver']
  >;

  export type DriverSelectScalar = {
    id?: boolean;
    name?: boolean;
    phone?: boolean;
    licenseNumber?: boolean;
    vehicleType?: boolean;
    plateNumber?: boolean;
    isAvailable?: boolean;
    homeBaseLat?: boolean;
    homeBaseLng?: boolean;
    lastKnownLat?: boolean;
    lastKnownLng?: boolean;
    lastUpdated?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type DriverOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'name'
    | 'phone'
    | 'licenseNumber'
    | 'vehicleType'
    | 'plateNumber'
    | 'isAvailable'
    | 'homeBaseLat'
    | 'homeBaseLng'
    | 'lastKnownLat'
    | 'lastKnownLng'
    | 'lastUpdated'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['driver']
  >;
  export type DriverInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    assignments?: boolean | Driver$assignmentsArgs<ExtArgs>;
    _count?: boolean | DriverCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type DriverIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type DriverIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $DriverPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Driver';
    objects: {
      assignments: Prisma.$AssignmentPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        phone: string;
        licenseNumber: string | null;
        vehicleType: string | null;
        plateNumber: string | null;
        isAvailable: boolean;
        homeBaseLat: number | null;
        homeBaseLng: number | null;
        lastKnownLat: number | null;
        lastKnownLng: number | null;
        lastUpdated: Date | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['driver']
    >;
    composites: {};
  };

  type DriverGetPayload<
    S extends boolean | null | undefined | DriverDefaultArgs,
  > = $Result.GetResult<Prisma.$DriverPayload, S>;

  type DriverCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<DriverFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DriverCountAggregateInputType | true;
  };

  export interface DriverDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Driver'];
      meta: { name: 'Driver' };
    };
    /**
     * Find zero or one Driver that matches the filter.
     * @param {DriverFindUniqueArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DriverFindUniqueArgs>(
      args: SelectSubset<T, DriverFindUniqueArgs<ExtArgs>>
    ): Prisma__DriverClient<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Driver that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DriverFindUniqueOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DriverFindUniqueOrThrowArgs>(
      args: SelectSubset<T, DriverFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__DriverClient<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Driver that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DriverFindFirstArgs>(
      args?: SelectSubset<T, DriverFindFirstArgs<ExtArgs>>
    ): Prisma__DriverClient<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Driver that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DriverFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DriverFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__DriverClient<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Drivers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Drivers
     * const drivers = await prisma.driver.findMany()
     *
     * // Get first 10 Drivers
     * const drivers = await prisma.driver.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const driverWithIdOnly = await prisma.driver.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DriverFindManyArgs>(
      args?: SelectSubset<T, DriverFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Driver.
     * @param {DriverCreateArgs} args - Arguments to create a Driver.
     * @example
     * // Create one Driver
     * const Driver = await prisma.driver.create({
     *   data: {
     *     // ... data to create a Driver
     *   }
     * })
     *
     */
    create<T extends DriverCreateArgs>(
      args: SelectSubset<T, DriverCreateArgs<ExtArgs>>
    ): Prisma__DriverClient<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Drivers.
     * @param {DriverCreateManyArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DriverCreateManyArgs>(
      args?: SelectSubset<T, DriverCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Drivers and returns the data saved in the database.
     * @param {DriverCreateManyAndReturnArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Drivers and only return the `id`
     * const driverWithIdOnly = await prisma.driver.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DriverCreateManyAndReturnArgs>(
      args?: SelectSubset<T, DriverCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Driver.
     * @param {DriverDeleteArgs} args - Arguments to delete one Driver.
     * @example
     * // Delete one Driver
     * const Driver = await prisma.driver.delete({
     *   where: {
     *     // ... filter to delete one Driver
     *   }
     * })
     *
     */
    delete<T extends DriverDeleteArgs>(
      args: SelectSubset<T, DriverDeleteArgs<ExtArgs>>
    ): Prisma__DriverClient<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Driver.
     * @param {DriverUpdateArgs} args - Arguments to update one Driver.
     * @example
     * // Update one Driver
     * const driver = await prisma.driver.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DriverUpdateArgs>(
      args: SelectSubset<T, DriverUpdateArgs<ExtArgs>>
    ): Prisma__DriverClient<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Drivers.
     * @param {DriverDeleteManyArgs} args - Arguments to filter Drivers to delete.
     * @example
     * // Delete a few Drivers
     * const { count } = await prisma.driver.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DriverDeleteManyArgs>(
      args?: SelectSubset<T, DriverDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Drivers
     * const driver = await prisma.driver.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DriverUpdateManyArgs>(
      args: SelectSubset<T, DriverUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Drivers and returns the data updated in the database.
     * @param {DriverUpdateManyAndReturnArgs} args - Arguments to update many Drivers.
     * @example
     * // Update many Drivers
     * const driver = await prisma.driver.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Drivers and only return the `id`
     * const driverWithIdOnly = await prisma.driver.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends DriverUpdateManyAndReturnArgs>(
      args: SelectSubset<T, DriverUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Driver.
     * @param {DriverUpsertArgs} args - Arguments to update or create a Driver.
     * @example
     * // Update or create a Driver
     * const driver = await prisma.driver.upsert({
     *   create: {
     *     // ... data to create a Driver
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Driver we want to update
     *   }
     * })
     */
    upsert<T extends DriverUpsertArgs>(
      args: SelectSubset<T, DriverUpsertArgs<ExtArgs>>
    ): Prisma__DriverClient<
      $Result.GetResult<
        Prisma.$DriverPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverCountArgs} args - Arguments to filter Drivers to count.
     * @example
     * // Count the number of Drivers
     * const count = await prisma.driver.count({
     *   where: {
     *     // ... the filter for the Drivers we want to count
     *   }
     * })
     **/
    count<T extends DriverCountArgs>(
      args?: Subset<T, DriverCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DriverCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends DriverAggregateArgs>(
      args: Subset<T, DriverAggregateArgs>
    ): Prisma.PrismaPromise<GetDriverAggregateType<T>>;

    /**
     * Group by Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends DriverGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DriverGroupByArgs['orderBy'] }
        : { orderBy?: DriverGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, DriverGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors
      ? GetDriverGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Driver model
     */
    readonly fields: DriverFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Driver.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DriverClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    assignments<T extends Driver$assignmentsArgs<ExtArgs> = {}>(
      args?: Subset<T, Driver$assignmentsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$AssignmentPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Driver model
   */
  interface DriverFieldRefs {
    readonly id: FieldRef<'Driver', 'String'>;
    readonly name: FieldRef<'Driver', 'String'>;
    readonly phone: FieldRef<'Driver', 'String'>;
    readonly licenseNumber: FieldRef<'Driver', 'String'>;
    readonly vehicleType: FieldRef<'Driver', 'String'>;
    readonly plateNumber: FieldRef<'Driver', 'String'>;
    readonly isAvailable: FieldRef<'Driver', 'Boolean'>;
    readonly homeBaseLat: FieldRef<'Driver', 'Float'>;
    readonly homeBaseLng: FieldRef<'Driver', 'Float'>;
    readonly lastKnownLat: FieldRef<'Driver', 'Float'>;
    readonly lastKnownLng: FieldRef<'Driver', 'Float'>;
    readonly lastUpdated: FieldRef<'Driver', 'DateTime'>;
    readonly createdAt: FieldRef<'Driver', 'DateTime'>;
    readonly updatedAt: FieldRef<'Driver', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Driver findUnique
   */
  export type DriverFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput;
  };

  /**
   * Driver findUniqueOrThrow
   */
  export type DriverFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput;
  };

  /**
   * Driver findFirst
   */
  export type DriverFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Drivers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[];
  };

  /**
   * Driver findFirstOrThrow
   */
  export type DriverFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Drivers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[];
  };

  /**
   * Driver findMany
   */
  export type DriverFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * Filter, which Drivers to fetch.
     */
    where?: DriverWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Drivers.
     */
    cursor?: DriverWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Drivers.
     */
    skip?: number;
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[];
  };

  /**
   * Driver create
   */
  export type DriverCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * The data needed to create a Driver.
     */
    data: XOR<DriverCreateInput, DriverUncheckedCreateInput>;
  };

  /**
   * Driver createMany
   */
  export type DriverCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Driver createManyAndReturn
   */
  export type DriverCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Driver update
   */
  export type DriverUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * The data needed to update a Driver.
     */
    data: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>;
    /**
     * Choose, which Driver to update.
     */
    where: DriverWhereUniqueInput;
  };

  /**
   * Driver updateMany
   */
  export type DriverUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Drivers.
     */
    data: XOR<DriverUpdateManyMutationInput, DriverUncheckedUpdateManyInput>;
    /**
     * Filter which Drivers to update
     */
    where?: DriverWhereInput;
    /**
     * Limit how many Drivers to update.
     */
    limit?: number;
  };

  /**
   * Driver updateManyAndReturn
   */
  export type DriverUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * The data used to update Drivers.
     */
    data: XOR<DriverUpdateManyMutationInput, DriverUncheckedUpdateManyInput>;
    /**
     * Filter which Drivers to update
     */
    where?: DriverWhereInput;
    /**
     * Limit how many Drivers to update.
     */
    limit?: number;
  };

  /**
   * Driver upsert
   */
  export type DriverUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * The filter to search for the Driver to update in case it exists.
     */
    where: DriverWhereUniqueInput;
    /**
     * In case the Driver found by the `where` argument doesn't exist, create a new Driver with this data.
     */
    create: XOR<DriverCreateInput, DriverUncheckedCreateInput>;
    /**
     * In case the Driver was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>;
  };

  /**
   * Driver delete
   */
  export type DriverDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
    /**
     * Filter which Driver to delete.
     */
    where: DriverWhereUniqueInput;
  };

  /**
   * Driver deleteMany
   */
  export type DriverDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Drivers to delete
     */
    where?: DriverWhereInput;
    /**
     * Limit how many Drivers to delete.
     */
    limit?: number;
  };

  /**
   * Driver.assignments
   */
  export type Driver$assignmentsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    where?: AssignmentWhereInput;
    orderBy?:
      | AssignmentOrderByWithRelationInput
      | AssignmentOrderByWithRelationInput[];
    cursor?: AssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: AssignmentScalarFieldEnum | AssignmentScalarFieldEnum[];
  };

  /**
   * Driver without action
   */
  export type DriverDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null;
  };

  /**
   * Model Assignment
   */

  export type AggregateAssignment = {
    _count: AssignmentCountAggregateOutputType | null;
    _min: AssignmentMinAggregateOutputType | null;
    _max: AssignmentMaxAggregateOutputType | null;
  };

  export type AssignmentMinAggregateOutputType = {
    id: string | null;
    driverId: string | null;
    passengerId: string | null;
    assignedAt: Date | null;
    completedAt: Date | null;
  };

  export type AssignmentMaxAggregateOutputType = {
    id: string | null;
    driverId: string | null;
    passengerId: string | null;
    assignedAt: Date | null;
    completedAt: Date | null;
  };

  export type AssignmentCountAggregateOutputType = {
    id: number;
    driverId: number;
    passengerId: number;
    assignedAt: number;
    completedAt: number;
    _all: number;
  };

  export type AssignmentMinAggregateInputType = {
    id?: true;
    driverId?: true;
    passengerId?: true;
    assignedAt?: true;
    completedAt?: true;
  };

  export type AssignmentMaxAggregateInputType = {
    id?: true;
    driverId?: true;
    passengerId?: true;
    assignedAt?: true;
    completedAt?: true;
  };

  export type AssignmentCountAggregateInputType = {
    id?: true;
    driverId?: true;
    passengerId?: true;
    assignedAt?: true;
    completedAt?: true;
    _all?: true;
  };

  export type AssignmentAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Assignment to aggregate.
     */
    where?: AssignmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Assignments to fetch.
     */
    orderBy?:
      | AssignmentOrderByWithRelationInput
      | AssignmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: AssignmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Assignments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Assignments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Assignments
     **/
    _count?: true | AssignmentCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: AssignmentMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: AssignmentMaxAggregateInputType;
  };

  export type GetAssignmentAggregateType<T extends AssignmentAggregateArgs> = {
    [P in keyof T & keyof AggregateAssignment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssignment[P]>
      : GetScalarType<T[P], AggregateAssignment[P]>;
  };

  export type AssignmentGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AssignmentWhereInput;
    orderBy?:
      | AssignmentOrderByWithAggregationInput
      | AssignmentOrderByWithAggregationInput[];
    by: AssignmentScalarFieldEnum[] | AssignmentScalarFieldEnum;
    having?: AssignmentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AssignmentCountAggregateInputType | true;
    _min?: AssignmentMinAggregateInputType;
    _max?: AssignmentMaxAggregateInputType;
  };

  export type AssignmentGroupByOutputType = {
    id: string;
    driverId: string;
    passengerId: string;
    assignedAt: Date;
    completedAt: Date | null;
    _count: AssignmentCountAggregateOutputType | null;
    _min: AssignmentMinAggregateOutputType | null;
    _max: AssignmentMaxAggregateOutputType | null;
  };

  type GetAssignmentGroupByPayload<T extends AssignmentGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<AssignmentGroupByOutputType, T['by']> & {
          [P in keyof T & keyof AssignmentGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssignmentGroupByOutputType[P]>
            : GetScalarType<T[P], AssignmentGroupByOutputType[P]>;
        }
      >
    >;

  export type AssignmentSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      driverId?: boolean;
      passengerId?: boolean;
      assignedAt?: boolean;
      completedAt?: boolean;
      driver?: boolean | DriverDefaultArgs<ExtArgs>;
      passenger?: boolean | PassengerDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['assignment']
  >;

  export type AssignmentSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      driverId?: boolean;
      passengerId?: boolean;
      assignedAt?: boolean;
      completedAt?: boolean;
      driver?: boolean | DriverDefaultArgs<ExtArgs>;
      passenger?: boolean | PassengerDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['assignment']
  >;

  export type AssignmentSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      driverId?: boolean;
      passengerId?: boolean;
      assignedAt?: boolean;
      completedAt?: boolean;
      driver?: boolean | DriverDefaultArgs<ExtArgs>;
      passenger?: boolean | PassengerDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['assignment']
  >;

  export type AssignmentSelectScalar = {
    id?: boolean;
    driverId?: boolean;
    passengerId?: boolean;
    assignedAt?: boolean;
    completedAt?: boolean;
  };

  export type AssignmentOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    'id' | 'driverId' | 'passengerId' | 'assignedAt' | 'completedAt',
    ExtArgs['result']['assignment']
  >;
  export type AssignmentInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    driver?: boolean | DriverDefaultArgs<ExtArgs>;
    passenger?: boolean | PassengerDefaultArgs<ExtArgs>;
  };
  export type AssignmentIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    driver?: boolean | DriverDefaultArgs<ExtArgs>;
    passenger?: boolean | PassengerDefaultArgs<ExtArgs>;
  };
  export type AssignmentIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    driver?: boolean | DriverDefaultArgs<ExtArgs>;
    passenger?: boolean | PassengerDefaultArgs<ExtArgs>;
  };

  export type $AssignmentPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Assignment';
    objects: {
      driver: Prisma.$DriverPayload<ExtArgs>;
      passenger: Prisma.$PassengerPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        driverId: string;
        passengerId: string;
        assignedAt: Date;
        completedAt: Date | null;
      },
      ExtArgs['result']['assignment']
    >;
    composites: {};
  };

  type AssignmentGetPayload<
    S extends boolean | null | undefined | AssignmentDefaultArgs,
  > = $Result.GetResult<Prisma.$AssignmentPayload, S>;

  type AssignmentCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    AssignmentFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: AssignmentCountAggregateInputType | true;
  };

  export interface AssignmentDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Assignment'];
      meta: { name: 'Assignment' };
    };
    /**
     * Find zero or one Assignment that matches the filter.
     * @param {AssignmentFindUniqueArgs} args - Arguments to find a Assignment
     * @example
     * // Get one Assignment
     * const assignment = await prisma.assignment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssignmentFindUniqueArgs>(
      args: SelectSubset<T, AssignmentFindUniqueArgs<ExtArgs>>
    ): Prisma__AssignmentClient<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Assignment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssignmentFindUniqueOrThrowArgs} args - Arguments to find a Assignment
     * @example
     * // Get one Assignment
     * const assignment = await prisma.assignment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssignmentFindUniqueOrThrowArgs>(
      args: SelectSubset<T, AssignmentFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AssignmentClient<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Assignment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentFindFirstArgs} args - Arguments to find a Assignment
     * @example
     * // Get one Assignment
     * const assignment = await prisma.assignment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssignmentFindFirstArgs>(
      args?: SelectSubset<T, AssignmentFindFirstArgs<ExtArgs>>
    ): Prisma__AssignmentClient<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Assignment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentFindFirstOrThrowArgs} args - Arguments to find a Assignment
     * @example
     * // Get one Assignment
     * const assignment = await prisma.assignment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssignmentFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AssignmentFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AssignmentClient<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Assignments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Assignments
     * const assignments = await prisma.assignment.findMany()
     *
     * // Get first 10 Assignments
     * const assignments = await prisma.assignment.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const assignmentWithIdOnly = await prisma.assignment.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AssignmentFindManyArgs>(
      args?: SelectSubset<T, AssignmentFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Assignment.
     * @param {AssignmentCreateArgs} args - Arguments to create a Assignment.
     * @example
     * // Create one Assignment
     * const Assignment = await prisma.assignment.create({
     *   data: {
     *     // ... data to create a Assignment
     *   }
     * })
     *
     */
    create<T extends AssignmentCreateArgs>(
      args: SelectSubset<T, AssignmentCreateArgs<ExtArgs>>
    ): Prisma__AssignmentClient<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Assignments.
     * @param {AssignmentCreateManyArgs} args - Arguments to create many Assignments.
     * @example
     * // Create many Assignments
     * const assignment = await prisma.assignment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AssignmentCreateManyArgs>(
      args?: SelectSubset<T, AssignmentCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Assignments and returns the data saved in the database.
     * @param {AssignmentCreateManyAndReturnArgs} args - Arguments to create many Assignments.
     * @example
     * // Create many Assignments
     * const assignment = await prisma.assignment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Assignments and only return the `id`
     * const assignmentWithIdOnly = await prisma.assignment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AssignmentCreateManyAndReturnArgs>(
      args?: SelectSubset<T, AssignmentCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Assignment.
     * @param {AssignmentDeleteArgs} args - Arguments to delete one Assignment.
     * @example
     * // Delete one Assignment
     * const Assignment = await prisma.assignment.delete({
     *   where: {
     *     // ... filter to delete one Assignment
     *   }
     * })
     *
     */
    delete<T extends AssignmentDeleteArgs>(
      args: SelectSubset<T, AssignmentDeleteArgs<ExtArgs>>
    ): Prisma__AssignmentClient<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Assignment.
     * @param {AssignmentUpdateArgs} args - Arguments to update one Assignment.
     * @example
     * // Update one Assignment
     * const assignment = await prisma.assignment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AssignmentUpdateArgs>(
      args: SelectSubset<T, AssignmentUpdateArgs<ExtArgs>>
    ): Prisma__AssignmentClient<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Assignments.
     * @param {AssignmentDeleteManyArgs} args - Arguments to filter Assignments to delete.
     * @example
     * // Delete a few Assignments
     * const { count } = await prisma.assignment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AssignmentDeleteManyArgs>(
      args?: SelectSubset<T, AssignmentDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Assignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Assignments
     * const assignment = await prisma.assignment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AssignmentUpdateManyArgs>(
      args: SelectSubset<T, AssignmentUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Assignments and returns the data updated in the database.
     * @param {AssignmentUpdateManyAndReturnArgs} args - Arguments to update many Assignments.
     * @example
     * // Update many Assignments
     * const assignment = await prisma.assignment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Assignments and only return the `id`
     * const assignmentWithIdOnly = await prisma.assignment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends AssignmentUpdateManyAndReturnArgs>(
      args: SelectSubset<T, AssignmentUpdateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Assignment.
     * @param {AssignmentUpsertArgs} args - Arguments to update or create a Assignment.
     * @example
     * // Update or create a Assignment
     * const assignment = await prisma.assignment.upsert({
     *   create: {
     *     // ... data to create a Assignment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Assignment we want to update
     *   }
     * })
     */
    upsert<T extends AssignmentUpsertArgs>(
      args: SelectSubset<T, AssignmentUpsertArgs<ExtArgs>>
    ): Prisma__AssignmentClient<
      $Result.GetResult<
        Prisma.$AssignmentPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Assignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentCountArgs} args - Arguments to filter Assignments to count.
     * @example
     * // Count the number of Assignments
     * const count = await prisma.assignment.count({
     *   where: {
     *     // ... the filter for the Assignments we want to count
     *   }
     * })
     **/
    count<T extends AssignmentCountArgs>(
      args?: Subset<T, AssignmentCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssignmentCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Assignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends AssignmentAggregateArgs>(
      args: Subset<T, AssignmentAggregateArgs>
    ): Prisma.PrismaPromise<GetAssignmentAggregateType<T>>;

    /**
     * Group by Assignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssignmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends AssignmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssignmentGroupByArgs['orderBy'] }
        : { orderBy?: AssignmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, AssignmentGroupByArgs, OrderByArg> &
        InputErrors
    ): {} extends InputErrors
      ? GetAssignmentGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Assignment model
     */
    readonly fields: AssignmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Assignment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssignmentClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    driver<T extends DriverDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, DriverDefaultArgs<ExtArgs>>
    ): Prisma__DriverClient<
      | $Result.GetResult<
          Prisma.$DriverPayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    passenger<T extends PassengerDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, PassengerDefaultArgs<ExtArgs>>
    ): Prisma__PassengerClient<
      | $Result.GetResult<
          Prisma.$PassengerPayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Assignment model
   */
  interface AssignmentFieldRefs {
    readonly id: FieldRef<'Assignment', 'String'>;
    readonly driverId: FieldRef<'Assignment', 'String'>;
    readonly passengerId: FieldRef<'Assignment', 'String'>;
    readonly assignedAt: FieldRef<'Assignment', 'DateTime'>;
    readonly completedAt: FieldRef<'Assignment', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Assignment findUnique
   */
  export type AssignmentFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * Filter, which Assignment to fetch.
     */
    where: AssignmentWhereUniqueInput;
  };

  /**
   * Assignment findUniqueOrThrow
   */
  export type AssignmentFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * Filter, which Assignment to fetch.
     */
    where: AssignmentWhereUniqueInput;
  };

  /**
   * Assignment findFirst
   */
  export type AssignmentFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * Filter, which Assignment to fetch.
     */
    where?: AssignmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Assignments to fetch.
     */
    orderBy?:
      | AssignmentOrderByWithRelationInput
      | AssignmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Assignments.
     */
    cursor?: AssignmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Assignments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Assignments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Assignments.
     */
    distinct?: AssignmentScalarFieldEnum | AssignmentScalarFieldEnum[];
  };

  /**
   * Assignment findFirstOrThrow
   */
  export type AssignmentFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * Filter, which Assignment to fetch.
     */
    where?: AssignmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Assignments to fetch.
     */
    orderBy?:
      | AssignmentOrderByWithRelationInput
      | AssignmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Assignments.
     */
    cursor?: AssignmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Assignments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Assignments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Assignments.
     */
    distinct?: AssignmentScalarFieldEnum | AssignmentScalarFieldEnum[];
  };

  /**
   * Assignment findMany
   */
  export type AssignmentFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * Filter, which Assignments to fetch.
     */
    where?: AssignmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Assignments to fetch.
     */
    orderBy?:
      | AssignmentOrderByWithRelationInput
      | AssignmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Assignments.
     */
    cursor?: AssignmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Assignments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Assignments.
     */
    skip?: number;
    distinct?: AssignmentScalarFieldEnum | AssignmentScalarFieldEnum[];
  };

  /**
   * Assignment create
   */
  export type AssignmentCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * The data needed to create a Assignment.
     */
    data: XOR<AssignmentCreateInput, AssignmentUncheckedCreateInput>;
  };

  /**
   * Assignment createMany
   */
  export type AssignmentCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Assignments.
     */
    data: AssignmentCreateManyInput | AssignmentCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Assignment createManyAndReturn
   */
  export type AssignmentCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * The data used to create many Assignments.
     */
    data: AssignmentCreateManyInput | AssignmentCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Assignment update
   */
  export type AssignmentUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * The data needed to update a Assignment.
     */
    data: XOR<AssignmentUpdateInput, AssignmentUncheckedUpdateInput>;
    /**
     * Choose, which Assignment to update.
     */
    where: AssignmentWhereUniqueInput;
  };

  /**
   * Assignment updateMany
   */
  export type AssignmentUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Assignments.
     */
    data: XOR<
      AssignmentUpdateManyMutationInput,
      AssignmentUncheckedUpdateManyInput
    >;
    /**
     * Filter which Assignments to update
     */
    where?: AssignmentWhereInput;
    /**
     * Limit how many Assignments to update.
     */
    limit?: number;
  };

  /**
   * Assignment updateManyAndReturn
   */
  export type AssignmentUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * The data used to update Assignments.
     */
    data: XOR<
      AssignmentUpdateManyMutationInput,
      AssignmentUncheckedUpdateManyInput
    >;
    /**
     * Filter which Assignments to update
     */
    where?: AssignmentWhereInput;
    /**
     * Limit how many Assignments to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Assignment upsert
   */
  export type AssignmentUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * The filter to search for the Assignment to update in case it exists.
     */
    where: AssignmentWhereUniqueInput;
    /**
     * In case the Assignment found by the `where` argument doesn't exist, create a new Assignment with this data.
     */
    create: XOR<AssignmentCreateInput, AssignmentUncheckedCreateInput>;
    /**
     * In case the Assignment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssignmentUpdateInput, AssignmentUncheckedUpdateInput>;
  };

  /**
   * Assignment delete
   */
  export type AssignmentDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
    /**
     * Filter which Assignment to delete.
     */
    where: AssignmentWhereUniqueInput;
  };

  /**
   * Assignment deleteMany
   */
  export type AssignmentDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Assignments to delete
     */
    where?: AssignmentWhereInput;
    /**
     * Limit how many Assignments to delete.
     */
    limit?: number;
  };

  /**
   * Assignment without action
   */
  export type AssignmentDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Assignment
     */
    select?: AssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Assignment
     */
    omit?: AssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssignmentInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const PassengerScalarFieldEnum: {
    id: 'id';
    name: 'name';
    isDirect: 'isDirect';
    estimatedDurationMin: 'estimatedDurationMin';
    earliestPickupTime: 'earliestPickupTime';
    latestPickupTime: 'latestPickupTime';
    earliestDropoffTime: 'earliestDropoffTime';
    latestDropoffTime: 'latestDropoffTime';
    pickupStreetNumber: 'pickupStreetNumber';
    pickupStreet: 'pickupStreet';
    pickupCity: 'pickupCity';
    pickupZip: 'pickupZip';
    dropoffStreetNumber: 'dropoffStreetNumber';
    dropoffStreet: 'dropoffStreet';
    dropoffCity: 'dropoffCity';
    dropoffZip: 'dropoffZip';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type PassengerScalarFieldEnum =
    (typeof PassengerScalarFieldEnum)[keyof typeof PassengerScalarFieldEnum];

  export const DriverScalarFieldEnum: {
    id: 'id';
    name: 'name';
    phone: 'phone';
    licenseNumber: 'licenseNumber';
    vehicleType: 'vehicleType';
    plateNumber: 'plateNumber';
    isAvailable: 'isAvailable';
    homeBaseLat: 'homeBaseLat';
    homeBaseLng: 'homeBaseLng';
    lastKnownLat: 'lastKnownLat';
    lastKnownLng: 'lastKnownLng';
    lastUpdated: 'lastUpdated';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type DriverScalarFieldEnum =
    (typeof DriverScalarFieldEnum)[keyof typeof DriverScalarFieldEnum];

  export const AssignmentScalarFieldEnum: {
    id: 'id';
    driverId: 'driverId';
    passengerId: 'passengerId';
    assignedAt: 'assignedAt';
    completedAt: 'completedAt';
  };

  export type AssignmentScalarFieldEnum =
    (typeof AssignmentScalarFieldEnum)[keyof typeof AssignmentScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String'
  >;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String[]'
  >;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Boolean'
  >;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int'
  >;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int[]'
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime'
  >;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime[]'
  >;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Float'
  >;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Float[]'
  >;

  /**
   * Deep Input Types
   */

  export type PassengerWhereInput = {
    AND?: PassengerWhereInput | PassengerWhereInput[];
    OR?: PassengerWhereInput[];
    NOT?: PassengerWhereInput | PassengerWhereInput[];
    id?: StringFilter<'Passenger'> | string;
    name?: StringFilter<'Passenger'> | string;
    isDirect?: BoolFilter<'Passenger'> | boolean;
    estimatedDurationMin?: IntNullableFilter<'Passenger'> | number | null;
    earliestPickupTime?:
      | DateTimeNullableFilter<'Passenger'>
      | Date
      | string
      | null;
    latestPickupTime?:
      | DateTimeNullableFilter<'Passenger'>
      | Date
      | string
      | null;
    earliestDropoffTime?:
      | DateTimeNullableFilter<'Passenger'>
      | Date
      | string
      | null;
    latestDropoffTime?:
      | DateTimeNullableFilter<'Passenger'>
      | Date
      | string
      | null;
    pickupStreetNumber?: StringNullableFilter<'Passenger'> | string | null;
    pickupStreet?: StringNullableFilter<'Passenger'> | string | null;
    pickupCity?: StringNullableFilter<'Passenger'> | string | null;
    pickupZip?: StringNullableFilter<'Passenger'> | string | null;
    dropoffStreetNumber?: StringNullableFilter<'Passenger'> | string | null;
    dropoffStreet?: StringNullableFilter<'Passenger'> | string | null;
    dropoffCity?: StringNullableFilter<'Passenger'> | string | null;
    dropoffZip?: StringNullableFilter<'Passenger'> | string | null;
    createdAt?: DateTimeFilter<'Passenger'> | Date | string;
    updatedAt?: DateTimeFilter<'Passenger'> | Date | string;
    assignments?: AssignmentListRelationFilter;
  };

  export type PassengerOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    isDirect?: SortOrder;
    estimatedDurationMin?: SortOrderInput | SortOrder;
    earliestPickupTime?: SortOrderInput | SortOrder;
    latestPickupTime?: SortOrderInput | SortOrder;
    earliestDropoffTime?: SortOrderInput | SortOrder;
    latestDropoffTime?: SortOrderInput | SortOrder;
    pickupStreetNumber?: SortOrderInput | SortOrder;
    pickupStreet?: SortOrderInput | SortOrder;
    pickupCity?: SortOrderInput | SortOrder;
    pickupZip?: SortOrderInput | SortOrder;
    dropoffStreetNumber?: SortOrderInput | SortOrder;
    dropoffStreet?: SortOrderInput | SortOrder;
    dropoffCity?: SortOrderInput | SortOrder;
    dropoffZip?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    assignments?: AssignmentOrderByRelationAggregateInput;
  };

  export type PassengerWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: PassengerWhereInput | PassengerWhereInput[];
      OR?: PassengerWhereInput[];
      NOT?: PassengerWhereInput | PassengerWhereInput[];
      name?: StringFilter<'Passenger'> | string;
      isDirect?: BoolFilter<'Passenger'> | boolean;
      estimatedDurationMin?: IntNullableFilter<'Passenger'> | number | null;
      earliestPickupTime?:
        | DateTimeNullableFilter<'Passenger'>
        | Date
        | string
        | null;
      latestPickupTime?:
        | DateTimeNullableFilter<'Passenger'>
        | Date
        | string
        | null;
      earliestDropoffTime?:
        | DateTimeNullableFilter<'Passenger'>
        | Date
        | string
        | null;
      latestDropoffTime?:
        | DateTimeNullableFilter<'Passenger'>
        | Date
        | string
        | null;
      pickupStreetNumber?: StringNullableFilter<'Passenger'> | string | null;
      pickupStreet?: StringNullableFilter<'Passenger'> | string | null;
      pickupCity?: StringNullableFilter<'Passenger'> | string | null;
      pickupZip?: StringNullableFilter<'Passenger'> | string | null;
      dropoffStreetNumber?: StringNullableFilter<'Passenger'> | string | null;
      dropoffStreet?: StringNullableFilter<'Passenger'> | string | null;
      dropoffCity?: StringNullableFilter<'Passenger'> | string | null;
      dropoffZip?: StringNullableFilter<'Passenger'> | string | null;
      createdAt?: DateTimeFilter<'Passenger'> | Date | string;
      updatedAt?: DateTimeFilter<'Passenger'> | Date | string;
      assignments?: AssignmentListRelationFilter;
    },
    'id'
  >;

  export type PassengerOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    isDirect?: SortOrder;
    estimatedDurationMin?: SortOrderInput | SortOrder;
    earliestPickupTime?: SortOrderInput | SortOrder;
    latestPickupTime?: SortOrderInput | SortOrder;
    earliestDropoffTime?: SortOrderInput | SortOrder;
    latestDropoffTime?: SortOrderInput | SortOrder;
    pickupStreetNumber?: SortOrderInput | SortOrder;
    pickupStreet?: SortOrderInput | SortOrder;
    pickupCity?: SortOrderInput | SortOrder;
    pickupZip?: SortOrderInput | SortOrder;
    dropoffStreetNumber?: SortOrderInput | SortOrder;
    dropoffStreet?: SortOrderInput | SortOrder;
    dropoffCity?: SortOrderInput | SortOrder;
    dropoffZip?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: PassengerCountOrderByAggregateInput;
    _avg?: PassengerAvgOrderByAggregateInput;
    _max?: PassengerMaxOrderByAggregateInput;
    _min?: PassengerMinOrderByAggregateInput;
    _sum?: PassengerSumOrderByAggregateInput;
  };

  export type PassengerScalarWhereWithAggregatesInput = {
    AND?:
      | PassengerScalarWhereWithAggregatesInput
      | PassengerScalarWhereWithAggregatesInput[];
    OR?: PassengerScalarWhereWithAggregatesInput[];
    NOT?:
      | PassengerScalarWhereWithAggregatesInput
      | PassengerScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Passenger'> | string;
    name?: StringWithAggregatesFilter<'Passenger'> | string;
    isDirect?: BoolWithAggregatesFilter<'Passenger'> | boolean;
    estimatedDurationMin?:
      | IntNullableWithAggregatesFilter<'Passenger'>
      | number
      | null;
    earliestPickupTime?:
      | DateTimeNullableWithAggregatesFilter<'Passenger'>
      | Date
      | string
      | null;
    latestPickupTime?:
      | DateTimeNullableWithAggregatesFilter<'Passenger'>
      | Date
      | string
      | null;
    earliestDropoffTime?:
      | DateTimeNullableWithAggregatesFilter<'Passenger'>
      | Date
      | string
      | null;
    latestDropoffTime?:
      | DateTimeNullableWithAggregatesFilter<'Passenger'>
      | Date
      | string
      | null;
    pickupStreetNumber?:
      | StringNullableWithAggregatesFilter<'Passenger'>
      | string
      | null;
    pickupStreet?:
      | StringNullableWithAggregatesFilter<'Passenger'>
      | string
      | null;
    pickupCity?:
      | StringNullableWithAggregatesFilter<'Passenger'>
      | string
      | null;
    pickupZip?: StringNullableWithAggregatesFilter<'Passenger'> | string | null;
    dropoffStreetNumber?:
      | StringNullableWithAggregatesFilter<'Passenger'>
      | string
      | null;
    dropoffStreet?:
      | StringNullableWithAggregatesFilter<'Passenger'>
      | string
      | null;
    dropoffCity?:
      | StringNullableWithAggregatesFilter<'Passenger'>
      | string
      | null;
    dropoffZip?:
      | StringNullableWithAggregatesFilter<'Passenger'>
      | string
      | null;
    createdAt?: DateTimeWithAggregatesFilter<'Passenger'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Passenger'> | Date | string;
  };

  export type DriverWhereInput = {
    AND?: DriverWhereInput | DriverWhereInput[];
    OR?: DriverWhereInput[];
    NOT?: DriverWhereInput | DriverWhereInput[];
    id?: StringFilter<'Driver'> | string;
    name?: StringFilter<'Driver'> | string;
    phone?: StringFilter<'Driver'> | string;
    licenseNumber?: StringNullableFilter<'Driver'> | string | null;
    vehicleType?: StringNullableFilter<'Driver'> | string | null;
    plateNumber?: StringNullableFilter<'Driver'> | string | null;
    isAvailable?: BoolFilter<'Driver'> | boolean;
    homeBaseLat?: FloatNullableFilter<'Driver'> | number | null;
    homeBaseLng?: FloatNullableFilter<'Driver'> | number | null;
    lastKnownLat?: FloatNullableFilter<'Driver'> | number | null;
    lastKnownLng?: FloatNullableFilter<'Driver'> | number | null;
    lastUpdated?: DateTimeNullableFilter<'Driver'> | Date | string | null;
    createdAt?: DateTimeFilter<'Driver'> | Date | string;
    updatedAt?: DateTimeFilter<'Driver'> | Date | string;
    assignments?: AssignmentListRelationFilter;
  };

  export type DriverOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    phone?: SortOrder;
    licenseNumber?: SortOrderInput | SortOrder;
    vehicleType?: SortOrderInput | SortOrder;
    plateNumber?: SortOrderInput | SortOrder;
    isAvailable?: SortOrder;
    homeBaseLat?: SortOrderInput | SortOrder;
    homeBaseLng?: SortOrderInput | SortOrder;
    lastKnownLat?: SortOrderInput | SortOrder;
    lastKnownLng?: SortOrderInput | SortOrder;
    lastUpdated?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    assignments?: AssignmentOrderByRelationAggregateInput;
  };

  export type DriverWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      phone?: string;
      plateNumber?: string;
      AND?: DriverWhereInput | DriverWhereInput[];
      OR?: DriverWhereInput[];
      NOT?: DriverWhereInput | DriverWhereInput[];
      name?: StringFilter<'Driver'> | string;
      licenseNumber?: StringNullableFilter<'Driver'> | string | null;
      vehicleType?: StringNullableFilter<'Driver'> | string | null;
      isAvailable?: BoolFilter<'Driver'> | boolean;
      homeBaseLat?: FloatNullableFilter<'Driver'> | number | null;
      homeBaseLng?: FloatNullableFilter<'Driver'> | number | null;
      lastKnownLat?: FloatNullableFilter<'Driver'> | number | null;
      lastKnownLng?: FloatNullableFilter<'Driver'> | number | null;
      lastUpdated?: DateTimeNullableFilter<'Driver'> | Date | string | null;
      createdAt?: DateTimeFilter<'Driver'> | Date | string;
      updatedAt?: DateTimeFilter<'Driver'> | Date | string;
      assignments?: AssignmentListRelationFilter;
    },
    'id' | 'phone' | 'plateNumber'
  >;

  export type DriverOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    phone?: SortOrder;
    licenseNumber?: SortOrderInput | SortOrder;
    vehicleType?: SortOrderInput | SortOrder;
    plateNumber?: SortOrderInput | SortOrder;
    isAvailable?: SortOrder;
    homeBaseLat?: SortOrderInput | SortOrder;
    homeBaseLng?: SortOrderInput | SortOrder;
    lastKnownLat?: SortOrderInput | SortOrder;
    lastKnownLng?: SortOrderInput | SortOrder;
    lastUpdated?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: DriverCountOrderByAggregateInput;
    _avg?: DriverAvgOrderByAggregateInput;
    _max?: DriverMaxOrderByAggregateInput;
    _min?: DriverMinOrderByAggregateInput;
    _sum?: DriverSumOrderByAggregateInput;
  };

  export type DriverScalarWhereWithAggregatesInput = {
    AND?:
      | DriverScalarWhereWithAggregatesInput
      | DriverScalarWhereWithAggregatesInput[];
    OR?: DriverScalarWhereWithAggregatesInput[];
    NOT?:
      | DriverScalarWhereWithAggregatesInput
      | DriverScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Driver'> | string;
    name?: StringWithAggregatesFilter<'Driver'> | string;
    phone?: StringWithAggregatesFilter<'Driver'> | string;
    licenseNumber?:
      | StringNullableWithAggregatesFilter<'Driver'>
      | string
      | null;
    vehicleType?: StringNullableWithAggregatesFilter<'Driver'> | string | null;
    plateNumber?: StringNullableWithAggregatesFilter<'Driver'> | string | null;
    isAvailable?: BoolWithAggregatesFilter<'Driver'> | boolean;
    homeBaseLat?: FloatNullableWithAggregatesFilter<'Driver'> | number | null;
    homeBaseLng?: FloatNullableWithAggregatesFilter<'Driver'> | number | null;
    lastKnownLat?: FloatNullableWithAggregatesFilter<'Driver'> | number | null;
    lastKnownLng?: FloatNullableWithAggregatesFilter<'Driver'> | number | null;
    lastUpdated?:
      | DateTimeNullableWithAggregatesFilter<'Driver'>
      | Date
      | string
      | null;
    createdAt?: DateTimeWithAggregatesFilter<'Driver'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Driver'> | Date | string;
  };

  export type AssignmentWhereInput = {
    AND?: AssignmentWhereInput | AssignmentWhereInput[];
    OR?: AssignmentWhereInput[];
    NOT?: AssignmentWhereInput | AssignmentWhereInput[];
    id?: StringFilter<'Assignment'> | string;
    driverId?: StringFilter<'Assignment'> | string;
    passengerId?: StringFilter<'Assignment'> | string;
    assignedAt?: DateTimeFilter<'Assignment'> | Date | string;
    completedAt?: DateTimeNullableFilter<'Assignment'> | Date | string | null;
    driver?: XOR<DriverScalarRelationFilter, DriverWhereInput>;
    passenger?: XOR<PassengerScalarRelationFilter, PassengerWhereInput>;
  };

  export type AssignmentOrderByWithRelationInput = {
    id?: SortOrder;
    driverId?: SortOrder;
    passengerId?: SortOrder;
    assignedAt?: SortOrder;
    completedAt?: SortOrderInput | SortOrder;
    driver?: DriverOrderByWithRelationInput;
    passenger?: PassengerOrderByWithRelationInput;
  };

  export type AssignmentWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: AssignmentWhereInput | AssignmentWhereInput[];
      OR?: AssignmentWhereInput[];
      NOT?: AssignmentWhereInput | AssignmentWhereInput[];
      driverId?: StringFilter<'Assignment'> | string;
      passengerId?: StringFilter<'Assignment'> | string;
      assignedAt?: DateTimeFilter<'Assignment'> | Date | string;
      completedAt?: DateTimeNullableFilter<'Assignment'> | Date | string | null;
      driver?: XOR<DriverScalarRelationFilter, DriverWhereInput>;
      passenger?: XOR<PassengerScalarRelationFilter, PassengerWhereInput>;
    },
    'id'
  >;

  export type AssignmentOrderByWithAggregationInput = {
    id?: SortOrder;
    driverId?: SortOrder;
    passengerId?: SortOrder;
    assignedAt?: SortOrder;
    completedAt?: SortOrderInput | SortOrder;
    _count?: AssignmentCountOrderByAggregateInput;
    _max?: AssignmentMaxOrderByAggregateInput;
    _min?: AssignmentMinOrderByAggregateInput;
  };

  export type AssignmentScalarWhereWithAggregatesInput = {
    AND?:
      | AssignmentScalarWhereWithAggregatesInput
      | AssignmentScalarWhereWithAggregatesInput[];
    OR?: AssignmentScalarWhereWithAggregatesInput[];
    NOT?:
      | AssignmentScalarWhereWithAggregatesInput
      | AssignmentScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Assignment'> | string;
    driverId?: StringWithAggregatesFilter<'Assignment'> | string;
    passengerId?: StringWithAggregatesFilter<'Assignment'> | string;
    assignedAt?: DateTimeWithAggregatesFilter<'Assignment'> | Date | string;
    completedAt?:
      | DateTimeNullableWithAggregatesFilter<'Assignment'>
      | Date
      | string
      | null;
  };

  export type PassengerCreateInput = {
    id?: string;
    name: string;
    isDirect: boolean;
    estimatedDurationMin?: number | null;
    earliestPickupTime?: Date | string | null;
    latestPickupTime?: Date | string | null;
    earliestDropoffTime?: Date | string | null;
    latestDropoffTime?: Date | string | null;
    pickupStreetNumber?: string | null;
    pickupStreet?: string | null;
    pickupCity?: string | null;
    pickupZip?: string | null;
    dropoffStreetNumber?: string | null;
    dropoffStreet?: string | null;
    dropoffCity?: string | null;
    dropoffZip?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assignments?: AssignmentCreateNestedManyWithoutPassengerInput;
  };

  export type PassengerUncheckedCreateInput = {
    id?: string;
    name: string;
    isDirect: boolean;
    estimatedDurationMin?: number | null;
    earliestPickupTime?: Date | string | null;
    latestPickupTime?: Date | string | null;
    earliestDropoffTime?: Date | string | null;
    latestDropoffTime?: Date | string | null;
    pickupStreetNumber?: string | null;
    pickupStreet?: string | null;
    pickupCity?: string | null;
    pickupZip?: string | null;
    dropoffStreetNumber?: string | null;
    dropoffStreet?: string | null;
    dropoffCity?: string | null;
    dropoffZip?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assignments?: AssignmentUncheckedCreateNestedManyWithoutPassengerInput;
  };

  export type PassengerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    isDirect?: BoolFieldUpdateOperationsInput | boolean;
    estimatedDurationMin?:
      | NullableIntFieldUpdateOperationsInput
      | number
      | null;
    earliestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    earliestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    pickupStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    pickupStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupCity?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupZip?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    dropoffStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffCity?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffZip?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    assignments?: AssignmentUpdateManyWithoutPassengerNestedInput;
  };

  export type PassengerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    isDirect?: BoolFieldUpdateOperationsInput | boolean;
    estimatedDurationMin?:
      | NullableIntFieldUpdateOperationsInput
      | number
      | null;
    earliestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    earliestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    pickupStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    pickupStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupCity?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupZip?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    dropoffStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffCity?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffZip?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    assignments?: AssignmentUncheckedUpdateManyWithoutPassengerNestedInput;
  };

  export type PassengerCreateManyInput = {
    id?: string;
    name: string;
    isDirect: boolean;
    estimatedDurationMin?: number | null;
    earliestPickupTime?: Date | string | null;
    latestPickupTime?: Date | string | null;
    earliestDropoffTime?: Date | string | null;
    latestDropoffTime?: Date | string | null;
    pickupStreetNumber?: string | null;
    pickupStreet?: string | null;
    pickupCity?: string | null;
    pickupZip?: string | null;
    dropoffStreetNumber?: string | null;
    dropoffStreet?: string | null;
    dropoffCity?: string | null;
    dropoffZip?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PassengerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    isDirect?: BoolFieldUpdateOperationsInput | boolean;
    estimatedDurationMin?:
      | NullableIntFieldUpdateOperationsInput
      | number
      | null;
    earliestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    earliestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    pickupStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    pickupStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupCity?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupZip?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    dropoffStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffCity?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffZip?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PassengerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    isDirect?: BoolFieldUpdateOperationsInput | boolean;
    estimatedDurationMin?:
      | NullableIntFieldUpdateOperationsInput
      | number
      | null;
    earliestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    earliestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    pickupStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    pickupStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupCity?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupZip?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    dropoffStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffCity?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffZip?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DriverCreateInput = {
    id?: string;
    name: string;
    phone: string;
    licenseNumber?: string | null;
    vehicleType?: string | null;
    plateNumber?: string | null;
    isAvailable?: boolean;
    homeBaseLat?: number | null;
    homeBaseLng?: number | null;
    lastKnownLat?: number | null;
    lastKnownLng?: number | null;
    lastUpdated?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assignments?: AssignmentCreateNestedManyWithoutDriverInput;
  };

  export type DriverUncheckedCreateInput = {
    id?: string;
    name: string;
    phone: string;
    licenseNumber?: string | null;
    vehicleType?: string | null;
    plateNumber?: string | null;
    isAvailable?: boolean;
    homeBaseLat?: number | null;
    homeBaseLng?: number | null;
    lastKnownLat?: number | null;
    lastKnownLng?: number | null;
    lastUpdated?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assignments?: AssignmentUncheckedCreateNestedManyWithoutDriverInput;
  };

  export type DriverUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    phone?: StringFieldUpdateOperationsInput | string;
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    vehicleType?: NullableStringFieldUpdateOperationsInput | string | null;
    plateNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    isAvailable?: BoolFieldUpdateOperationsInput | boolean;
    homeBaseLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    homeBaseLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastUpdated?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    assignments?: AssignmentUpdateManyWithoutDriverNestedInput;
  };

  export type DriverUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    phone?: StringFieldUpdateOperationsInput | string;
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    vehicleType?: NullableStringFieldUpdateOperationsInput | string | null;
    plateNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    isAvailable?: BoolFieldUpdateOperationsInput | boolean;
    homeBaseLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    homeBaseLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastUpdated?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    assignments?: AssignmentUncheckedUpdateManyWithoutDriverNestedInput;
  };

  export type DriverCreateManyInput = {
    id?: string;
    name: string;
    phone: string;
    licenseNumber?: string | null;
    vehicleType?: string | null;
    plateNumber?: string | null;
    isAvailable?: boolean;
    homeBaseLat?: number | null;
    homeBaseLng?: number | null;
    lastKnownLat?: number | null;
    lastKnownLng?: number | null;
    lastUpdated?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DriverUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    phone?: StringFieldUpdateOperationsInput | string;
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    vehicleType?: NullableStringFieldUpdateOperationsInput | string | null;
    plateNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    isAvailable?: BoolFieldUpdateOperationsInput | boolean;
    homeBaseLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    homeBaseLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastUpdated?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DriverUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    phone?: StringFieldUpdateOperationsInput | string;
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    vehicleType?: NullableStringFieldUpdateOperationsInput | string | null;
    plateNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    isAvailable?: BoolFieldUpdateOperationsInput | boolean;
    homeBaseLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    homeBaseLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastUpdated?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AssignmentCreateInput = {
    id?: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
    driver: DriverCreateNestedOneWithoutAssignmentsInput;
    passenger: PassengerCreateNestedOneWithoutAssignmentsInput;
  };

  export type AssignmentUncheckedCreateInput = {
    id?: string;
    driverId: string;
    passengerId: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
  };

  export type AssignmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    driver?: DriverUpdateOneRequiredWithoutAssignmentsNestedInput;
    passenger?: PassengerUpdateOneRequiredWithoutAssignmentsNestedInput;
  };

  export type AssignmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    driverId?: StringFieldUpdateOperationsInput | string;
    passengerId?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type AssignmentCreateManyInput = {
    id?: string;
    driverId: string;
    passengerId: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
  };

  export type AssignmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type AssignmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    driverId?: StringFieldUpdateOperationsInput | string;
    passengerId?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type AssignmentListRelationFilter = {
    every?: AssignmentWhereInput;
    some?: AssignmentWhereInput;
    none?: AssignmentWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type AssignmentOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type PassengerCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    isDirect?: SortOrder;
    estimatedDurationMin?: SortOrder;
    earliestPickupTime?: SortOrder;
    latestPickupTime?: SortOrder;
    earliestDropoffTime?: SortOrder;
    latestDropoffTime?: SortOrder;
    pickupStreetNumber?: SortOrder;
    pickupStreet?: SortOrder;
    pickupCity?: SortOrder;
    pickupZip?: SortOrder;
    dropoffStreetNumber?: SortOrder;
    dropoffStreet?: SortOrder;
    dropoffCity?: SortOrder;
    dropoffZip?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PassengerAvgOrderByAggregateInput = {
    estimatedDurationMin?: SortOrder;
  };

  export type PassengerMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    isDirect?: SortOrder;
    estimatedDurationMin?: SortOrder;
    earliestPickupTime?: SortOrder;
    latestPickupTime?: SortOrder;
    earliestDropoffTime?: SortOrder;
    latestDropoffTime?: SortOrder;
    pickupStreetNumber?: SortOrder;
    pickupStreet?: SortOrder;
    pickupCity?: SortOrder;
    pickupZip?: SortOrder;
    dropoffStreetNumber?: SortOrder;
    dropoffStreet?: SortOrder;
    dropoffCity?: SortOrder;
    dropoffZip?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PassengerMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    isDirect?: SortOrder;
    estimatedDurationMin?: SortOrder;
    earliestPickupTime?: SortOrder;
    latestPickupTime?: SortOrder;
    earliestDropoffTime?: SortOrder;
    latestDropoffTime?: SortOrder;
    pickupStreetNumber?: SortOrder;
    pickupStreet?: SortOrder;
    pickupCity?: SortOrder;
    pickupZip?: SortOrder;
    dropoffStreetNumber?: SortOrder;
    dropoffStreet?: SortOrder;
    dropoffCity?: SortOrder;
    dropoffZip?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PassengerSumOrderByAggregateInput = {
    estimatedDurationMin?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?:
      | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
      | Date
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type DriverCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    phone?: SortOrder;
    licenseNumber?: SortOrder;
    vehicleType?: SortOrder;
    plateNumber?: SortOrder;
    isAvailable?: SortOrder;
    homeBaseLat?: SortOrder;
    homeBaseLng?: SortOrder;
    lastKnownLat?: SortOrder;
    lastKnownLng?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DriverAvgOrderByAggregateInput = {
    homeBaseLat?: SortOrder;
    homeBaseLng?: SortOrder;
    lastKnownLat?: SortOrder;
    lastKnownLng?: SortOrder;
  };

  export type DriverMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    phone?: SortOrder;
    licenseNumber?: SortOrder;
    vehicleType?: SortOrder;
    plateNumber?: SortOrder;
    isAvailable?: SortOrder;
    homeBaseLat?: SortOrder;
    homeBaseLng?: SortOrder;
    lastKnownLat?: SortOrder;
    lastKnownLng?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DriverMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    phone?: SortOrder;
    licenseNumber?: SortOrder;
    vehicleType?: SortOrder;
    plateNumber?: SortOrder;
    isAvailable?: SortOrder;
    homeBaseLat?: SortOrder;
    homeBaseLng?: SortOrder;
    lastKnownLat?: SortOrder;
    lastKnownLng?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DriverSumOrderByAggregateInput = {
    homeBaseLat?: SortOrder;
    homeBaseLng?: SortOrder;
    lastKnownLat?: SortOrder;
    lastKnownLng?: SortOrder;
  };

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedFloatNullableFilter<$PrismaModel>;
    _min?: NestedFloatNullableFilter<$PrismaModel>;
    _max?: NestedFloatNullableFilter<$PrismaModel>;
  };

  export type DriverScalarRelationFilter = {
    is?: DriverWhereInput;
    isNot?: DriverWhereInput;
  };

  export type PassengerScalarRelationFilter = {
    is?: PassengerWhereInput;
    isNot?: PassengerWhereInput;
  };

  export type AssignmentCountOrderByAggregateInput = {
    id?: SortOrder;
    driverId?: SortOrder;
    passengerId?: SortOrder;
    assignedAt?: SortOrder;
    completedAt?: SortOrder;
  };

  export type AssignmentMaxOrderByAggregateInput = {
    id?: SortOrder;
    driverId?: SortOrder;
    passengerId?: SortOrder;
    assignedAt?: SortOrder;
    completedAt?: SortOrder;
  };

  export type AssignmentMinOrderByAggregateInput = {
    id?: SortOrder;
    driverId?: SortOrder;
    passengerId?: SortOrder;
    assignedAt?: SortOrder;
    completedAt?: SortOrder;
  };

  export type AssignmentCreateNestedManyWithoutPassengerInput = {
    create?:
      | XOR<
          AssignmentCreateWithoutPassengerInput,
          AssignmentUncheckedCreateWithoutPassengerInput
        >
      | AssignmentCreateWithoutPassengerInput[]
      | AssignmentUncheckedCreateWithoutPassengerInput[];
    connectOrCreate?:
      | AssignmentCreateOrConnectWithoutPassengerInput
      | AssignmentCreateOrConnectWithoutPassengerInput[];
    createMany?: AssignmentCreateManyPassengerInputEnvelope;
    connect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
  };

  export type AssignmentUncheckedCreateNestedManyWithoutPassengerInput = {
    create?:
      | XOR<
          AssignmentCreateWithoutPassengerInput,
          AssignmentUncheckedCreateWithoutPassengerInput
        >
      | AssignmentCreateWithoutPassengerInput[]
      | AssignmentUncheckedCreateWithoutPassengerInput[];
    connectOrCreate?:
      | AssignmentCreateOrConnectWithoutPassengerInput
      | AssignmentCreateOrConnectWithoutPassengerInput[];
    createMany?: AssignmentCreateManyPassengerInputEnvelope;
    connect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type AssignmentUpdateManyWithoutPassengerNestedInput = {
    create?:
      | XOR<
          AssignmentCreateWithoutPassengerInput,
          AssignmentUncheckedCreateWithoutPassengerInput
        >
      | AssignmentCreateWithoutPassengerInput[]
      | AssignmentUncheckedCreateWithoutPassengerInput[];
    connectOrCreate?:
      | AssignmentCreateOrConnectWithoutPassengerInput
      | AssignmentCreateOrConnectWithoutPassengerInput[];
    upsert?:
      | AssignmentUpsertWithWhereUniqueWithoutPassengerInput
      | AssignmentUpsertWithWhereUniqueWithoutPassengerInput[];
    createMany?: AssignmentCreateManyPassengerInputEnvelope;
    set?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    disconnect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    delete?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    connect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    update?:
      | AssignmentUpdateWithWhereUniqueWithoutPassengerInput
      | AssignmentUpdateWithWhereUniqueWithoutPassengerInput[];
    updateMany?:
      | AssignmentUpdateManyWithWhereWithoutPassengerInput
      | AssignmentUpdateManyWithWhereWithoutPassengerInput[];
    deleteMany?: AssignmentScalarWhereInput | AssignmentScalarWhereInput[];
  };

  export type AssignmentUncheckedUpdateManyWithoutPassengerNestedInput = {
    create?:
      | XOR<
          AssignmentCreateWithoutPassengerInput,
          AssignmentUncheckedCreateWithoutPassengerInput
        >
      | AssignmentCreateWithoutPassengerInput[]
      | AssignmentUncheckedCreateWithoutPassengerInput[];
    connectOrCreate?:
      | AssignmentCreateOrConnectWithoutPassengerInput
      | AssignmentCreateOrConnectWithoutPassengerInput[];
    upsert?:
      | AssignmentUpsertWithWhereUniqueWithoutPassengerInput
      | AssignmentUpsertWithWhereUniqueWithoutPassengerInput[];
    createMany?: AssignmentCreateManyPassengerInputEnvelope;
    set?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    disconnect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    delete?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    connect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    update?:
      | AssignmentUpdateWithWhereUniqueWithoutPassengerInput
      | AssignmentUpdateWithWhereUniqueWithoutPassengerInput[];
    updateMany?:
      | AssignmentUpdateManyWithWhereWithoutPassengerInput
      | AssignmentUpdateManyWithWhereWithoutPassengerInput[];
    deleteMany?: AssignmentScalarWhereInput | AssignmentScalarWhereInput[];
  };

  export type AssignmentCreateNestedManyWithoutDriverInput = {
    create?:
      | XOR<
          AssignmentCreateWithoutDriverInput,
          AssignmentUncheckedCreateWithoutDriverInput
        >
      | AssignmentCreateWithoutDriverInput[]
      | AssignmentUncheckedCreateWithoutDriverInput[];
    connectOrCreate?:
      | AssignmentCreateOrConnectWithoutDriverInput
      | AssignmentCreateOrConnectWithoutDriverInput[];
    createMany?: AssignmentCreateManyDriverInputEnvelope;
    connect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
  };

  export type AssignmentUncheckedCreateNestedManyWithoutDriverInput = {
    create?:
      | XOR<
          AssignmentCreateWithoutDriverInput,
          AssignmentUncheckedCreateWithoutDriverInput
        >
      | AssignmentCreateWithoutDriverInput[]
      | AssignmentUncheckedCreateWithoutDriverInput[];
    connectOrCreate?:
      | AssignmentCreateOrConnectWithoutDriverInput
      | AssignmentCreateOrConnectWithoutDriverInput[];
    createMany?: AssignmentCreateManyDriverInputEnvelope;
    connect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
  };

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type AssignmentUpdateManyWithoutDriverNestedInput = {
    create?:
      | XOR<
          AssignmentCreateWithoutDriverInput,
          AssignmentUncheckedCreateWithoutDriverInput
        >
      | AssignmentCreateWithoutDriverInput[]
      | AssignmentUncheckedCreateWithoutDriverInput[];
    connectOrCreate?:
      | AssignmentCreateOrConnectWithoutDriverInput
      | AssignmentCreateOrConnectWithoutDriverInput[];
    upsert?:
      | AssignmentUpsertWithWhereUniqueWithoutDriverInput
      | AssignmentUpsertWithWhereUniqueWithoutDriverInput[];
    createMany?: AssignmentCreateManyDriverInputEnvelope;
    set?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    disconnect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    delete?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    connect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    update?:
      | AssignmentUpdateWithWhereUniqueWithoutDriverInput
      | AssignmentUpdateWithWhereUniqueWithoutDriverInput[];
    updateMany?:
      | AssignmentUpdateManyWithWhereWithoutDriverInput
      | AssignmentUpdateManyWithWhereWithoutDriverInput[];
    deleteMany?: AssignmentScalarWhereInput | AssignmentScalarWhereInput[];
  };

  export type AssignmentUncheckedUpdateManyWithoutDriverNestedInput = {
    create?:
      | XOR<
          AssignmentCreateWithoutDriverInput,
          AssignmentUncheckedCreateWithoutDriverInput
        >
      | AssignmentCreateWithoutDriverInput[]
      | AssignmentUncheckedCreateWithoutDriverInput[];
    connectOrCreate?:
      | AssignmentCreateOrConnectWithoutDriverInput
      | AssignmentCreateOrConnectWithoutDriverInput[];
    upsert?:
      | AssignmentUpsertWithWhereUniqueWithoutDriverInput
      | AssignmentUpsertWithWhereUniqueWithoutDriverInput[];
    createMany?: AssignmentCreateManyDriverInputEnvelope;
    set?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    disconnect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    delete?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    connect?: AssignmentWhereUniqueInput | AssignmentWhereUniqueInput[];
    update?:
      | AssignmentUpdateWithWhereUniqueWithoutDriverInput
      | AssignmentUpdateWithWhereUniqueWithoutDriverInput[];
    updateMany?:
      | AssignmentUpdateManyWithWhereWithoutDriverInput
      | AssignmentUpdateManyWithWhereWithoutDriverInput[];
    deleteMany?: AssignmentScalarWhereInput | AssignmentScalarWhereInput[];
  };

  export type DriverCreateNestedOneWithoutAssignmentsInput = {
    create?: XOR<
      DriverCreateWithoutAssignmentsInput,
      DriverUncheckedCreateWithoutAssignmentsInput
    >;
    connectOrCreate?: DriverCreateOrConnectWithoutAssignmentsInput;
    connect?: DriverWhereUniqueInput;
  };

  export type PassengerCreateNestedOneWithoutAssignmentsInput = {
    create?: XOR<
      PassengerCreateWithoutAssignmentsInput,
      PassengerUncheckedCreateWithoutAssignmentsInput
    >;
    connectOrCreate?: PassengerCreateOrConnectWithoutAssignmentsInput;
    connect?: PassengerWhereUniqueInput;
  };

  export type DriverUpdateOneRequiredWithoutAssignmentsNestedInput = {
    create?: XOR<
      DriverCreateWithoutAssignmentsInput,
      DriverUncheckedCreateWithoutAssignmentsInput
    >;
    connectOrCreate?: DriverCreateOrConnectWithoutAssignmentsInput;
    upsert?: DriverUpsertWithoutAssignmentsInput;
    connect?: DriverWhereUniqueInput;
    update?: XOR<
      XOR<
        DriverUpdateToOneWithWhereWithoutAssignmentsInput,
        DriverUpdateWithoutAssignmentsInput
      >,
      DriverUncheckedUpdateWithoutAssignmentsInput
    >;
  };

  export type PassengerUpdateOneRequiredWithoutAssignmentsNestedInput = {
    create?: XOR<
      PassengerCreateWithoutAssignmentsInput,
      PassengerUncheckedCreateWithoutAssignmentsInput
    >;
    connectOrCreate?: PassengerCreateOrConnectWithoutAssignmentsInput;
    upsert?: PassengerUpsertWithoutAssignmentsInput;
    connect?: PassengerWhereUniqueInput;
    update?: XOR<
      XOR<
        PassengerUpdateToOneWithWhereWithoutAssignmentsInput,
        PassengerUpdateWithoutAssignmentsInput
      >,
      PassengerUncheckedUpdateWithoutAssignmentsInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
      in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
      notIn?:
        | Date[]
        | string[]
        | ListDateTimeFieldRefInput<$PrismaModel>
        | null;
      lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      not?:
        | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
        | Date
        | string
        | null;
      _count?: NestedIntNullableFilter<$PrismaModel>;
      _min?: NestedDateTimeNullableFilter<$PrismaModel>;
      _max?: NestedDateTimeNullableFilter<$PrismaModel>;
    };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedFloatNullableFilter<$PrismaModel>;
    _min?: NestedFloatNullableFilter<$PrismaModel>;
    _max?: NestedFloatNullableFilter<$PrismaModel>;
  };

  export type AssignmentCreateWithoutPassengerInput = {
    id?: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
    driver: DriverCreateNestedOneWithoutAssignmentsInput;
  };

  export type AssignmentUncheckedCreateWithoutPassengerInput = {
    id?: string;
    driverId: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
  };

  export type AssignmentCreateOrConnectWithoutPassengerInput = {
    where: AssignmentWhereUniqueInput;
    create: XOR<
      AssignmentCreateWithoutPassengerInput,
      AssignmentUncheckedCreateWithoutPassengerInput
    >;
  };

  export type AssignmentCreateManyPassengerInputEnvelope = {
    data:
      | AssignmentCreateManyPassengerInput
      | AssignmentCreateManyPassengerInput[];
    skipDuplicates?: boolean;
  };

  export type AssignmentUpsertWithWhereUniqueWithoutPassengerInput = {
    where: AssignmentWhereUniqueInput;
    update: XOR<
      AssignmentUpdateWithoutPassengerInput,
      AssignmentUncheckedUpdateWithoutPassengerInput
    >;
    create: XOR<
      AssignmentCreateWithoutPassengerInput,
      AssignmentUncheckedCreateWithoutPassengerInput
    >;
  };

  export type AssignmentUpdateWithWhereUniqueWithoutPassengerInput = {
    where: AssignmentWhereUniqueInput;
    data: XOR<
      AssignmentUpdateWithoutPassengerInput,
      AssignmentUncheckedUpdateWithoutPassengerInput
    >;
  };

  export type AssignmentUpdateManyWithWhereWithoutPassengerInput = {
    where: AssignmentScalarWhereInput;
    data: XOR<
      AssignmentUpdateManyMutationInput,
      AssignmentUncheckedUpdateManyWithoutPassengerInput
    >;
  };

  export type AssignmentScalarWhereInput = {
    AND?: AssignmentScalarWhereInput | AssignmentScalarWhereInput[];
    OR?: AssignmentScalarWhereInput[];
    NOT?: AssignmentScalarWhereInput | AssignmentScalarWhereInput[];
    id?: StringFilter<'Assignment'> | string;
    driverId?: StringFilter<'Assignment'> | string;
    passengerId?: StringFilter<'Assignment'> | string;
    assignedAt?: DateTimeFilter<'Assignment'> | Date | string;
    completedAt?: DateTimeNullableFilter<'Assignment'> | Date | string | null;
  };

  export type AssignmentCreateWithoutDriverInput = {
    id?: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
    passenger: PassengerCreateNestedOneWithoutAssignmentsInput;
  };

  export type AssignmentUncheckedCreateWithoutDriverInput = {
    id?: string;
    passengerId: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
  };

  export type AssignmentCreateOrConnectWithoutDriverInput = {
    where: AssignmentWhereUniqueInput;
    create: XOR<
      AssignmentCreateWithoutDriverInput,
      AssignmentUncheckedCreateWithoutDriverInput
    >;
  };

  export type AssignmentCreateManyDriverInputEnvelope = {
    data: AssignmentCreateManyDriverInput | AssignmentCreateManyDriverInput[];
    skipDuplicates?: boolean;
  };

  export type AssignmentUpsertWithWhereUniqueWithoutDriverInput = {
    where: AssignmentWhereUniqueInput;
    update: XOR<
      AssignmentUpdateWithoutDriverInput,
      AssignmentUncheckedUpdateWithoutDriverInput
    >;
    create: XOR<
      AssignmentCreateWithoutDriverInput,
      AssignmentUncheckedCreateWithoutDriverInput
    >;
  };

  export type AssignmentUpdateWithWhereUniqueWithoutDriverInput = {
    where: AssignmentWhereUniqueInput;
    data: XOR<
      AssignmentUpdateWithoutDriverInput,
      AssignmentUncheckedUpdateWithoutDriverInput
    >;
  };

  export type AssignmentUpdateManyWithWhereWithoutDriverInput = {
    where: AssignmentScalarWhereInput;
    data: XOR<
      AssignmentUpdateManyMutationInput,
      AssignmentUncheckedUpdateManyWithoutDriverInput
    >;
  };

  export type DriverCreateWithoutAssignmentsInput = {
    id?: string;
    name: string;
    phone: string;
    licenseNumber?: string | null;
    vehicleType?: string | null;
    plateNumber?: string | null;
    isAvailable?: boolean;
    homeBaseLat?: number | null;
    homeBaseLng?: number | null;
    lastKnownLat?: number | null;
    lastKnownLng?: number | null;
    lastUpdated?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DriverUncheckedCreateWithoutAssignmentsInput = {
    id?: string;
    name: string;
    phone: string;
    licenseNumber?: string | null;
    vehicleType?: string | null;
    plateNumber?: string | null;
    isAvailable?: boolean;
    homeBaseLat?: number | null;
    homeBaseLng?: number | null;
    lastKnownLat?: number | null;
    lastKnownLng?: number | null;
    lastUpdated?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DriverCreateOrConnectWithoutAssignmentsInput = {
    where: DriverWhereUniqueInput;
    create: XOR<
      DriverCreateWithoutAssignmentsInput,
      DriverUncheckedCreateWithoutAssignmentsInput
    >;
  };

  export type PassengerCreateWithoutAssignmentsInput = {
    id?: string;
    name: string;
    isDirect: boolean;
    estimatedDurationMin?: number | null;
    earliestPickupTime?: Date | string | null;
    latestPickupTime?: Date | string | null;
    earliestDropoffTime?: Date | string | null;
    latestDropoffTime?: Date | string | null;
    pickupStreetNumber?: string | null;
    pickupStreet?: string | null;
    pickupCity?: string | null;
    pickupZip?: string | null;
    dropoffStreetNumber?: string | null;
    dropoffStreet?: string | null;
    dropoffCity?: string | null;
    dropoffZip?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PassengerUncheckedCreateWithoutAssignmentsInput = {
    id?: string;
    name: string;
    isDirect: boolean;
    estimatedDurationMin?: number | null;
    earliestPickupTime?: Date | string | null;
    latestPickupTime?: Date | string | null;
    earliestDropoffTime?: Date | string | null;
    latestDropoffTime?: Date | string | null;
    pickupStreetNumber?: string | null;
    pickupStreet?: string | null;
    pickupCity?: string | null;
    pickupZip?: string | null;
    dropoffStreetNumber?: string | null;
    dropoffStreet?: string | null;
    dropoffCity?: string | null;
    dropoffZip?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PassengerCreateOrConnectWithoutAssignmentsInput = {
    where: PassengerWhereUniqueInput;
    create: XOR<
      PassengerCreateWithoutAssignmentsInput,
      PassengerUncheckedCreateWithoutAssignmentsInput
    >;
  };

  export type DriverUpsertWithoutAssignmentsInput = {
    update: XOR<
      DriverUpdateWithoutAssignmentsInput,
      DriverUncheckedUpdateWithoutAssignmentsInput
    >;
    create: XOR<
      DriverCreateWithoutAssignmentsInput,
      DriverUncheckedCreateWithoutAssignmentsInput
    >;
    where?: DriverWhereInput;
  };

  export type DriverUpdateToOneWithWhereWithoutAssignmentsInput = {
    where?: DriverWhereInput;
    data: XOR<
      DriverUpdateWithoutAssignmentsInput,
      DriverUncheckedUpdateWithoutAssignmentsInput
    >;
  };

  export type DriverUpdateWithoutAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    phone?: StringFieldUpdateOperationsInput | string;
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    vehicleType?: NullableStringFieldUpdateOperationsInput | string | null;
    plateNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    isAvailable?: BoolFieldUpdateOperationsInput | boolean;
    homeBaseLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    homeBaseLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastUpdated?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DriverUncheckedUpdateWithoutAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    phone?: StringFieldUpdateOperationsInput | string;
    licenseNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    vehicleType?: NullableStringFieldUpdateOperationsInput | string | null;
    plateNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    isAvailable?: BoolFieldUpdateOperationsInput | boolean;
    homeBaseLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    homeBaseLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLat?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastKnownLng?: NullableFloatFieldUpdateOperationsInput | number | null;
    lastUpdated?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PassengerUpsertWithoutAssignmentsInput = {
    update: XOR<
      PassengerUpdateWithoutAssignmentsInput,
      PassengerUncheckedUpdateWithoutAssignmentsInput
    >;
    create: XOR<
      PassengerCreateWithoutAssignmentsInput,
      PassengerUncheckedCreateWithoutAssignmentsInput
    >;
    where?: PassengerWhereInput;
  };

  export type PassengerUpdateToOneWithWhereWithoutAssignmentsInput = {
    where?: PassengerWhereInput;
    data: XOR<
      PassengerUpdateWithoutAssignmentsInput,
      PassengerUncheckedUpdateWithoutAssignmentsInput
    >;
  };

  export type PassengerUpdateWithoutAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    isDirect?: BoolFieldUpdateOperationsInput | boolean;
    estimatedDurationMin?:
      | NullableIntFieldUpdateOperationsInput
      | number
      | null;
    earliestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    earliestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    pickupStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    pickupStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupCity?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupZip?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    dropoffStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffCity?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffZip?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PassengerUncheckedUpdateWithoutAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    isDirect?: BoolFieldUpdateOperationsInput | boolean;
    estimatedDurationMin?:
      | NullableIntFieldUpdateOperationsInput
      | number
      | null;
    earliestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestPickupTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    earliestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    latestDropoffTime?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    pickupStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    pickupStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupCity?: NullableStringFieldUpdateOperationsInput | string | null;
    pickupZip?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffStreetNumber?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    dropoffStreet?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffCity?: NullableStringFieldUpdateOperationsInput | string | null;
    dropoffZip?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AssignmentCreateManyPassengerInput = {
    id?: string;
    driverId: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
  };

  export type AssignmentUpdateWithoutPassengerInput = {
    id?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    driver?: DriverUpdateOneRequiredWithoutAssignmentsNestedInput;
  };

  export type AssignmentUncheckedUpdateWithoutPassengerInput = {
    id?: StringFieldUpdateOperationsInput | string;
    driverId?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type AssignmentUncheckedUpdateManyWithoutPassengerInput = {
    id?: StringFieldUpdateOperationsInput | string;
    driverId?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type AssignmentCreateManyDriverInput = {
    id?: string;
    passengerId: string;
    assignedAt?: Date | string;
    completedAt?: Date | string | null;
  };

  export type AssignmentUpdateWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    passenger?: PassengerUpdateOneRequiredWithoutAssignmentsNestedInput;
  };

  export type AssignmentUncheckedUpdateWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string;
    passengerId?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type AssignmentUncheckedUpdateManyWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string;
    passengerId?: StringFieldUpdateOperationsInput | string;
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
