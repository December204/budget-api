# API — SKILLS.md

Hướng dẫn thêm từng loại thành phần mới vào dự án, dựa trên patterns hiện có.

---

## 1. Thêm REST Endpoint

**1. Tạo request type** trong `src/rests/types/`:

```typescript
// src/rests/types/CreateExpenseReq.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateExpenseReq {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  amount: number;
}
```

**2. Tạo hoặc thêm method vào controller** trong `src/rests/controllers/`:

```typescript
// src/rests/controllers/ExpenseController.ts
import { Body, Get, JsonController, Post, QueryParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import winston from 'winston';
import { Logger } from '@Decorators/Logger';
import { ExpenseService } from '@Services/ExpenseService';
import { CreateExpenseReq } from '@Rests/types/CreateExpenseReq';

@Service()
@JsonController('/expenses')
@OpenAPI({ security: [{ BearerToken: [] }] })
export class ExpenseController {
  constructor(
    @Logger(module) private readonly logger: winston.Logger,
    private expenseService: ExpenseService,
  ) {}

  @Get('/')
  async list(@QueryParam('page') page: number) {
    return this.expenseService.list(page);
  }

  @Post('/')
  async create(@Body() body: CreateExpenseReq) {
    return this.expenseService.create(body);
  }
}
```

> Controller được tự động load qua glob `rests/controllers/*Controller.{ts,js}` — không cần đăng ký thủ công.

---

## 2. Thêm GraphQL Resolver

**1. Tạo resolver** trong `src/resolvers/`:

```typescript
// src/resolvers/ExpenseResolver.ts
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import winston from 'winston';
import { Logger } from '@Decorators/Logger';
import { ExpenseService } from '@Services/ExpenseService';

@Service()
@Resolver()
export class ExpenseResolver {
  constructor(
    @Logger(module) private readonly logger: winston.Logger,
    private readonly expenseService: ExpenseService,
  ) {}

  @Query(returns => String)
  async expense(@Arg('id') id: string) {
    return this.expenseService.findById(id);
  }

  @Mutation(returns => String)
  async createExpense(@Arg('name') name: string) {
    return this.expenseService.create({ name });
  }
}
```

> Resolver được tự động load qua glob trong `GraphqlProvider` — không cần đăng ký thủ công.

**Dùng DataLoader** cho N+1 query:

```typescript
constructor(
  @DLoader<ExpenseService, any, any>(ExpenseService, {
    key: '_id',
    method: 'findByIds',  // method phải tồn tại trong ExpenseService
    multiple: false,
  }) private expenseLoader: DataLoader<string, any, any>,
) {}
```

---

## 3. Thêm MongoDB Model

```typescript
// src/databases/mongodb/models/Expense.ts
import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions, Severity } from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'expenses',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Expense {
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true })
  name: string;

  @Field()
  @Property({ required: true })
  amount: number;

  @Field()
  @Property({ default: new Date(), required: true })
  createdAt: Date;

  @Field()
  @Property({ default: new Date(), required: true })
  updatedAt: Date;
}
```

**Đăng ký model** trong `src/databases/mongodb/models/models.ts`:

```typescript
export const ExpenseModel = getModelForClass(Expense);
```

---

## 4. Thêm Repository (MongoDB)

Extend `BaseRepository` để kế thừa sẵn: `create`, `findById`, `findByFilters`, `findByFiltersAndPagination`, `countByFilters`, `bulkWrite`.

```typescript
// src/repositories/ExpenseRepository.ts
import { Service } from 'typedi';
import winston from 'winston';
import { Logger } from '@Decorators/Logger';
import { ExpenseModel } from '@Models/models';
import { Expense } from '@Models/Expense';
import { BaseRepository } from './BaseRepository';

@Service()
export class ExpenseRepository extends BaseRepository<typeof Expense, Partial<Expense>> {
  constructor(@Logger(module) private logger: winston.Logger) {
    super();
  }

  getModel() {
    return ExpenseModel;
  }

  async findByUser(userId: string) {
    return ExpenseModel.find({ userId });
  }
}
```

---

## 5. Thêm Service

```typescript
// src/services/ExpenseService.ts
import { Inject, Service } from 'typedi';
import Redis from 'ioredis';
import winston from 'winston';
import { Logger } from '@Decorators/Logger';
import { ExpenseRepository } from '@Repositories/ExpenseRepository';

@Service()
export class ExpenseService {
  constructor(
    @Logger(module) private readonly logger: winston.Logger,
    @Inject('cache') private readonly cache: Redis.Redis,
    private readonly expenseRepo: ExpenseRepository,
  ) {}

  async list(page = 1) {
    return this.expenseRepo.findByFiltersAndPagination({}, (page - 1) * 10, 10, 'createdAt', -1);
  }

  async create(data: { name: string; amount?: number }) {
    return this.expenseRepo.create(data);
  }
}
```

---

## 6. Thêm Error Code

```typescript
// src/errors/ErrorCode.ts
export enum ErrorCode {
  PATTERN_CODE = '{0} is {1}',
  NON_PATTERN_CODE = 'NON_PATTERN_CODE',
  EXPENSE_NOT_FOUND = 'Expense {0} not found',   // thêm tại đây
}
```

Throw error:

```typescript
import { BusinessLogicError } from '@Errors/BusinessLogicError';
import { ErrorCode } from '@Errors/ErrorCode';

throw new BusinessLogicError(ErrorCode.EXPENSE_NOT_FOUND, expenseId);
```

---

## 7. Thêm Bull Job

```typescript
// src/jobs/SendNotificationJob.ts
import { Inject, Service } from 'typedi';
import Redis from 'ioredis';
import winston from 'winston';
import { Job } from 'bull';
import { Logger } from '@Decorators/Logger';
import { QueueWorker } from '@Decorators/QueueWorker';
import Queueable from '@Libs/queue/Queueable';

interface Payload {
  userId: string;
  message: string;
}

@Service()
@QueueWorker()
export class SendNotificationJob extends Queueable<Payload> {
  constructor(@Logger(module) logger: winston.Logger, @Inject('cache') cache: Redis.Redis) {
    super(logger, cache);
  }

  public queueName(): string {
    return 'SendNotificationJob';
  }

  public async processHandler(job: Job<Payload>): Promise<void> {
    this.logger.info('Processing notification', job.data);
    // logic xử lý
  }
}
```

Bật `JobsProvider` trong `src/libs/Kernel.ts` để jobs được load.

---

## 8. Thêm Provider

```typescript
// src/providers/MyProvider.ts
import { Service } from 'typedi';
import winston from 'winston';
import { Logger } from '@Decorators/Logger';
import ServiceProvider from '@Libs/provider/ServiceProvider';

@Service()
export default class MyProvider extends ServiceProvider {
  constructor(@Logger(module) private readonly logger: winston.Logger) {
    super();
  }

  async register(): Promise<void> {
    // khởi tạo kết nối, set vào Container
  }

  async boot(): Promise<void> {
    // logic sau khi tất cả provider đã register
  }

  async close(): Promise<void> {
    // đóng kết nối khi shutdown
  }
}
```

Đăng ký vào `src/libs/Kernel.ts`:

```typescript
public static providers = [
  BootstrapProvider,
  CacheProvider,
  MyProvider,   // thêm đây, thứ tự = thứ tự boot
  HttpProvider,
];
```

---

## 9. Thêm Migration MongoDB

```bash
yarn migrate-add <tên-migration>   # tạo file migration mới
yarn migrate-up                    # chạy migration
yarn migrate-down                  # rollback migration
```
