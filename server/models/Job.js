import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: String,
  location: String,
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract'] },
  salary: {
    min: Number,
    max: Number,
    currency: String,
  },
  requirements: [String],
  responsibilities: [String],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  postedDate: { type: Date, default: Date.now },
  deadline: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
