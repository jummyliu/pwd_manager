import { ipcRenderer } from 'electron'

export const search = async (payload) => {
  ipcRenderer.send('pass-search', payload)
  return new Promise(resolve => {
    ipcRenderer.once('pass-search-reply', (event, arg) => {
      resolve(arg)
    })
  })
}

export const add = async (payload) => {
  ipcRenderer.send('pass-add', payload)
}

export const update = async (payload) => {
  ipcRenderer.send('pass-update', payload)
}

export const deleteInfo = async (payload) => {
  ipcRenderer.send('pass-delete', payload)
}
