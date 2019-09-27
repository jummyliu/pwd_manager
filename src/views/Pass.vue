<template>
  <div class="pass">
    <transition name="slide-left-fade" mode="out-in">
      <el-row
        v-if="!isEdit"
        key="info"
        class="info"
        type="flex"
        justify="center"
        :gutter="20"
      >
        <el-button type="primary" circle icon="el-icon-plus" class="add-user" @click="beforeAdd"></el-button>
        <el-col class="header" :span="24">
          <el-input
            ref="search"
            class="search"
            :class="{ close: !isSearch }"
            placeholder="搜索"
            v-model="searchVal"
            clearable
            @blur="handleSearchBlur"
            @keyup.enter.native="beforeSearch"
            @clear="handleSearchClear"
          >
            <template #suffix>
              <el-button circle type="text" icon="el-icon-search" @click="handleOpenSearch"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col class="content">
          <appPaginationCard
            :data="data.lists.list"
            :count="data.lists.count"
            layout="->, prev, pager, next, total"
            v-loading="loading.lists"
          >
            <template #default="{ item, index }">
              <el-card class="box-card">
                <template #header>
                  <div class="card-header">
                    <span>
                      {{ index + 1 }}.
                      <AppCopy :content="item.title" />
                      <el-button type="text" icon="el-icon-more-outline"  @click="$set(item, 'flag', !item.flag)"></el-button>
                    </span>
                    <el-button-group>
                      <el-button type="text" icon="el-icon-copy-document"></el-button>
                      <el-button type="text" icon="el-icon-edit" @click="beforeEdit(item)"></el-button>
                      <el-button type="text" icon="el-icon-delete" @click="handleDelete(item.id)"></el-button>
                    </el-button-group>
                  </div>
                </template>
                <el-form size="mini" @submit.native="false">
                  <el-form-item label="地址">
                    <AppCopy :content="item.addr" />
                  </el-form-item>
                  <div v-if="item.flag">
                    <el-form-item label="分类" class="tag-container">
                      <el-tag type="primary" size="mini" v-for="tag in item.tag" :key="tag">{{ tag }}</el-tag>
                    </el-form-item>
                    <el-form-item label="帐号">
                      <AppCopy :content="item.name" />
                    </el-form-item>
                    <el-form-item label="密码">
                      <AppCopy :content="item.pass">
                        <template #default>
                          ********
                        </template>
                      </AppCopy>
                    </el-form-item>
                    <el-form-item label="描述">
                      <AppCopy :content="item.desc" />
                    </el-form-item>
                  </div>
                </el-form>
              </el-card>
            </template>
          </appPaginationCard>
        </el-col>
      </el-row>
      <el-row
        v-else
        key="edit"
        class="edit"
        type="flex"
        justify="center"
        :gutter="20"
      >
        <el-col class="header" :span="24">
          <el-page-header @back="cancelEdit">
            <template #content>
              <el-button-group>
                <el-button type="text" icon="el-icon-check" @click="handleSave" />
              </el-button-group>
            </template>
          </el-page-header>
        </el-col>
        <el-col class="content" :span="24">
          <el-form
            size="mini"
            label-position="top"
            :model="data.edit"
            :rules="rules.edit"
            ref="edit"
            v-loading="loading.edit"
          >
            <el-form-item label="标题" prop="title">
              <el-input v-model="data.edit.title" />
            </el-form-item>
            <el-form-item label="地址" prop="addr">
              <el-input v-model="data.edit.addr" />
            </el-form-item>
            <el-form-item label="分类" prop="tag" class="tag-container">
              <el-tag
                v-for="tag in data.edit.tag"
                :key="tag"
                closable
                size="medium"
                :disable-transitions="false"
                @close="handleRemoveTag(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-input v-if="tagVisible" size="mini" class="input-new-tag" ref="inputTag" v-model="tagVal" @keydown.enter.native.stop.prevent="handleTagConfirm" @blur="handleTagConfirm"></el-input>
              <el-button v-else ref="btnTag" size="mini" class="button-new-tag" @click="showTagInput" round icon="el-icon-plus">New Tag</el-button>
            </el-form-item>
            <el-form-item label="帐号" prop="name">
              <el-input v-model="data.edit.name" />
            </el-form-item>
            <el-form-item label="密码" prop="pass">
              <el-input v-model="data.edit.pass" type="password" />
            </el-form-item>
            <el-form-item label="描述" prop="desc">
              <el-input v-model="data.edit.desc" type="textarea" :rows="3" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </transition>
  </div>
</template>

<script>
import api from '@/api'
import { resetForm } from '@/utils'
import Clipboard from '@/utils/clip'

let clip = null

