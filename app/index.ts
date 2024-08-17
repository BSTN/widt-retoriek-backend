import express from 'express'
import connection from "./connection";
import { Sequelize, DataTypes } from "sequelize";
import type { USERDATATABLE } from '../types/types'
import cors from 'cors';

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

  // send to database
  USERDATA.upsert({ userid: req.body.userid, data: JSON.stringify(req.body.answers) })
  res.send({done: 'ok'})
})

widtretoriekapp.all('/download', async (req, res, next) => {

  // send to database
  res.send(await USERDATA.findAll())
})

export { widtretoriekapp}