const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require("../middleware/roleMiddleware");

router.post('/auth/login', userCtrl.login);
router.post('/auth/logout', auth, userCtrl.logout);

router.post('/users', userCtrl.createUser);
router.get('/users', auth, userCtrl.listUsers);
router.get('/users/:id', auth, userCtrl.getUser);
//router.put('/users/:id', auth, userCtrl.updateUser);
router.delete('/users/:id', auth, role(["admin","manager"]), userCtrl.deleteUser);

router.put('/users/:id', auth, role(["admin","manager"]), userCtrl.updateUser);

router.post("/users/forgot-password", userCtrl.forgotPassword);
//router.post("/users/reset-password", userCtrl.resetPassword);
router.post("/users/reset-password/:token", userCtrl.resetPassword);


module.exports = router;
