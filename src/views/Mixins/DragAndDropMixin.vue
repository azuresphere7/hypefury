<template>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    computed: {
      ...mapState(['userProfile', 'currentUser'])
    },
    name: 'drag-and-drop-mixin',
    methods: {
      dropEmptySlot(slot) {
        const newTime = slot.time;
        this.schedule.changeTimeOfThread(this.draggedThread, newTime);
        this.draggedThread.time = newTime;
        this.draggedThread.update(this.userProfile.timezone);
      },
      dropNonEmptySlot(slot) {
        const thread1 = slot;
        const thread2 = this.draggedThread;
        const time1 = thread1.time;
        const time2 = thread2.time;
        this.schedule.changeTimeOfThread(thread1, time2);
        this.schedule.changeTimeOfThread(thread2, time1);
        thread1.time = time2;
        thread2.time = time1;
        thread1.update(this.userProfile.timezone).then(thread2.update(this.userProfile.timezone));
      },
      dragEnd() {
        this.draggedThread = null;
      },
      dragLeaveEmptySlot(slot, event) {
        event.target.classList.add('bg-secondary');
        event.target.classList.remove('bg-transparent');
        event.target.classList.remove('drag-hovered-slot');
      },
      dragLeaveNonEmptySlot(slot, event) {
        event.target.classList.remove('drag-hovered-slot');
      },
      dragEnterEmptySlot(slot, event) {
        event.target.classList.remove('bg-secondary');
        event.target.classList.add('bg-transparent');
        event.target.classList.add('drag-hovered-slot');
      },
      dragEnterNonEmptySlot(slot, event) {
        if (slot !== this.draggedThread) {
          event.target.classList.add('drag-hovered-slot');
        }
      },
      dragOver(_, event) {
        event.preventDefault();
      },
      dragStart(thread) {
        this.draggedThread = thread;
      },
    },
    updated: function () {
      this.$nextTick(function () {
        const allSlots = this.$refs.slot;
        allSlots.map(s => {
          new window.Dragster(s)
        });
      });
    },
  }
</script>
