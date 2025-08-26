import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";
import zod from "zod";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email?: string;
            };
        }
    }
}

const signUpZodSchema = zod.object({
    username: zod.string().min(3).max(30),
    email: zod.string().email(),
    password: zod.string().min(6).max(100)  
});

const signipZodSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6).max(100)  
});


const prisma = new PrismaClient();
dotenv.config();


const Signup = async (req: Request, res: Response) => {

    const parseResult = signUpZodSchema.safeParse(req.body);

    if (!parseResult.success) {
        return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const { username, email, password } = parseResult.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                name: username,
                email,
                password: hashedPassword,
            },
        });

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'defaultsecret',
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



const Signin = async (req: Request, res: Response) => {

    const parseResult = signipZodSchema.safeParse(req.body);

    if (!parseResult.success) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    
    const { email, password } = parseResult.data;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'defaultsecret',
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


const GetUser = async (req: Request, res: Response) => {
    // userId is guaranteed by authMiddleware
    const userId = req.user!.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                id: true, 
                name: true, 
                email: true,
                telegramBotToken: true,
                telegramChatId: true,
                discordBotToken: true,
                discordChannelId: true,
                gmailTo: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// PATCH /api/user/notification-settings
const UpdateNotificationSettings = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    // Only allow updating these fields
    const {
        telegramBotToken,
        telegramChatId,
        discordBotToken,
        discordChannelId,
        gmailTo
    } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(telegramBotToken !== undefined && { telegramBotToken }),
                ...(telegramChatId !== undefined && { telegramChatId }),
                ...(discordBotToken !== undefined && { discordBotToken }),
                ...(discordChannelId !== undefined && { discordChannelId }),
                ...(gmailTo !== undefined && { gmailTo })
            },
            select: {
                id: true,
                name: true,
                email: true,
                telegramBotToken: true,
                telegramChatId: true,
                discordBotToken: true,
                discordChannelId: true,
                gmailTo: true
            }
        });
        res.json({ user: updatedUser });
    } catch (error) {
        console.error("Error updating notification settings:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { Signup, Signin, GetUser, UpdateNotificationSettings };


