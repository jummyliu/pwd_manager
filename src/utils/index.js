/**
 * 重置表单数据（主要是重置搜索数据）
 *
 * @param {import("vue").Component} component vue component 实例
 * @param {String} formName 表单名
 */
export const resetForm = (component, formName) => {
  if (component.$refs[formName]) {
    component.$refs[formName].resetFields()
  }
  if (component[formName]) {
    component[formName].extract = {}
    component[formName].from = ''
  }
}
