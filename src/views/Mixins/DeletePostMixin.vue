<template>
<div></div>
</template>

<script>
  import swal from 'sweetalert2';

  export default {
    methods: {
      deleteThread(thread) {
        const action = this.$route.meta.id === 'history' || this.$route.meta.id === 'evergreen_posts' ?
          'unretweet this tweet' :
          'unschedule this post';

        swal({
          text: `Are you sure you want to ${action}?`,
          type: 'warning',
          showCloseButton: true,
          focusConfirm: false,
          confirmButtonText: 'Yes',
          preConfirm: () => {
            thread.deleteFromFirestore()
              .catch(error => {
                swal('', 'An error has occurred while deleting the post.', 'error');
                console.error(error);
              });
          }
        })
      }
    },
  };
</script>
