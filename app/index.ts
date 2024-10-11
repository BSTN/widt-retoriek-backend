import express from 'express'
import connection from "./connection";
import { Sequelize, DataTypes } from "sequelize";
import type { USERDATATABLE } from '../types/types'
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config()

const widtretoriekapp = express.Router()

widtretoriekapp.use(
  cors({
    origin: [
      new RegExp(/http:\/\/localhost$/),
      "http://localhost",
      new RegExp(/\.wie-is-de-trol\.nl$/),
      new RegExp(/\.wie-is-de-trol\.nl\/beatthebot$/),
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

widtretoriekapp.use(express.urlencoded({ extended: true }));
widtretoriekapp.use(express.json());

const sequelize = new Sequelize(
  connection.database,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: connection.host,
    // port: connection.port,
    dialect: "mariadb",
  }
);

const USERDATA = sequelize.define<USERDATATABLE>("userdata", {
  userid: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
  data: { type: DataTypes.TEXT },
});


USERDATA.sync().catch((err) => {
  console.warn('---\nCannot create table "USERDATA".\n---');
  console.warn(err);
});

widtretoriekapp.all('/save', async (req, res, next) => {

  if (!req.body) {
    res.send({no:'body'})
  }

  if (!req.body.userid) {
    res.send({ error: 'missing userid'})
  }

  // send to database
  USERDATA.upsert({ userid: req.body.userid, data: JSON.stringify(req.body.answers) })
  res.send({done: 'ok'})
})

widtretoriekapp.all('/download', async (req, res, next) => {

  // send to database
  res.send(await USERDATA.findAll())
})

widtretoriekapp.all('/random', async (req, res, next) => {

  const RANDOMOPTIONS = [1, 2, 3, 4]
  const results:any = {}
  RANDOMOPTIONS.map(x => {
    results[x] = 0
  })
  // find next random version
  const all = await USERDATA.findAll()

  all.map(x => {
    const data = JSON.parse(x.dataValues.data)
    if (data._random && RANDOMOPTIONS.includes(parseInt(data._random))) {
      results[data._random] += 1
    }
  })

  const inAnArray = []
  for (const key in results) {
    const value = results[key]
    inAnArray.push({key, value})
  }
  inAnArray.sort((a, b) => a.value > b.value ? -1 : 1)
  inAnArray.reverse()
  // const randomPositionOfTopThree = Math.floor(Math.random() * 2)
  res.send({ random: inAnArray[0].key })
})

widtretoriekapp.all('/distribution', async (req, res, next) => {

  const RANDOMOPTIONS = [1, 2, 3, 4]
  const results:any = {}
  RANDOMOPTIONS.map(x => {
    results[x] = 0
  })
  // find next random version
  const all = await USERDATA.findAll()
  all.map(x => {
    const data = JSON.parse(x.dataValues.data)
    if (data._random && parseInt(data._random) in RANDOMOPTIONS) {
      results[data._random] += 1
    }
  })

  res.send({
    totalRows: all.length,
    distribution: results
 })
})

widtretoriekapp.all('/backup', async (req, res, next) => {
  const all = await USERDATA.findAll({raw: true})
  const rows = []
  for (let i in all) {
    const row = Object.assign({}, all[i])
    if ('data' in row && typeof row.data === 'string') {
      const data = JSON.parse(row.data)
      rows.push(Object.assign(row, data))
      delete row.data
    }
  }
  // upload
  // Create a WebDAV client
  const { createClient } = await import("webdav")

  const client = createClient("https://surfdrive.surf.nl/files/public.php/webdav/",{username: process.env.SURFUSER,password: process.env.SURFPASS});
  try {
    // Upload the file to the WebDAV server
    const name = new Date().toLocaleString().replace(',', '').replace(/\//g, '-') + '.json';
    if (process.env.LOCAL) {
      res.send({ message: 'Not sending, local file.' })
    } else {
      const ret = await client.putFileContents(name, JSON.stringify(rows), { overwrite: false });
      if (ret) {
        res.send({ message: 'File uploaded successfully.' })
      } else {
        res.send({ message: 'Something went wrong.' })
      }
    }
    
  } catch (error) {
    res.send({ message: 'Error uploading file:', error });
  }

})


export { widtretoriekapp }


