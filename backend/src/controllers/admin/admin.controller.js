const response = require("../../utils/response.util");

exports.getDashboard = async (req, res) => {
  try {
    response.success(res, "Dashboard Admin");
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user)
      return response.error(res, "User tidak ditemukan", 404);

    const rawPassword = await resetUserPassword(user);

    return response.success(res, "Password berhasil direset", {
      username: user.username,
      password: rawPassword
    });

  } catch (err) {
    return response.error(res, err.message);
  }
};
