<template>
  <div class="app-copy">
    <span class="copy-content">
      <slot>
        {{ content }}
      </slot>
    </span>
    <button class="copy-btn" @click="handleCopy" title="copy" type="button">
      <i class="el-icon-copy-document copy-icon" />
    </button>
  </div>
</template>

<script>
export default {
  props: {
    content: {
      type: [String, Number, Boolean]
    }
  },
  methods: {
    async handleCopy () {
      navigator.clipboard.writeText(this.content)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-copy {
  display: inline-flex;

  .copy-content {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: inline-block;
  }

  .copy-btn {
    padding: 0 5px;
    opacity: 0;
    transition: all .4s ease;
  }

  &:hover {
    .copy-btn {
      opacity: 1;
    }
  }
}
</style>
