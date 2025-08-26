import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const addTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const {
      title,
      type = "NORMAL",
      tags = [],
      dueDate,
      repeat_interval,
      reminder_before,
      reminder_every,
      channel = [],
      completed = false
    } = req.body;

    const newTask = await prisma.task.create({
      data: {
        title,
        type,
        tags,
        due_date: dueDate ? new Date(dueDate) : null,
        repeat_interval,
        reminder_before,
        reminder_every,
        channel,
        completed,
        userId, // Associate task with user
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
};

const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const tasks = await prisma.task.findMany({
      where: { userId }, // Only get user's tasks
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

const addNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { title, content } = req.body;

    const newNote = await prisma.notes.create({
      data: {
        title,
        content,
        userId, // Associate note with user
      },
    });
    res.status(200).json(newNote);
  } catch (error) {
    console.error("Error adding notes:", error);
    res.status(500).json({ error: "Failed to add notes" });
  } 
}

const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const notes = await prisma.notes.findMany({
      where: { userId }, // Only get user's notes
    });
    res.status(200).json(notes);
  } catch (error) {   
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
}

const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Task id is required" });
    }
    const {
      title,
      type,
      tags,
      dueDate,
      repeat_interval,
      reminder_before,
      reminder_every,
      channel,
      completed
    } = req.body; 
    const updatedTask = await prisma.task.update({
      where: { 
        id: id as string,
        userId // Ensure user can only update their own tasks
      },
      data: {
        title,
        type,
        tags,
        due_date: dueDate ? new Date(dueDate) : null,
        repeat_interval,
        reminder_before,
        reminder_every,
        channel,
        completed
      },
    });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error); 
    res.status(500).json({ error: "Failed to update task" });
  }
};

const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Note id is required" });  
    }
    const { title, content } = req.body;
    const updatedNote = await prisma.notes.update({
      where: { 
        id: id as string,
        userId // Ensure user can only update their own notes
      },
      data: {
        title,
        content,
      },
    });
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Task id is required" });
    }
    await prisma.task.delete({
      where: { 
        id: id as string,
        userId // Ensure user can only delete their own tasks
      },
    });

    res.status(204).json({
      message: "Task deleted successfully"
    });
    console.log("Deleted task with id:", id);
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!id) {  
      return res.status(400).json({ error: "Note id is required" });
    }
    await prisma.notes.delete({
      where: { 
        id: id as string,
        userId // Ensure user can only delete their own notes
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};




// Update user profile
const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log('updateProfile: userId:', userId);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Only allow updating certain fields
    const {
      name,
      email,
      telegramBotToken,
      telegramChatId,
      discordBotToken,
      discordChannelId,
      gmailTo
    } = req.body;

    console.log('updateProfile: Request body:', req.body);

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (telegramBotToken !== undefined) updateData.telegramBotToken = telegramBotToken;
    if (telegramChatId !== undefined) updateData.telegramChatId = telegramChatId;
    if (discordBotToken !== undefined) updateData.discordBotToken = discordBotToken;
    if (discordChannelId !== undefined) updateData.discordChannelId = discordChannelId;
    if (gmailTo !== undefined) updateData.gmailTo = gmailTo;

    console.log('updateProfile: Update data:', updateData);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    console.log('updateProfile: Updated user from DB:', updatedUser);
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export { addTask, getTasks, addNotes, getNotes, updateTask, updateNote, deleteTask, deleteNote, updateProfile };