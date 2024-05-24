const dao = {
  userProfile: {},
};

const firebase = require('@/firebase');

dao.userProfile.updateSchedule = (userId, schedule) => {
  return firebase.usersCollection
    .doc(userId)
    .update({schedule: schedule.getScheduleForDB()});
};

dao.userProfile.updateShouldSplitLongText = (userId, value) => {
  return firebase.usersCollection
    .doc(userId)
    .update({'settings.shouldSplitLongText': value});
};

export default dao;
