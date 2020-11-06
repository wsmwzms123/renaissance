class Vnode {
  constructor (tag, children, text, el) {
    this.tag = tag
    this.children = children || []
    this.text = text
    this.el = el
  }
}

function removeNode (el) {
  const { parentElement: parentEl } = el
  if (parentEl) {
    parentEl.removeChild(el)
  }
}

function createTextNode (data) {
  return document.createTextNode(data)
}

function createEl (vnode, parentEl, refEl) {
  const { tag, children = [], text } = vnode
  const el = !tag
    ? createTextNode(text)
    : document.createElement(tag)

  children.forEach(child => {
    createEl(child, el)
  })

  if (!parentEl) {
    return el
  }

  if (refEl) {
    parentEl.insertBefore(el, refEl)
  } else {
    parentEl.appendChild(el)
  }
}

function sameVnode (oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag
}

function patch (oldVnode, newVnode) {
  const el = newVnode.el = oldVnode.el

  if (sameVnode(oldVnode, newVnode)) {
  } else {
    const { parentElement: parentEl, nextSibling: refEl } = el
    if (parentEl) {
      createEl(newVnode, parentEl, refEl)
      removeNode(el)
    }
  }
}
