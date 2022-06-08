const models = require('../models');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

class UserController {
  static register = async (req, res) => {
    const { email, password, role = 'ROLE_USER' } = req.body;
    if (!email || !password) {
      res.status(400).send('Please specify both email and password');
    } else {
      try {
        const hashedPassword = await argon2.hash(password);
        models.user
          .insert({ email, password: hashedPassword, role })
          .then(([result]) => {
            const id = result.insertId;
            res.status(201).json({ id, email, role });
          })
          .catch((error) => {
            console.error(error.message);
            res.status(500).send({
              error: error.message,
            });
          });
      } catch (error) {
        console.log(error.message);
        res.status(500).send({
          error: error.message,
        });
      }
    }
  };

  static login = (req, res) => {
    const { email, password } = req.body;

    if (!email && !password) {
      res.status(400).send('Please specify both email and password');
    } else {
      models.user
        .findByMail(email)
        .then(async ([rows]) => {
          if (rows[0] == null) {
            res.status(403).send('Invalid email');
          } else {
            const { id, email, password: hash, role } = rows[0];
            const validation = await argon2.verify(hash, password);
            if (validation) {
              const token = jwt.sign(
                {
                  id: id,
                  role: role,
                },
                process.env.JWT_AUTH_SECRET,
                { expiresIn: '1h' }
              );
              res
                .cookie('access_token', token, {
                  httpOnly: true,
                  // secure: process.env.NODE_ENV === 'production',
                })
                .status(200)
                .json({ id, email, role });
            } else {
              res.status(403).send({ Error: 'Invalid Password' });
            }
            // TODO send the response and the HTTP cookie
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send({
            error: err.message,
          });
        });
    }
  };

  static browse = (req, res) => {
    models.user
      .findAll()
      .then(([rows]) => {
        console.log(rows);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({
          error: err.message,
        });
      });
  };

  static logout = (req, res) => {
    // TODO remove JWT token from HTTP cookies
  };

  // TODO add `authorization` middleware here!

  // TODO add `isAdmin` middleware here!

  static edit = (req, res) => {
    const user = req.body;

    user.id = parseInt(req.params.id, 10);

    models.user
      .update(user)
      .then(([result]) => {
        if (result.affectedRows === 0) {
          res.sendStatus(404);
        } else {
          res.sendStatus(204);
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static delete = (req, res) => {
    models.user
      .delete(req.params.id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };
}

module.exports = UserController;
