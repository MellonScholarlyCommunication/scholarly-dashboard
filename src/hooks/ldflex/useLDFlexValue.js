import React, { useState, useEffect } from "react"
import { useLiveUpdate } from '@solid/react'
import { getVal } from "../../singletons/QueryEngine"

const useLDFlexValue = (...queryparameters) => {
  const [state, setstate] = useState(null)
  useEffect(() => {
    let mounted = true
    getVal(...queryparameters).then(value => {
      if (value && mounted) return setstate(value)
    })
    return () => {
      mounted = false;
    }
  }, [])

  return state
}

const useLDFlexValueOptions = (options) => {
  const [state, setState] = useState(false)
  const liveupdate = useLiveUpdate(options.queryparameters[0])
  useEffect(() => {
    let mounted = true
    getVal(...options.queryparameters).then(val => {
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
  useLDFlexValue,
  useLDFlexValueOptions
}