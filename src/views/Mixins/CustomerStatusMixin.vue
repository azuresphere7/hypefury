<template>

</template>

<script>
  import {getCustomerStatus} from '@/util/getCustomerStatus';

  export default {
    name: 'customer-status-mixin',
    computed: {
      customerStatus() {
        return getCustomerStatus(this.userProfile);
      },
    },
  }
</script>

<style scoped>

</style>
