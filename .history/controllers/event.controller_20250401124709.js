// import eventModel from "../models/event.model.js";

// export const createEvent = async (req, res) => {
//   try {
//     const event = await eventModel.create({
//       ...req.body,
//       creator_id: req.userId,
//     });
//     res.status(201).json(event);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getNearbyEvents = async (req, res) => {
//   try {
//     const { longitude, latitude, radius = 10000 } = req.query;
//     const events = await eventModel.findNearby({ longitude, latitude, radius });
//     res.json(events);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// sh;
// export default {
//   createEvent,
//   getNearbyEvents,
// };
