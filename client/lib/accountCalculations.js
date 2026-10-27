import { Income, Expense, FundTransfer } from './models.js';

/**
 * Calculates current ledger balance for an account:
 * Balance = Opening + Recognized Income (Received) + Transfers IN (Completed) - Recognized Expenses (Paid) - Transfers OUT (Completed)
 */
export async function calculateAccountLiveBalance(accountId, openingBalance = 0) {
  try {
    const [incSum, expSum, trfInSum, trfOutSum] = await Promise.all([
      Income.aggregate([
        { $match: { bankAccountId: accountId, status: 'Received' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { bankAccountId: accountId, status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      FundTransfer.aggregate([
        { $match: { toAccountId: accountId, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      FundTransfer.aggregate([
        { $match: { fromAccountId: accountId, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const income = incSum[0]?.total || 0;
    const expense = expSum[0]?.total || 0;
    const transferIn = trfInSum[0]?.total || 0;
    const transferOut = trfOutSum[0]?.total || 0;

    return Number(openingBalance || 0) + income + transferIn - expense - transferOut;
  } catch (e) {
    return Number(openingBalance || 0);
  }
}
