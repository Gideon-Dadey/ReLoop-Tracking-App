import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionType } from '../transactions/schemas/transaction.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AICoachService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getRecommendations(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return [];

    const lastTransactions = await this.transactionModel.find({ userId: new Types.ObjectId(userId) }).limit(20).sort({ createdAt: -1 });
    const recommendations: any[] = [];

    // 1. First Experience
    if (lastTransactions.length === 0) {
      recommendations.push({
        title: "Your Sustainable Journey",
        message: "Welcome to ReLoop! Every container you return saves approx. 0.05kg of plastic. Start by scanning a QR code at any partner vendor.",
        reward: "20 Points Bonus"
      });
    }

    // 2. Points Goal Analysis
    const nextRewardPoints = 500; // Let's assume a goal
    if (user.points < nextRewardPoints) {
      const remaining = nextRewardPoints - user.points;
      const returnsNeeded = Math.ceil(remaining / 10);
      recommendations.push({
        title: "Reward Near",
        message: `You're only ${returnsNeeded} more returns away from your next 500pts reward! Keep it up.`,
        value: `${user.points}/${nextRewardPoints} pts`
      });
    }

    // 3. Impact Analysis
    const totalPlastic = user.impact?.plasticSaved || 0;
    if (totalPlastic > 0) {
      recommendations.push({
        title: "Impact Milestone",
        message: `Incredible! You've saved ${totalPlastic.toFixed(2)}kg of plastic so far. That's equivalent to about ${Math.round(totalPlastic * 20)} single-use bottles prevented.`,
        impact: "GLOBAL"
      });
    }

    // 4. Return Habit Suggestion
    const issues = lastTransactions.filter(tx => tx.type === TransactionType.ISSUE);
    const returns = lastTransactions.filter(tx => tx.type === TransactionType.RETURN);
    if (issues.length > returns.length) {
      const pending = issues.length - returns.length;
      recommendations.push({
        title: "Clean Up",
        message: `You have ${pending} containers currently borrowed. Return them soon to clear your history and claim your impact points!`,
        action: "RETURN_SOON"
      });
    }

    // 5. General Sustainability Tip (Static but high value)
    if (recommendations.length < 3) {
      recommendations.push({
        title: "Did You Know?",
        message: "Using a single reusable cup for a year prevents 10kg of CO2 emissions. You're part of a movement of 10k+ citizens.",
        tip: "LIFESTYLE"
      });
    }

    return recommendations.slice(0, 3);
  }
}
