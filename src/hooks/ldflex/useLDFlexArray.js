import React, { useState, useEffect } from "react"
import { useLiveUpdate } from '@solid/react'
import { getValArray } from "../../singletons/QueryEngine"

const useLDFlexArray = (...queryparameters) => {
  const [value, setValue] = useState(null)
  useEffect(() => {
    let mounted = true
    getValArray(...queryparameters).then(val => {
      if (val && mounted) return setValue(val)
    })
    return () => {
      mounted = false;
    }
  }, [])

  return value
}

const useLDFlexArrayOptions = (options) => {
  const [state, setState] = useState(false)
  const liveupdate = useLiveUpdate(options.queryparameters[0])
  useEffect(() => {
    let mounted = true
    getValArray(...options.queryparameters).then(val => {
      if (val && mounted) {
        setState({loaded: true, value: val})
      }
    })
    return () => {
      mounted = false;
    }
  }, [liveupdate])

  return state;
}

export {
  useLDFlexArray,
  useLDFlexArrayOptions
}