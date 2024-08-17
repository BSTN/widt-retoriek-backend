"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./app/index");
var cors = require('cors');
const app = (0, express_1.default)();
app.use(cors());
app.use(index_1.widtretoriekapp);
app.get('/', (req, res) => {
    res.send({ test: "widt-retoriek-backend" });
});
app.listen(80);
