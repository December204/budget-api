# API — CLAUDE.md (BE Starter)

## Tech Stack

| Lớp | Công nghệ |
|---|---|
| Runtime | Node.js ≥ 20.12, TypeScript 5 (CommonJS, target ES2022) |
| HTTP | Express 4 + routing-controllers |
| GraphQL | Apollo Server 3, type-graphql, graphql-upload |
| ORM / ODM | Mongoose 6 + @typegoose/typegoose (MongoDB), TypeORM 0.3 (PostgreSQL) |
| Cơ sở dữ liệu | MongoDB 6, PostgreSQL, Redis 7 (ioredis) |
| Messaging | KafkaJS (tắt mặc định), Bull queue |
| Realtime | Socket.io 4 + @socket.io/redis-adapter |
| DI | TypeDI |
| Auth | JWT (RS256), Keycloak (@hikariq/alohomora) |
| Logging | Winston + ECS format |
| APM | Elastic APM Node |
| API Docs | Swagger UI + routing-controllers-openapi |
| Migration | migrate-mongo |
| Test | Mocha + Chai |
| Infra local | Docker Compose (MongoDB, PostgreSQL, Redis; Kafka có thể bật lại) |

## Cấu trúc thư mục

```
src/
  consumers/      # Kafka consumers
  databases/
    mongodb/models/
    postgres/entities/
  decorators/     # Custom decorators (@Logger, @DLoader, @QueueWorker …)
  enums/
  errors/
  interceptors/
  jobs/           # Bull jobs
  libs/           # Kernel, env, jwt, cache, graphql, kafka, …
  middlewares/
  providers/      # BootstrapProvider, HttpProvider, CacheProvider, …
  repositories/
  resolvers/      # GraphQL resolvers
  rests/          # REST controllers & request types
  services/
  sockets/
```

## Path Aliases (tsconfig)

| Alias | Thư mục |
|---|---|
| `@Decorators/*` | `src/decorators/*` |
| `@Libs/*` | `src/libs/*` |
| `@Providers/*` | `src/providers/*` |
| `@Services/*` | `src/services/*` |
| `@Repositories/*` | `src/repositories/*` |
| `@Models/*` | `src/databases/mongodb/models/*` |
| `@Entities/*` | `src/databases/postgres/entities/*` |
| `@Rests/*` | `src/rests/*` |
| `@Resolvers/*` | `src/resolvers/*` |
| `@Errors/*` | `src/errors/*` |
| `@Enums/*` | `src/enums/*` |
| `@Middlewares/*` | `src/middlewares/*` |
| `@Sockets/*` | `src/sockets/*` |

## Scripts quan trọng

```bash
yarn up-dev          # docker compose up + nodemon
yarn dev             # nodemon (hot-reload)
yarn build           # rimraf dist && tsc && tscpaths
yarn test            # mocha (*.test.ts trong tests/)
yarn migrate-up      # chạy migration MongoDB
yarn dc-up / dc-down # bật/tắt Docker services
```

## Quy tắc

- Mọi provider phải implement `register()` và `boot()` — đăng ký qua `Kernel.providers` trong `src/libs/Kernel.ts`.
- Bật/tắt tính năng bằng cách thêm/bỏ provider trong `Kernel.ts`, không xoá code provider.
- Dùng `@Service()` + TypeDI cho dependency injection — không khởi tạo service thủ công.
- REST controller đặt trong `src/rests/controllers/`, dùng decorators của routing-controllers.
- GraphQL resolver đặt trong `src/resolvers/`, dùng type-graphql decorators.
- Tất cả biến môi trường đọc qua `src/libs/env/index.ts`, không đọc `process.env` trực tiếp.
- Pre-commit hook chạy `eslint` + `build` — code phải pass trước khi commit.
- Không commit file `.env` — chỉ cập nhật `.env.example`.
- TypeScript: tránh `any`; khai báo type rõ tại module boundary.
- Comment chỉ khi lý do không tự hiển nhiên từ code.
