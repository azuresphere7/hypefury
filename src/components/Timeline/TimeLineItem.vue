<template>
  <div class="timeline-block" :class="{ 'timeline-inverted': inverted }">
    <slot name="badge">
      <span class="timeline-step" :class="`badge-${badgeType}`">
        <i :class="badgeIcon">{{ title }}</i>
      </span>
    </slot>
    <div class="timeline-content" :class="additionalClasses">
      <slot></slot>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'time-line-item',
    props: {
      inverted: Boolean,
      title: String,
      badgeType: {
        type: String,
        default: 'success'
      },
      badgeIcon: {
        type: String,
        default: ''
      },
      additionalClasses: {
        type: String,
        default: ''
      }
    }
  };
</script>
<style></style>