export default {
  data () {
    return {
      isEdit: false,
      isSearch: false,

      searchVal: '',

      tagVal: '',
      tagVisible: false,

      tableParams: {
        page: 1,
        size: 10
      },

      data: {
        lists: {
          count: 10,
          list: []
        },
        edit: {}
      },
      rules: {
        edit: {
          title: [
            { required: true, message: '标题不能为空', trigger: 'blur' }
          ],
          addr: [
            { required: true, message: '地址不能为空', trigger: 'blur' }
          ]
        }
      },
      loading: {
        lists: false,
        edit: false
      },
      timeout: {
        search: null
      }
    }
  },
  mounted () {
    clip = new Clipboard()
    this.$nextTick(() => {
      this.beforeSearch()
    })
  },
  destroyed () {
    cilp.destroy()
    clip = null
  },
  methods: {
    resetForm (formName) {
      resetForm(this, formName)
    },
    handleOpenSearch () {
      if (!this.isSearch) {
        this.isSearch = !this.isSearch
        this.$refs.search.focus()
      } else {
        this.beforeSearch()
      }
    },
    handleSearchClear () {
      this.$refs.search.focus()
    },
    handleSearchBlur () {
      if (!this.searchVal) {
        this.isSearch = false
      }
    },
    sizeChange (val) {
      this.tableParams.size = val
      return true
    },
    currentChange (val) {
      this.tableParams.page = val
      return true
    },
    beforeSearch () {
      this.clearSearchTimeout()
      this.tableParams.page = 1
      this.data.lists = {
        count: 0,
        list: []
      }
      this.doSearch()
    },
    async doSearch () {
      this.loading.lists = true
      const result = await api.pass.search({
        ...this.tableParams,
        search: this.searchVal
      })
      this.data.lists.count = result.count
      this.data.lists.list = result.list.map(item => ({
        ...item,
        flag: true
      }))
      this.loading.lists = false
    },
    beforeEdit (row) {
      this.data.edit = {
        ...row
      }
      this.isEdit = true
    },
    beforeAdd () {
      this.data.edit = {
        tag: []
      }
      this.isEdit = true
    },
    handleRemoveTag (tag) {
      this.data.edit.tag = this.data.edit.tag.filter(item => item !== tag)
    },
    showTagInput () {
      this.tagVisible = true
      this.$nextTick(() => {
        this.$refs.inputTag.focus()
      })
    },
    handleTagConfirm () {
      if (this.tagVal) {
        this.data.edit.tag.push(this.tagVal)
      }
      this.tagVisible = false
      this.tagVal = ''
      this.$nextTick(() => {
        this.$refs.btnTag.$el.focus()
      })
    },
    async handleSave () {
      if (this.loading.edit) return
      this.$refs.edit.validate(async (valid) => {
        if (valid) {
          this.loading.edit = true
          if (this.data.edit.id) {
            await api.pass.update(this.data.edit)
          } else {
            await api.pass.add(this.data.edit)
          }
          this.cancelEdit()
          this.doSearch()
          this.loading.edit = false
        }
      })
    },
    async handleDelete (id) {
      if (await this.$confirm('删除后将不能恢复，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'confirm',
        showClose: false
      }).catch(() => false)) {
        await api.pass.deleteInfo({ id })
        this.doSearch()
      }
    },
    cancelEdit () {
      this.resetForm('edit')
      this.data.edit = {}
      this.isEdit = false
      this.tagVisible = false
      this.tagVal = ''
    },
    clearSearchTimeout () {
      if (this.timeout.search) {
        clearTimeout(this.timeout.search)
      }
    }
  },
  watch: {
    tableParams: {
      handler () {
        this.doSearch()
      },
      deep: true
    },
    searchVal (val) {
      this.clearSearchTimeout()
      this.timeout.search = setTimeout(() => {
        this.beforeSearch()
      }, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
.pass {
  height: 100%;

  .el-row--flex {
    display: flex;
    flex-direction: column;

    .el-col:last-child {
      padding-bottom: 0;
    }
  }

  .add-user {
    position: absolute;
    z-index: 1000;
    right: 30px;
    bottom: 50px;
  }

  .header {
    display: flex;
    justify-content: flex-end;

    .search {
      transition: all .4s ease;

      /deep/ .el-input__inner {
        transition: all .4s ease;
        border-radius: 1000px;
        padding-right: 60px;
      }

      /deep/ .el-input__suffix {
        padding: 0 0;
        right: 0;

        .el-input__suffix-inner {
          display: flex;
          flex-direction: row-reverse;
        }
      }

      &.close {
        width: 40px;

        /deep/ .el-input__inner {
          padding: 19px;
        }
      }
    }

    .el-page-header {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .content {
    overflow: auto;
    flex: 1;
    margin-right: -7px;
    width: auto;

    .box-card {
      font-size: 14px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .el-button--text {
          padding: 0;

          &:not(:last-child) {
            margin-right: 10px;
          }
        }
      }

      .el-form-item--mini.el-form-item {
        margin-bottom: 0px;
      }
    }

    .el-form-item:last-child {
      margin-bottom: 0;
    }
  }

  .tag-container {
    // display: flex;
    // align-items: center;

    /deep/ .el-form-item__content {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    .el-tag {
      border-radius: 1000px;
      margin-right: 10px;
      margin-top: 2px;
      margin-bottom: 2px;
    }
    .button-new-tag {
      height: 28px;
      margin-top: 2px;
      margin-bottom: 2px;
    }
    .input-new-tag {
      width: 90px;
      margin-top: 2px;
      margin-bottom: 2px;
    }
  }
}
</style>
