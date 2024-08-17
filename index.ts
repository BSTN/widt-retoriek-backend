import express from 'express'
import {widtretoriekapp} from './app/index'
var cors = require('cors')
const app = express()

app.use(cors())

app.use(widtretoriekapp)

app.get('/', (req, res) => {
  res.send({test: "widt-retoriek-backend"})
})

app.listen(80)