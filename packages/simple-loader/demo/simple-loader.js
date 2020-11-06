(function (window, d) {
  const getTag = d.querySelector.bind(d)
  const getTags = d.querySelectorAll.bind(d)
  const modules = window.modules = Object.create(null)
  const [LOADING, LOADED] = [1, 2]

  const getCurrentScript = () => {
    try {
      a.b.c()
    } catch (e) {
      return e.stack.split(/\s/).pop().replace(/(.*)(([^.]+)\.js).*$/, '$3')
    }
  }

  const basePath = (() => {
    const lastScript = Array.from(getTags('script')).pop()
    return lastScript.src.replace(/[^/]+$/g, '')
  })()

  const load = (id, parent) => {
    if (!modules[id]) {
      modules[id] = { parents: [] }
      loadJs(id)
    }

    const parents = modules[id].parents

    if (!parents.includes(parent)) {
      parents.push(parent)
    }
  }

  const loadJs = (src) => {
    const script = d.createElement('script')

    script.addEventListener('load', function loadScript () {
      script.removeEventListener('load', loadScript)

      script.parentElement.removeChild(script)
    })

    script.src = src
    getTag('head').appendChild(script)
  }

  const parseId = (id) => {
    if (!/\.js$/.test(id)) {
      id += '.js'
    }

    return basePath + id
  }

  const isAllDepsLoaded = (deps) => {
    return deps.every(dep => modules[parseId(dep)].status === LOADED)
  }

  const fireFactory = (id) => {
    const { factory, parents, deps } = modules[id]

    if (!deps.length || isAllDepsLoaded(deps)) {
      if (typeof factory === 'function') {
        modules[id].exports = factory.call(
          factory, ...deps.map(dep => modules[parseId(dep)].exports)
        )

        if (parents) {
          parents.forEach(fireFactory)
        }
      }
    }
  }

  const require = (deps, factory, id) => {
    id = id || parseId(Number(new Date()))

    modules[id] = modules[id] || {
      factory,
      deps,
      status: LOADING
    }

    deps.forEach(dep => {
      const cId = parseId(dep)

      load(cId, id)
    })

    fireFactory(id)
  }

  const define = function (id, deps, factory) {
    const argLen = arguments.length

    if (argLen === 1) {
      factory = id
      deps = []
      id = getCurrentScript()
    }

    if (argLen === 2) {
      factory = deps
      deps = []
    }

    id = parseId(id)

    modules[id].status = LOADED
    modules[id].deps = deps
    modules[id].factory = factory

    require(deps, factory, id)
  }

  define.amd = {
    modules
  }

  window.require = require
  window.define = define
})(window, document)
