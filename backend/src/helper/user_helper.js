const argon2 = require('argon2');

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  const status = await argon2.verify(
    hashedPassword,
    plainPassword,
    hashingOptions
  );
  console.log(status);
  return status;
};

module.exports = {
  // ...other exports...
  hashPassword,
  verifyPassword,
};
