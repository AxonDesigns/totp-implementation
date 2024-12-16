import { db } from "@/db/database";
import { usersTable } from "@/db/schema/users";
import { genSalt, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

export const userSelectFields = {
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    password: usersTable.password,
    totpEnabled: usersTable.totpEnabled,
    createdAt: usersTable.createdAt,
    updatedAt: usersTable.updatedAt
}

const selectUsers = () => {
    return db.select(userSelectFields).from(usersTable);
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            res.status(400).json({ errors: results.array().map((err) => err.msg) });
            return;
        }
        const { limit, offset } = matchedData(req) as { limit?: number, offset?: number };

        const foundUsers = await selectUsers()
            .limit(limit ?? 20).offset(offset ?? 0);

        const users = foundUsers.map(({ password, ...payload }) => payload);

        res.json(users);
    } catch (error) {
        res.status(500).json({ errors: ["An error occurred"] });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            res.status(400).json({ errors: results.array().map((err) => err.msg) });
            return;
        }
        const { name, email, password } = matchedData(req) as {
            name: string,
            email: string,
            password: string
        };

        const existentUser = await db.select().from(usersTable)
            .where(eq(usersTable.email, email));
        if (existentUser.length > 0) {
            res.status(400).json({ errors: ["Email already exists"] });
            return;
        }

        const createdIds = await db.insert(usersTable).values({
            name,
            email,
            password: await hash(password, await genSalt()),
        }).returning({ id: usersTable.id });

        const createdUsers = await selectUsers()
            .where(eq(usersTable.id, createdIds[0].id));

        const { password: _, ...payload } = createdUsers[0];

        res.status(201).json(payload);
    } catch (error) {
        res.status(500).json({ errors: ["An error occurred"] });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            res.status(400).json({ errors: results.array().map((err) => err.msg) });
            return;
        }
        const { id } = matchedData(req) as { id: string };

        const foundUsers = await selectUsers().where(eq(usersTable.id, id));

        const { password: _, ...payload } = foundUsers[0];

        res.json(payload);
    } catch (error) {
        res.status(500).json({ errors: ["An error occurred"] });
    }
};

export const getUserByEmail = async (req: Request, res: Response) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            res.status(400).json({ errors: results.array().map((err) => err.msg) });
            return;
        }
        const { email } = matchedData(req) as { email: string };

        const foundUsers = await selectUsers().where(eq(usersTable.email, email));

        const { password: _, ...payload } = foundUsers[0];

        res.json(payload);
    } catch (error) {
        res.status(500).json({ errors: ["An error occurred"] });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            res.status(400).json({ errors: results.array().map((err) => err.msg) });
            return;
        }

        const { id, name, email, password } = matchedData(req) as {
            id: string,
            name?: string,
            email?: string,
            password?: string,
        };

        if (!name && !email && !password) {
            res.status(400).json({ errors: ["At least one field must be updated"] });
            return;
        }

        const foundUsers = await selectUsers().where(eq(usersTable.id, id))

        if (foundUsers.length === 0) {
            res.status(404).json({ errors: ["User not found"] });
            return;
        }

        await db.update(usersTable).set({
            name: foundUsers[0].name === name ? undefined : name,
            email: foundUsers[0].email === email ? undefined : email,
            password: password ? await hash(password, await genSalt()) : undefined,
        }).where(eq(usersTable.id, id));

        const updatedUsers = await selectUsers().where(eq(usersTable.id, id));

        const { password: _, ...payload } = updatedUsers[0];

        res.json(payload);
    } catch (error) {
        res.status(500).json({ errors: ["An error occurred"] });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            res.status(400).json({ errors: results.array().map((err) => err.msg) });
            return;
        }

        const { id } = matchedData(req) as { id: string };

        const foundUsers = await selectUsers().where(eq(usersTable.id, id))

        if (foundUsers.length === 0) {
            res.status(404).json({ errors: ["User not found"] });
            return;
        }

        await db.delete(usersTable).where(eq(usersTable.id, id));

        const { password: _, ...payload } = foundUsers[0];

        res.json(payload);
    } catch (error) {
        res.status(500).json({ errors: ["An error occurred"] });
    }
};