const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    rollNo: {
      type: String,
      required: true
    },
    passingYear: {
      type: String,
      required: true
    },
    picture: {
      type: String,
      require:true
    },
  });

const Team = mongoose.model('Team', TeamSchema);
module.exports = Team;
