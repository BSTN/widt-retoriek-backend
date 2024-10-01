"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.widtretoriekapp = void 0;
const express_1 = __importDefault(require("express"));
const connection_1 = __importDefault(require("./connection"));
const sequelize_1 = require("sequelize");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const widtretoriekapp = express_1.default.Router();
exports.widtretoriekapp = widtretoriekapp;
widtretoriekapp.use((0, cors_1.default)({
    origin: [
        new RegExp(/http:\/\/localhost$/),
        "http://localhost",
        new RegExp(/\.wie-is-de-trol\.nl$/),
        new RegExp(/\.wie-is-de-trol\.nl\/beatthebot$/),
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));
widtretoriekapp.use(express_1.default.urlencoded({ extended: true }));
widtretoriekapp.use(express_1.default.json());
const sequelize = new sequelize_1.Sequelize(connection_1.default.database, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: connection_1.default.host,
    // port: connection.port,
    dialect: "mariadb",
});
const USERDATA = sequelize.define("userdata", {
    userid: { type: sequelize_1.DataTypes.STRING, allowNull: false, primaryKey: true },
    data: { type: sequelize_1.DataTypes.TEXT },
});
USERDATA.sync().catch((err) => {
    console.warn('---\nCannot create table "USERDATA".\n---');
    console.warn(err);
});
widtretoriekapp.all('/save', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.send({ no: 'body' });
    }
    if (!req.body.userid) {
        res.send({ error: 'missing userid' });
    }
    // send to database
    USERDATA.upsert({ userid: req.body.userid, data: JSON.stringify(req.body.answers) });
    res.send({ done: 'ok' });
}));
widtretoriekapp.all('/download', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // send to database
    res.send(yield USERDATA.findAll());
}));
widtretoriekapp.all('/random', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const RANDOMOPTIONS = [1, 2, 3, 4];
    const results = {};
    RANDOMOPTIONS.map(x => {
        results[x] = 0;
    });
    // find next random version
    const all = yield USERDATA.findAll();
    all.map(x => {
        const data = JSON.parse(x.dataValues.data);
        if (data._random && RANDOMOPTIONS.includes(data._random)) {
            results[data._random] += 1;
        }
    });
    const inAnArray = [];
    for (const key in results) {
        const value = results[key];
        inAnArray.push({ key, value });
    }
    inAnArray.sort((a, b) => a.value > b.value ? -1 : 1);
    inAnArray.reverse();
    const randomPositionOfTopThree = Math.floor(Math.random() * 3);
    res.send({ random: inAnArray[randomPositionOfTopThree].key });
}));
widtretoriekapp.all('/distribution', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const RANDOMOPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
    const results = {};
    RANDOMOPTIONS.map(x => {
        results[x] = 0;
    });
    // find next random version
    const all = yield USERDATA.findAll();
    all.map(x => {
        const data = JSON.parse(x.dataValues.data);
        if (data._random) {
            results[data._random] += 1;
        }
    });
    res.send({
        totalRows: all.length,
        distribution: results
    });
}));
widtretoriekapp.all('/backup', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const all = yield USERDATA.findAll({ raw: true });
    const rows = [];
    for (let i in all) {
        const row = Object.assign({}, all[i]);
        if ('data' in row && typeof row.data === 'string') {
            const data = JSON.parse(row.data);
            rows.push(Object.assign(row, data));
            delete row.data;
        }
    }
    // upload
    // Create a WebDAV client
    const { createClient } = yield import("webdav");
    const client = createClient("https://surfdrive.surf.nl/files/public.php/webdav/", { username: process.env.SURFUSER, password: process.env.SURFPASS });
    try {
        // Upload the file to the WebDAV server
        const name = new Date().toLocaleString().replace(',', '').replace(/\//g, '-') + '.json';
        if (process.env.LOCAL) {
            res.send({ message: 'Not sending, local file.' });
        }
        else {
            const ret = yield client.putFileContents(name, JSON.stringify(rows), { overwrite: false });
            if (ret) {
                res.send({ message: 'File uploaded successfully.' });
            }
            else {
                res.send({ message: 'Something went wrong.' });
            }
        }
    }
    catch (error) {
        res.send({ message: 'Error uploading file:', error });
    }
}));
