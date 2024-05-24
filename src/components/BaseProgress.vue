<template>
  <div class="wrapper">
    <div :class="`progress-${type}`" v-if="showLabel">
      <div class="progress-label">
        <slot name="label">
          <span :class="labelClasses">{{label}}</span>
        </slot>
      </div>
      <div class="progress-percentage">
        <slot>
          <span :class="valueClasses" v-if="forTrialPeriod && value === 0">Expired</span>
          <span :class="valueClasses" v-else>{{value}}{{unit}}</span>
        </slot>
      </div>
    </div>
    <div class="progress"
         :class="[{[`progress-${size}`]: size}, progressClasses]"
         :style="`height: ${height}px`">
      <div class="progress-bar"
           :class="computedClasses"
           role="progressbar"
           :aria-valuenow="value"
           aria-valuemin="0"
           aria-valuemax="100"
           :style="`width: ${percentage}%;`">
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: "base-progress",
    props: {
      forTrialPeriod: {
        type: Boolean,
        default: false,
      },
      striped: {
        type: Boolean,
        description: "Whether progress is striped"
      },
      animated: {
        type: Boolean,
        description:
          "Whether progress is animated (works only with `striped` prop together)"
      },
      label: {
        type: String,
        description: "Progress label (shown on the left above progress)"
      },
      labelClasses: {
        type: String,
      },
      height: {
        type: Number,
        default: 3,
        description: "Progress line height"
      },
      type: {
        type: String,
        default: "default",
        description: "Progress type (e.g danger, primary etc)"
      },
      showLabel: {
        type: Boolean,
        default: false
      },
      progressClasses: {
        type: [Array, String],
        default: '',
        description: 'Progress css classes'
      },
      size: {
        type: String,
        default: ''
      },
      value: {
        type: Number,
        default: 0,
        validator: value => {
          return value >= 0 && value <= 100;
        },
        description: "Progress value"
      },
      valueClasses: String,
      unit: {
        type: String,
        default: '%',
      },
      percentage: {
        type: String,
        default: () => this.unit,
      },
    },
    computed: {
      computedClasses() {
        return [
          { "progress-bar-striped": this.striped },
          { "progress-bar-animated": this.animated },
          { [`bg-${this.type}`]: this.type }
        ];
      }
    }
  };
</script>
<style>
</style>
