import axios from 'axios'

export default function (url, extraOptions) {
  let defaultOptions = { baseURL: url }
  let options = Object.assign(defaultOptions, extraOptions || {})
  return axios.create(options)
}
