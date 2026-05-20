# Backend Developer Guide

> Node.js · TypeScript · Express · GraphQL · MongoDB · PostgreSQL

---

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

---

## Cấu trúc thư mục

```
src/
  consumers/        # Kafka consumers
  databases/
    mongodb/models/ # Typegoose model definitions
    postgres/entities/ # TypeORM entity definitions
  decorators/       # @Logger, @DLoader, @QueueWorker và custom decorators khác
  enums/            # Shared enum definitions
  errors/           # Custom error classes
  interceptors/     # Request/response interceptors
  jobs/             # Bull job definitions
  libs/             # Kernel, env, jwt, cache, graphql, kafka, và core libs khác
  middlewares/      # Express middlewares
  providers/        # BootstrapProvider, HttpProvider, CacheProvider, ...
  repositories/     # Data access layer
  resolvers/        # GraphQL resolvers (type-graphql)
  rests/            # REST controllers & request types
  services/         # Business logic layer
  sockets/          # Socket.io handlers
```

---

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

---

## Scripts quan trọng

| Script | Mô tả |
|---|---|
| `yarn up-dev` | docker compose up + nodemon |
| `yarn dev` | nodemon hot-reload only (không Docker) |
| `yarn build` | rimraf dist → tsc → tscpaths |
| `yarn test` | mocha — chạy `*.test.ts` trong `tests/` |
| `yarn migrate-up` | chạy pending MongoDB migrations |
| `yarn dc-up` | docker compose up (MongoDB · PostgreSQL · Redis) |
| `yarn dc-down` | docker compose down |

---

## Quy tắc

### Provider system

- Mọi provider phải implement `register()` và `boot()` — đăng ký qua `Kernel.providers` trong `src/libs/Kernel.ts`.
- Bật/tắt tính năng bằng cách thêm/bỏ provider trong `Kernel.ts`. **Không xoá code provider.**

### Dependency Injection

- Dùng `@Service()` + TypeDI cho tất cả service — không khởi tạo service thủ công bằng `new`.

### Controllers & Resolvers

- REST controller đặt trong `src/rests/controllers/`, dùng decorators của routing-controllers.
- GraphQL resolver đặt trong `src/resolvers/`, dùng type-graphql decorators.

### Environment Variables

- **Không đọc `process.env` trực tiếp** ở bất kỳ file nào.
- Tất cả env var phải đọc qua `src/libs/env/index.ts`.
- **Không commit `.env`** — chỉ cập nhật `.env.example`.

### TypeScript

- Tránh `any` — khai báo type rõ ràng tại module boundary.
- Import dùng path alias (`@Services/`, `@Models/`…), không dùng relative path dài.
- Comment chỉ khi lý do không tự hiển nhiên từ code.

### Pre-commit

- Pre-commit hook chạy `eslint` + `build` — code phải pass cả hai trước khi commit được chấp nhận.
- Nên chạy `yarn build` thủ công trước để debug nhanh hơn.

---

## Workflow: Tạo feature / module mới

### Bước 1 — Tạo branch từ develop

Luôn branch từ `develop`, không branch từ `main`.

```bash
# convention: feat/ fix/ chore/ refactor/ hotfix/
git checkout develop
git pull origin develop
git checkout -b feat/user-notification-service
```

### Bước 2 — Xác định loại file cần tạo

Căn cứ vào tính chất của feature:

| Loại | Thư mục |
|---|---|
| Service | `src/services/` |
| Repository | `src/repositories/` |
| Mongo Model | `src/databases/mongodb/models/` |
| PostgreSQL Entity | `src/databases/postgres/entities/` |
| REST Controller | `src/rests/controllers/` |
| GraphQL Resolver | `src/resolvers/` |
| Enum | `src/enums/` |
| Error | `src/errors/` |
| Bull Job | `src/jobs/` |
| Socket handler | `src/sockets/` |

### Bước 3 — Tạo Service

Dùng `@Service()` từ TypeDI. Inject dependency qua constructor — không `new` thủ công.

```typescript
// src/services/NotificationService.ts
import { Service } from 'typedi';
import { NotificationRepository } from '@Repositories/NotificationRepository';

@Service()
export class NotificationService {
  constructor(
    private notificationRepo: NotificationRepository,
  ) {}
}
```

### Bước 4 — Tạo Repository (nếu cần)

Wrap tất cả query DB trong repository. Service không gọi Model trực tiếp.

```typescript
// src/repositories/NotificationRepository.ts
import { Service } from 'typedi';
import { NotificationModel } from '@Models/Notification';

@Service()
export class NotificationRepository {
  async findByUserId(userId: string) {
    return NotificationModel.find({ userId });
  }
}
```

