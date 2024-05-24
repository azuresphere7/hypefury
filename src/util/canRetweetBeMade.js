import {getCustomerStatus} from "./getCustomerStatus";

export function canRetweetBeMade(retweetInfo, userProfile) {
  const customerStatus = getCustomerStatus(userProfile);
  const areUsersTheSame = () => {
    if (retweetInfo.userTwitterId)
      return retweetInfo.userTwitterId === userProfile.twitterId;
    else
      return retweetInfo.username === userProfile.username;
  };
  return !(customerStatus === 'standard' && !areUsersTheSame());
}
