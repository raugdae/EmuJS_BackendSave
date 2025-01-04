const express = require ('express');
const router = express.Router();
const pool = require('./../db');
const authMiddleware = require('./authMiddleware');
const fs = require('fs').promise
