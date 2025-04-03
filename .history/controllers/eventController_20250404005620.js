const { Event, User, EventCategory, UserSavedEvent } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

exports.createEvent = async (req, res) => {
  try {
    const {
      title_en,
      title_fr,
      description_en,
      description_fr,
      latitude,
      longitude,
      start_time,
      end_time,
      category_id,
    } = req.body;

    const event = await Event.create({
      title_en,
      title_fr,
      description_en,
      description_fr,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
        crs: { type: "name", properties: { name: "EPSG:4326" } },
      },
      start_time,
      end_time,
      category_id,
      creator_id: req.user.id,
    });

    res.status(201).json({ message: req.t("event_created"), event });
  } catch (error) {
    res.status(500).json({ message: req.t("server_error") });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { category_id } = req.query;
    const where = {};

    if (category_id) {
      where.category_id = category_id;
    }

    const events = await Event.findAll({
      where,
      include: [
        { model: EventCategory, as: "category" },
        { model: User, as: "creator", attributes: ["id", "username"] },
      ],
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: req.t("server_error") });
  }
};

exports.getNearbyEvents = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    const user = await User.findByPk(req.user.id);

    const point = {
      type: "Point",
      coordinates: [
        longitude || user.location.coordinates[0],
        latitude || user.location.coordinates[1],
      ],
      crs: { type: "name", properties: { name: "EPSG:4326" } },
    };

    const events = await Event.findAll({
      where: sequelize.where(
        sequelize.fn(
          "ST_DWithin",
          sequelize.col("location"),
          sequelize.fn(
            "ST_SetSRID",
            sequelize.fn(
              "ST_MakePoint",
              point.coordinates[0],
              point.coordinates[1]
            ),
            4326
          ),
          radius * 1000 // Convert km to meters
        ),
        true
      ),
      include: [
        { model: EventCategory, as: "category" },
        { model: User, as: "creator", attributes: ["id", "username"] },
      ],
    });

    res.json({ message: req.t("events_nearby"), events });
  } catch (error) {
    res.status(500).json({ message: req.t("server_error") });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: EventCategory, as: "category" },
        { model: User, as: "creator", attributes: ["id", "username"] },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: req.t("event_not_found") });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: req.t("server_error") });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: req.t("event_not_found") });
    }

    if (event.creator_id !== req.user.id) {
      return res.status(403).json({ message: req.t("unauthorized") });
    }

    await event.update(req.body);
    res.json({ message: req.t("event_updated"), event });
  } catch (error) {
    res.status(500).json({ message: req.t("server_error") });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: req.t("event_not_found") });
    }

    if (event.creator_id !== req.user.id) {
      return res.status(403).json({ message: req.t("unauthorized") });
    }

    await event.destroy();
    res.json({ message: req.t("event_deleted") });
  } catch (error) {
    res.status(500).json({ message: req.t("server_error") });
  }
};

exports.saveEvent = async (req, res) => {
  try {
    await UserSavedEvent.findOrCreate({
      where: {
        user_id: req.user.id,
        event_id: req.params.id,
      },
    });

    res.json({ message: req.t("event_saved") });
  } catch (error) {
    res.status(500).json({ message: req.t("server_error") });
  }
};

exports.unsaveEvent = async (req, res) => {
  try {
    const result = await UserSavedEvent.destroy({
      where: {
        user_id: req.user.id,
        event_id: req.params.id,
      },
    });

    if (result === 0) {
      return res.status(404).json({ message: req.t("event_not_saved") });
    }

    res.json({ message: req.t("event_unsaved") });
  } catch (error) {
    res.status(500).json({ message: req.t("server_error") });
  }
};
