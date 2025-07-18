
// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    console.log('body', email);
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ msg: "user not found" })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
    const resetLink = `http://localhost:5000/api/resetPassword/${token}`
    res.status(200).json({ msg: "Reset link sent", resetLink })
  } catch (error) {
    console.error("Error while forgot password:", error);
    throw error;
  }
}

// reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params
  const { newPassword } = req.body

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(404).json({ msg: "user not found" })
    }
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.status(200).json({ msg: 'Password reset successfully' });
  } catch (err) {
    return res.status(400).json({ msg: 'Invalid or expired token' });
  }
}

router.post('/forgotPassword',forgotPassword)
router.post('/resetPassword/:token',resetPassword)