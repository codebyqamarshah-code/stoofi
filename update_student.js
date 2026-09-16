const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/student.controller.js', 'utf8');

const getByIdStr = `
exports.getById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};
`;

content = content.replace("exports.create = async", getByIdStr + "\nexports.create = async");
fs.writeFileSync('server/src/controllers/student.controller.js', content);

let routesContent = fs.readFileSync('server/src/routes/student.routes.js', 'utf8');
routesContent = routesContent.replace(
  "const { getAll, create, update, remove, bulkCreate } = require('../controllers/student.controller');",
  "const { getAll, getById, create, update, remove, bulkCreate } = require('../controllers/student.controller');"
);
routesContent = routesContent.replace(
  "router.route('/:id').put(update).delete(remove);",
  "router.route('/:id').get(getById).put(update).delete(remove);"
);
fs.writeFileSync('server/src/routes/student.routes.js', routesContent);
