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
    // send to database
    USERDATA.upsert({ userid: req.body.userid, data: JSON.stringify(req.body.answers) });
    res.send({ done: 'ok' });
}));
widtretoriekapp.all('/download', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // send to database
    res.send(yield USERDATA.findAll());
}));
