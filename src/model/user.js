async function createUser(name, email) {
  const newUser = await Entity.User.create({name, email});
  return newUser.toJSON();
}

async function getById(id) {
  const user = await Entity.User.findByPk(id);
  return user?.toJSON() || null;
}

module.exports = {
  create: createUser,
  getById: getById
}