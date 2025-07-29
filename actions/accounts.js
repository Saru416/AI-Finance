"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (transaction) => {
  const serialized = { ...transaction };

  if (transaction.balance) {
    serialized.balance = transaction.balance.toNumber();
  }

  if (transaction.amount) {
    serialized.amount = transaction.amount.toNumber();
  }

  return serialized;
};

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: { id: accountId, userId: user.id },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    throw new Error(
      error.message || "An error occurred while updating the default account"
    );
  }
}

export async function getAccountWithTransaction(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }
    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    return {
      ...serializeTransaction(account),
      transactions: account.transactions.map(serializeTransaction),
    };
  } catch (error) {
    throw new Error(
      error.message || "An error occurred while fetching the account"
    );
  }
}

export async function bulkDeleteTransactions(transactionsIds) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionsIds },
        userId: user.id,
      },
    });

    const accountBalceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;

      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionsIds },
          userId: user.id,
        },
      });
    });

    for (const [accountId, balaceChange] of Object.entries(
      accountBalceChanges
    )) {
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: balaceChange,
          },
        },
      });
      revalidatePath("dashboard");
      revalidatePath("/account/[id]");

      return { success: true };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
