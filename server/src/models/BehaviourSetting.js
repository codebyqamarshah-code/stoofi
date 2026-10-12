const mongoose = require('mongoose');

const behaviourSettingSchema = new mongoose.Schema({
  commentOption: {
    type: String,
    default: 'Optional'
  },
  viewOption: {
    type: String,
    default: 'Student & Parent'
  },
  viewIncidentInStudentPortal: {
    type: Boolean,
    default: true
  },
  viewIncidentInParentPortal: {
    type: Boolean,
    default: true
  },
  viewIncidentInTeacherPortal: {
    type: Boolean,
    default: true
  },
  notifyParentsOnNegative: {
    type: Boolean,
    default: true
  },
  warningLetterThreshold: {
    type: Number,
    default: -15
  },
  awardCertificateThreshold: {
    type: Number,
    default: 30
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BehaviourSetting', behaviourSettingSchema);
