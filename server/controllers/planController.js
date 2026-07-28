import Plan from '../models/Plan.js';
import { validateCreatePlan } from '../middlewares/validation.js';

const createPlan = async (req, res, next) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, data: plan, message: 'Plan created successfully' });
  } catch (error) {
    next(error);
  }
};

const getPlans = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const plans = await Plan.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    Object.assign(plan, req.body);
    const updated = await plan.save();
    res.json({ success: true, data: updated, message: 'Plan updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await plan.deleteOne();
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export { createPlan, getPlans, getPlanById, updatePlan, deletePlan };
