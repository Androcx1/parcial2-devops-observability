const express = require('express');
const db = require('../db/database');

const router = express.Router();


// ======================================================
// GET - OBTENER TODAS LAS TAREAS
// ======================================================

router.get('/', (req, res) => {
  db.all(
    `
    SELECT *
    FROM tasks
    ORDER BY id DESC
    `,
    [],
    (error, rows) => {
      if (error) {
        return res.status(500).json({
          error: 'Error al obtener las tareas',
        });
      }

      const tasks = rows.map((task) => ({
        ...task,
        completed: Boolean(task.completed),
      }));

      res.status(200).json(tasks);
    }
  );
});


// ======================================================
// POST - CREAR TAREA
// ======================================================

router.post('/', (req, res) => {
  const { title } = req.body;

  if (
    !title ||
    typeof title !== 'string' ||
    title.trim().length === 0
  ) {
    return res.status(400).json({
      error: 'El título es obligatorio',
    });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({
      error: 'El título no puede superar 100 caracteres',
    });
  }

  const cleanTitle = title.trim();
  const createdAt = new Date().toISOString();

  db.run(
    `
    INSERT INTO tasks (
      title,
      completed,
      created_at
    )
    VALUES (?, ?, ?)
    `,
    [
      cleanTitle,
      0,
      createdAt,
    ],
    function (error) {
      if (error) {
        return res.status(500).json({
          error: 'Error al crear la tarea',
        });
      }

      res.status(201).json({
        id: this.lastID,
        title: cleanTitle,
        completed: false,
        created_at: createdAt,
      });
    }
  );
});


// ======================================================
// PUT - ACTUALIZAR TAREA
// ======================================================

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({
      error: 'ID inválido',
    });
  }

  db.get(
    `
    SELECT *
    FROM tasks
    WHERE id = ?
    `,
    [id],
    (error, task) => {
      if (error) {
        return res.status(500).json({
          error: 'Error al consultar la tarea',
        });
      }

      if (!task) {
        return res.status(404).json({
          error: 'Tarea no encontrada',
        });
      }

      const newTitle =
        title !== undefined
          ? String(title).trim()
          : task.title;

      if (!newTitle) {
        return res.status(400).json({
          error: 'El título no puede estar vacío',
        });
      }

      if (newTitle.length > 100) {
        return res.status(400).json({
          error: 'El título no puede superar 100 caracteres',
        });
      }

      const newCompleted =
        completed !== undefined
          ? completed
            ? 1
            : 0
          : task.completed;

      db.run(
        `
        UPDATE tasks
        SET
          title = ?,
          completed = ?
        WHERE id = ?
        `,
        [
          newTitle,
          newCompleted,
          id,
        ],
        function (updateError) {
          if (updateError) {
            return res.status(500).json({
              error: 'Error al actualizar la tarea',
            });
          }

          res.status(200).json({
            id: Number(id),
            title: newTitle,
            completed: Boolean(newCompleted),
            created_at: task.created_at,
          });
        }
      );
    }
  );
});


// ======================================================
// DELETE - ELIMINAR TAREA
// ======================================================

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({
      error: 'ID inválido',
    });
  }

  db.run(
    `
    DELETE FROM tasks
    WHERE id = ?
    `,
    [id],
    function (error) {
      if (error) {
        return res.status(500).json({
          error: 'Error al eliminar la tarea',
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Tarea no encontrada',
        });
      }

      res.status(200).json({
        mensaje: 'Tarea eliminada correctamente',
      });
    }
  );
});


module.exports = router;