<template>
  <div class="pagination-card">
    <template v-if="data && data.length">
      <el-row
        type="flex"
        justify="center"
        :gutter="20"
      >
        <el-col
          v-for="(item, index) in data"
          :key="item.id"
          :span="24"
        >
          <slot :item="item" :index="index">
          </slot>
        </el-col>
      </el-row>
      <el-pagination
        v-if="showPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-size="pageSize"
        :total="total"
        :current-page.sync="currentPage"
        :layout="layout"
        :page-sizes="pageSizes"
      />
    </template>
    <template v-else>
      <slot name="empty">
        <div class="empty">
          暂无数据
        </div>
      </slot>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    sizeChange: {
      type: Function,
      default: () => true
    },
    currentChange: {
      type: Function,
      default: () => true
    },
    layout: {
      type: String,
      default: '->, prev, pager, next, sizes, total'
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 40]
    },
    defaultPage: {
      type: Number,
      default: 1
    },
    defaultPageSize: {
      type: Number,
      default: 10
    },
    showPage: {
      type: Boolean,
      default: true
    },
    remote: {
      type: Boolean,
      default: false
    },
    count: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      currentPage: this.defaultPage,
      pageSize: this.defaultPageSize || this.pageSizes[0],
      selected: []
    }
  },
  computed: {
    filterData () {
      let data = []
      if (this.remote) {
        data = this.data
      } else {
        const begin = this.pageSize * (this.currentPage - 1)
        data = this.data.slice(begin, begin + this.pageSize)
      }
      return data
    },
    total () {
      return this.remote ? this.count : this.data.length
    },
    style () {
      const css = {
        height: '100%',
        maxHeight: '100%'
      }
      if (this.showPage) {
        css.height = 'calc(100% - 35px)'
        css.maxHeight = 'calc(100% - 35px)'
      }
      return css
    }
  },
  methods: {
    handleSizeChange (size) {
      if (this.sizeChange(size)) {
        this.pageSize = size
      }
    },
    handleCurrentChange (currentPage) {
      if (this.currentChange(currentPage)) {
        this.currentPage = currentPage
      }
    },
    handleSelectionChange (selection) {
      this.selected = [...selection]
      this.$emit('selection-change', selection)
    },
    handleTableFilter (filters) {
      this.$emit('filter-change', filters)
    },
    handleTableSort (data) {
      this.$emit('sort-change', data)
    },
    handleRowClick (row, column, event) {
      this.$emit('row-click', row, column, event)
    }
  },
  watch: {
    defaultPage (val) {
      this.currentPage = val
    },
    defaultPageSize (val) {
      this.pageSize = val
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  .el-row {
    flex: 1;
    overflow: auto;

    .el-col:last-child {
      padding-bottom: 0;
    }
  }

  .el-pagination {
    margin-top: 20px;
  }

  .empty {
    flex: 1;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    display: flex;
  }
}
</style>
