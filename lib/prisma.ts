import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const makeUnavailableProxy = (message: string) => {
  const handler: ProxyHandler<any> = {
    get() {
      throw new Error(message);
    },
    apply() {
      throw new Error(message);
    },
    construct() {
      throw new Error(message);
    },
  };
  const stub = function () {
    throw new Error(message);
  };
  return new Proxy(stub, handler) as unknown as ReturnType<
    typeof prismaClientSingleton
  >;
};

let prisma: ReturnType<typeof prismaClientSingleton>;

if (!process.env.DATABASE_URL) {
  prisma = makeUnavailableProxy(
    "process.env.DATABASE_URL is not set. Prisma client is unavailable."
  );
} else {
  prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
  if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
}

export default prisma;
