const fs = require('fs');

let teacherCtrl = fs.readFileSync('server/src/controllers/teacher.controller.js', 'utf8');
const getByIdStr = `
exports.getById = async (req, res, next) => {
  try {
    const data = await Teacher.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
teacherCtrl = teacherCtrl + "\n" + getByIdStr;
fs.writeFileSync('server/src/controllers/teacher.controller.js', teacherCtrl);

let teacherRoute = fs.readFileSync('server/src/routes/teacher.routes.js', 'utf8');
teacherRoute = teacherRoute.replace(
  "const { getAll } = require('../controllers/teacher.controller');",
  "const { getAll, getById } = require('../controllers/teacher.controller');"
);
teacherRoute = teacherRoute.replace(
  "router.route('/').get(getAll);",
  "router.route('/').get(getAll);\nrouter.route('/:id').get(getById);"
);
fs.writeFileSync('server/src/routes/teacher.routes.js', teacherRoute);
