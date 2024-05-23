import moment from 'moment';
import 'moment-timezone';

class EmptySlot {
  constructor(time) {
    this.time = time;
    this.midnight = moment(time).startOf('day').toISOString();
  }

  isEmpty() {
    return true;
  }
}

export { EmptySlot };
