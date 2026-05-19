import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
    },
  });

  const expenseCategories = [
    { name: 'Food & Dining', color: '#FF6B6B', icon: '🍔' },
    { name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
    { name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
    { name: 'Entertainment', color: '#96CEB4', icon: '🎬' },
    { name: 'Bills & Utilities', color: '#FFEAA7', icon: '💡' },
    { name: 'Healthcare', color: '#DDA0DD', icon: '🏥' },
    { name: 'Education', color: '#98D8C8', icon: '📚' },
    { name: 'Other', color: '#B0B0B0', icon: '📦' },
  ];

  const incomeCategories = [
    { name: 'Salary', color: '#2ECC71', icon: '💰' },
    { name: 'Freelance', color: '#27AE60', icon: '💻' },
    { name: 'Investment', color: '#F39C12', icon: '📈' },
    { name: 'Other Income', color: '#95A5A6', icon: '💵' },
  ];

  for (const cat of expenseCategories) {
    await prisma.category.upsert({
      where: {
        // No unique constraint on name+userId, so use create pattern
        id: `seed-expense-${cat.name.toLowerCase().replace(/\s+/g, '-')}-${user.id}`,
      },
      update: {},
      create: {
        id: `seed-expense-${cat.name.toLowerCase().replace(/\s+/g, '-')}-${user.id}`,
        name: cat.name,
        type: TransactionType.expense,
        color: cat.color,
        icon: cat.icon,
        userId: user.id,
      },
    });
  }

  for (const cat of incomeCategories) {
    await prisma.category.upsert({
      where: {
        id: `seed-income-${cat.name.toLowerCase().replace(/\s+/g, '-')}-${user.id}`,
      },
      update: {},
      create: {
        id: `seed-income-${cat.name.toLowerCase().replace(/\s+/g, '-')}-${user.id}`,
        name: cat.name,
        type: TransactionType.income,
        color: cat.color,
        icon: cat.icon,
        userId: user.id,
      },
    });
  }

  console.log(`Seeded user: ${user.email}`);
  console.log(`Seeded ${expenseCategories.length} expense categories`);
  console.log(`Seeded ${incomeCategories.length} income categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
