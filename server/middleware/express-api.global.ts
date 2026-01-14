import { fromNodeMiddleware } from 'h3'
import { createExpressApp } from '../express'

const expressApp = createExpressApp()

export default fromNodeMiddleware((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '')
    return expressApp(req, res, next)
  } else {
    return next()
  }
})
