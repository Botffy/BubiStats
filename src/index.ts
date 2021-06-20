import * as _ from 'lodash'

function component() {
  console.log('hi')
  const element = document.createElement('div')
  element.innerHTML = 'hi'
  return element
}
document.body.appendChild(component())