### Bước 5 — Tạo Controller hoặc Resolver

**REST:**

```typescript
// src/rests/controllers/NotificationController.ts
@JsonController('/notifications')
@Service()
export class NotificationController {
  constructor(private notificationSvc: NotificationService) {}

  @Get('/')
  @Authorized()
  async list(@CurrentUser() user: IUser) {
    return this.notificationSvc.listForUser(user.id);
  }
}
```

**GraphQL:**

```typescript
// src/resolvers/NotificationResolver.ts
@Resolver()
@Service()
export class NotificationResolver {
  constructor(private notificationSvc: NotificationService) {}

  @Query(() => [NotificationType])
  @Authorized()
  async notifications(@Ctx() ctx: IContext) {
    return this.notificationSvc.listForUser(ctx.user.id);
  }
}
```

### Bước 6 — Thêm env vars (nếu có)

Khai báo trong `src/libs/env/index.ts` và cập nhật `.env.example`. Không commit `.env`.

### Bước 7 — Thêm migration (nếu thay đổi schema MongoDB)

```bash
# tạo file migration
yarn migrate-create add-notification-collection

# chạy migration local
yarn migrate-up
```

### Bước 8 — Viết test

Test file đặt trong `tests/`, đặt tên `*.test.ts`. Chạy thử trước khi commit.

```bash
yarn test
```

### Bước 9 — Build và lint

```bash
yarn build
```

Build pass → commit được. Build fail → pre-commit hook sẽ block, fix trước khi thử lại.

### Bước 10 — Push và mở PR

```bash
git push origin feat/user-notification-service
```

---

## Workflow: Tạo Pull Request

### Target branch

- `feat/*` và `fix/*` → merge vào `develop`.
- `hotfix/*` → merge vào cả `main` và `develop`.
- **Không mở PR trực tiếp vào `main`** trừ khi là hotfix khẩn cấp.

### Tiêu đề PR

Format: `[type]: mô tả ngắn gọn`

```
feat: add user notification service
fix: resolve null pointer in auth middleware
chore: upgrade mongoose to 6.12
refactor: extract payment logic into service layer
hotfix: patch JWT expiry edge case
```

### Mô tả PR

Điền đủ 4 phần:

```
## What
Mô tả những gì đã thay đổi và tại sao.

## How
Cách tiếp cận, design decision đáng chú ý.

## Test
Cách đã test (unit test, manual, scenario cụ thể).

## Migration / Breaking change
Có migration không? Có breaking change không? Nếu không, ghi "None".
```

### Labels

Gắn label phù hợp: `feature`, `bugfix`, `hotfix`, `chore`, `refactor`, `breaking-change`, `needs-migration`.

### Rebase trước khi merge

Nếu `develop` đã có commit mới sau khi branch out:

```bash
git fetch origin
git rebase origin/develop
# giải conflict nếu có, rồi:
git push --force-with-lease
```

### Merge strategy

- Feature branch → **Squash and merge** (giữ history sạch).
- Hotfix → **Merge commit**.
- Sau khi merge: xoá branch remote. Không để branch rác tồn tại quá 3 ngày sau khi merged.
- PR cần ít nhất **1 approval** — không được tự merge.

---

## PR Checklist (self-review trước khi mở PR)

### Code quality

- [ ] Không còn `any` nào trong code mới — type rõ ràng tại module boundary
- [ ] Không `new ServiceXxx()` thủ công — dùng TypeDI `@Service()` và inject qua constructor
- [ ] Không đọc `process.env` trực tiếp — tất cả env var qua `src/libs/env/index.ts`
- [ ] Controller nằm đúng `src/rests/controllers/`, resolver đúng `src/resolvers/`
- [ ] Import dùng path alias (`@Services/`, `@Models/`…), không dùng relative path dài

### Build & test

- [ ] `yarn build` pass không lỗi
- [ ] `yarn test` pass — không có test nào bị skip hoặc fail
- [ ] ESLint không còn warning/error nào liên quan đến code mới

### Migration & config

- [ ] Nếu có thay đổi schema → đã tạo migration file và `yarn migrate-up` local thành công
- [ ] Nếu thêm env var mới → đã cập nhật `.env.example` (không commit `.env`)
- [ ] Nếu thêm provider mới → đã đăng ký trong `Kernel.ts`, không xoá provider code cũ

### PR metadata

- [ ] Tiêu đề PR theo format `[type]: mô tả`
- [ ] Description điền đủ What / How / Test / Breaking change