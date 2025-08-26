import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";
import zod from "zod";
import crypto from "crypto";
import NotificationService from '../services/NotificationService';

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

const changePasswordZodSchema = zod.object({
    currentPassword: zod.string().min(6).max(100),
    newPassword: zod.string().min(6).max(100)
});

const forgotPasswordZodSchema = zod.object({
    email: zod.string().email()
});

const resetPasswordZodSchema = zod.object({
    token: zod.string(),
    newPassword: zod.string().min(6).max(100)
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

const UpdateNotificationSettings = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

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

// Change Password Controller
const ChangePassword = async (req: Request, res: Response) => {
    const parseResult = changePasswordZodSchema.safeParse(req.body);
    
    if (!parseResult.success) {
        return res.status(400).json({ error: "Current password and new password are required" });
    }

    const { currentPassword, newPassword } = parseResult.data;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Forgot Password Controller
const ForgotPassword = async (req: Request, res: Response) => {
    const parseResult = forgotPasswordZodSchema.safeParse(req.body);
    
    if (!parseResult.success) {
        return res.status(400).json({ error: "Email is required" });
    }

    const { email } = parseResult.data;

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.json({ message: "If the email exists, a reset link has been sent" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token to database
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpires
            }
        });

        const emailSent = await NotificationService.sendPasswordResetEmail(email, resetToken);
        
        if (!emailSent) {
            console.error('Failed to send password reset email to:', email);
        }
        
        res.json({ 
            message: "If the email exists, a reset link has been sent"
        });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Reset Password Controller
const ResetPassword = async (req: Request, res: Response) => {
    const parseResult = resetPasswordZodSchema.safeParse(req.body);
    
    if (!parseResult.success) {
        return res.status(400).json({ error: "Reset token and new password are required" });
    }

    const { token, newPassword } = parseResult.data;

    try {
        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: {
                    gt: new Date() 
                }
            }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        });

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { Signup, Signin, GetUser, UpdateNotificationSettings, ChangePassword, ForgotPassword, ResetPassword };


