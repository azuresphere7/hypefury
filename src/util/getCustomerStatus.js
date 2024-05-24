import {trialPeriodCalculator} from './trialPeriodCalculator';

// Careful: used util.js in functions/
export function getCustomerStatus(user) {
  if (user.subscriptionStatus === 'active') {
    if (user.subscriptionTierName.toLowerCase().includes('premium')) {
      return 'premium';
    }
    if (user.subscriptionTierName.toLowerCase().includes('standard')) {
      return 'standard';
    }
  }

  if (user.subscriptionStatus === 'canceled') {
    return 'none';
  }

  if (trialPeriodCalculator(user).daysLeft === 0) {
    return 'none';
  } else {
    return 'trial';
  }
}
